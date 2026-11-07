/** Operações de administração do provedor de login, chamadas só pelo servidor. */
export interface AuthAdmin {
  /** Apaga o usuário no provedor de login. Usuário que já não existe conta como sucesso. */
  deleteUser(id: string): Promise<void>;
}

/** Supabase Auth Admin API. Exige a chave `service_role`, que só pode existir no servidor (nunca no app). */
export function supabaseAdmin(o: { url: string; serviceRoleKey: string; fetchFn?: typeof fetch }): AuthAdmin {
  const base = `${o.url.replace(/\/$/, '')}/auth/v1/admin/users`;
  const doFetch = o.fetchFn ?? fetch;
  return {
    async deleteUser(id) {
      const res = await doFetch(`${base}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { apikey: o.serviceRoleKey, authorization: `Bearer ${o.serviceRoleKey}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 404 || res.ok) return;
      throw new Error(`Supabase Admin respondeu ${res.status}`);
    },
  };
}
