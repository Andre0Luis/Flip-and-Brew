import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, createApiClient } from './apiClient';

type Call = { url: string; method: string; headers: Record<string, string>; body: unknown };

/** `fetch` falso: devolve as respostas na ordem e anota o que foi pedido. */
function fakeFetch(...responses: (Response | Error)[]) {
  const calls: Call[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, method: init.method ?? 'GET', headers: init.headers as Record<string, string>, body: init.body ? JSON.parse(init.body as string) : undefined });
    const r = responses.shift();
    if (!r) throw new Error('resposta não prevista');
    if (r instanceof Error) throw r;
    return r;
  }) as unknown as typeof fetch;
  return { fn, calls };
}
const json = (status: number, body?: unknown) => new Response(body === undefined ? null : JSON.stringify(body), { status });
const client = (f: ReturnType<typeof fakeFetch>, token: string | null = 'tok') => createApiClient({ baseUrl: 'https://api.exemplo.com/', getToken: async () => token, fetchFn: f.fn });

test('toda chamada leva o token em Authorization e a URL base sem barra dupla', async () => {
  const f = fakeFetch(json(201, { created: true, profile: { id: 'u1', email: 'a@b.com', role: 'user' } }));
  const r = await client(f).bootstrap('es');
  assert.equal(r.created, true);
  assert.equal(f.calls[0].url, 'https://api.exemplo.com/v1/me/bootstrap');
  assert.equal(f.calls[0].method, 'POST');
  assert.equal(f.calls[0].headers.authorization, 'Bearer tok');
  assert.deepEqual(f.calls[0].body, { language: 'es' });
});

test('sem login nem chega a chamar o servidor', async () => {
  const f = fakeFetch();
  await assert.rejects(() => client(f, null).getSnapshot(), (e: ApiError) => e.status === 401 && e.code === 'unauthorized');
  assert.equal(f.calls.length, 0);
});

test('backup: 404 vira "ainda não há" e 200 devolve o documento', async () => {
  assert.equal(await client(fakeFetch(json(404, { error: { code: 'no_snapshot' } }))).getSnapshot(), null);
  assert.equal(await client(fakeFetch(json(404, { error: { code: 'no_profile' } }))).getSnapshot(), null);
  const snap = await client(fakeFetch(json(200, { v: 1, updatedAt: 5, data: { coins: 9 } }))).getSnapshot();
  assert.deepEqual(snap, { v: 1, updatedAt: 5, data: { coins: 9 } });
});

test('backup: o servidor com um mais novo não é erro; outros erros viram ApiError com o código do servidor', async () => {
  const s = { v: 1 as const, updatedAt: 1, data: {} };
  assert.equal(await client(fakeFetch(json(200, { updatedAt: 1 }))).putSnapshot(s), 'saved');
  assert.equal(await client(fakeFetch(json(409, { error: { code: 'stale_snapshot' } }))).putSnapshot(s), 'stale');
  await assert.rejects(() => client(fakeFetch(json(413, { error: { code: 'payload_too_large' } }))).putSnapshot(s), (e: ApiError) => e.status === 413 && e.code === 'payload_too_large');
  await assert.rejects(() => client(fakeFetch(json(409, { error: { code: 'outra_coisa' } }))).putSnapshot(s), (e: ApiError) => e.code === 'outra_coisa');
});

test('sem rede, a falha é status 0 "network"; resposta que não é JSON vira http_<status>', async () => {
  await assert.rejects(() => client(fakeFetch(new TypeError('fetch failed'))).getSnapshot(), (e: ApiError) => e.status === 0 && e.code === 'network');
  await assert.rejects(() => client(fakeFetch(new Response('<html>Bad Gateway</html>', { status: 502 }))).getSnapshot(), (e: ApiError) => e.status === 502 && e.code === 'http_502');
});

test('excluir a conta: 204 e 404 (já apagada) valem; erro de verdade não', async () => {
  await client(fakeFetch(json(204))).deleteAccount();
  await client(fakeFetch(json(404, { error: { code: 'no_profile' } }))).deleteAccount();
  await assert.rejects(() => client(fakeFetch(json(500))).deleteAccount(), (e: ApiError) => e.status === 500);
});
