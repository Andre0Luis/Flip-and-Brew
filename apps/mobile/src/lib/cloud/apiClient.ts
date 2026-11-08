// Cliente HTTP da nossa API (apps/api). Puro: só `fetch`, sem React Native e sem alias do app, para o `ci-api`
// poder testá-lo contra a API de verdade (apps/api/src/mobile-contract.test.ts) e os dois lados não divergirem.

/** O backup como a API o guarda: o mesmo documento do Firestore (`SnapshotData`), que o servidor só armazena. */
export type SnapshotWire = { v: 1; updatedAt: number; data: Record<string, unknown> };

export type Language = 'pt' | 'en' | 'es';

/** Erro de uma chamada à API. `status` 0 significa que nem chegou ao servidor (sem rede, tempo esgotado). */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'ApiError';
  }
}

/** Uma pessoa como aparece em listas (busca, pedidos, amigos). */
export type Person = { id: string; handle: string | null; displayName: string | null; avatarPath: string | null };
export type Relation = 'self' | 'none' | 'friends' | 'request_sent' | 'request_received';
export type FriendRequest = Person & { requestId: string; createdAt: string };
export type Friend = Person & { since: string | null };
export type PublicProfile = {
  profile: Person & { bio: string | null; country: string | null; joinedAt: string };
  relation: Relation;
  prefs: { favoriteCoffees: string[]; methods: string[]; roast: string | null; flavors: string[] } | null;
};
/** O que a comunidade precisa do meu perfil no servidor: o apelido (sem ele ninguém me acha) e o nome. */
export type MyCommunityProfile = { handle: string | null; displayName: string | null };

/** Amizade com aprovação, bloqueio e perfil público (ADR-0024). */
export type CommunityApi = {
  me(): Promise<MyCommunityProfile>;
  /** Erros: `handle_taken` (apelido em uso) e `invalid_input` (formato). */
  updateMe(patch: { handle?: string; displayName?: string }): Promise<MyCommunityProfile>;
  /** Busca pelo começo do apelido (2 a 20 letras minúsculas, números ou _). */
  search(q: string): Promise<Person[]>;
  /** `null` se a pessoa não existe ou se há bloqueio entre vocês. */
  user(handle: string): Promise<PublicProfile | null>;
  /** `accepted` é verdadeiro quando a outra pessoa já tinha pedido: viram amigos na hora. */
  requestFriend(userId: string): Promise<{ accepted: boolean }>;
  requests(direction: 'incoming' | 'outgoing'): Promise<FriendRequest[]>;
  accept(requestId: string): Promise<void>;
  /** Recusa (quem recebeu) ou cancela (quem enviou). */
  removeRequest(requestId: string): Promise<void>;
  friends(): Promise<Friend[]>;
  unfriend(userId: string): Promise<void>;
  block(userId: string): Promise<void>;
  unblock(userId: string): Promise<void>;
};

export type ApiClient = {
  /** Cria o perfil na primeira vez (idempotente) e dispara o e-mail de boas-vindas, uma vez só. */
  bootstrap(language?: Language): Promise<{ created: boolean; profile: { id: string; email: string; role: string } }>;
  /** `null` quando ainda não há backup. */
  getSnapshot(): Promise<SnapshotWire | null>;
  /** `stale` quando o servidor já tem um backup mais novo (não é erro: o próximo ciclo resolve). */
  putSnapshot(snapshot: SnapshotWire): Promise<'saved' | 'stale'>;
  /** Apaga a conta e tudo o que depende dela no servidor. */
  deleteAccount(): Promise<void>;
  community: CommunityApi;
};

export function createApiClient(o: {
  baseUrl: string;
  /** O token de acesso atual (o login renova sozinho); `null` se não há ninguém logado. */
  getToken: () => Promise<string | null>;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
}): ApiClient {
  const base = o.baseUrl.replace(/\/+$/, '');
  const doFetch = o.fetchFn ?? fetch;

  async function call(method: string, path: string, body?: unknown): Promise<{ status: number; json: any }> {
    const token = await o.getToken();
    if (!token) throw new ApiError(401, 'unauthorized', 'Sem login.');
    let res: Response;
    try {
      res = await doFetch(`${base}${path}`, {
        method,
        headers: { authorization: `Bearer ${token}`, accept: 'application/json', ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(o.timeoutMs ?? 15_000),
      });
    } catch (e) {
      throw new ApiError(0, 'network', (e as Error).message);
    }
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // resposta que não é JSON (por exemplo, uma página de erro do provedor)
    }
    return { status: res.status, json };
  }

  const fail = (r: { status: number; json: any }): never => {
    throw new ApiError(r.status, r.json?.error?.code ?? `http_${r.status}`, r.json?.error?.message);
  };
  const ok = (r: { status: number; json: any }) => {
    if (r.status < 200 || r.status >= 300) fail(r);
    return r.json;
  };
  const mine = (j: any): MyCommunityProfile => ({ handle: j?.profile?.handle ?? null, displayName: j?.profile?.displayName ?? null });
  const id = (v: string) => encodeURIComponent(v);

  const community: CommunityApi = {
    me: async () => mine(ok(await call('GET', '/v1/me'))),
    updateMe: async (patch) => mine(ok(await call('PATCH', '/v1/me', patch))),
    search: async (q) => ok(await call('GET', `/v1/users/search?q=${id(q)}`)).users as Person[],
    async user(handle) {
      const r = await call('GET', `/v1/users/${id(handle)}`);
      if (r.status === 404) return null;
      return ok(r) as PublicProfile;
    },
    requestFriend: async (userId) => ({ accepted: !!ok(await call('POST', '/v1/friend-requests', { userId })).accepted }),
    requests: async (direction) => ok(await call('GET', `/v1/me/friend-requests?direction=${direction}`)).requests as FriendRequest[],
    accept: async (requestId) => void ok(await call('POST', `/v1/friend-requests/${id(requestId)}/accept`)),
    removeRequest: async (requestId) => void ok(await call('DELETE', `/v1/friend-requests/${id(requestId)}`)),
    friends: async () => ok(await call('GET', '/v1/me/friends')).friends as Friend[],
    unfriend: async (userId) => void ok(await call('DELETE', `/v1/friends/${id(userId)}`)),
    block: async (userId) => void ok(await call('POST', '/v1/blocks', { userId })),
    unblock: async (userId) => void ok(await call('DELETE', `/v1/blocks/${id(userId)}`)),
  };

  return {
    async bootstrap(language) {
      const r = await call('POST', '/v1/me/bootstrap', language ? { language } : {});
      if (r.status !== 200 && r.status !== 201) fail(r);
      return { created: !!r.json.created, profile: r.json.profile };
    },
    async getSnapshot() {
      const r = await call('GET', '/v1/me/snapshot');
      if (r.status === 404) return null;
      if (r.status !== 200) fail(r);
      return { v: 1, updatedAt: r.json.updatedAt, data: r.json.data };
    },
    async putSnapshot(snapshot) {
      const r = await call('PUT', '/v1/me/snapshot', { v: snapshot.v, updatedAt: snapshot.updatedAt, data: snapshot.data });
      if (r.status === 409 && r.json?.error?.code === 'stale_snapshot') return 'stale';
      if (r.status !== 200) fail(r);
      return 'saved';
    },
    async deleteAccount() {
      const r = await call('DELETE', '/v1/me');
      if (r.status !== 204 && r.status !== 404) fail(r);
    },
    community,
  };
}
