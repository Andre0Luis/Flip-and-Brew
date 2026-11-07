import test from 'node:test';
import assert from 'node:assert/strict';
// O cliente do app (apps/mobile) é puro (só `fetch`), então dá para importá-lo aqui e ligá-lo à API de verdade, em memória.
// Se a API mudar uma rota, um código ou um formato, este teste quebra no CI antes de o app quebrar no aparelho.
import { ApiError, createApiClient } from '../../mobile/src/lib/cloud/apiClient';
import { testApp } from './test/helpers';

async function appClient(t: Awaited<ReturnType<typeof testApp>>, token: string | null) {
  // `fetch` que entrega o pedido ao app Hono em memória, exatamente como a rede entregaria.
  const fetchFn = (async (url: string, init: RequestInit) => {
    const u = new URL(url);
    return t.app.request(u.pathname + u.search, init);
  }) as typeof fetch;
  return createApiClient({ baseUrl: 'https://api.local', getToken: async () => token, fetchFn });
}

test('o cliente do app cria o perfil, recebe as boas-vindas uma vez e repetir não duplica', async () => {
  const t = await testApp();
  const u = await t.user('ana@exemplo.com');
  const api = await appClient(t, u.token);
  const first = await api.bootstrap('es');
  assert.equal(first.created, true);
  assert.equal(first.profile.email, 'ana@exemplo.com');
  assert.equal(first.profile.role, 'user');
  const again = await api.bootstrap('es');
  assert.equal(again.created, false);
  assert.equal(t.sent.length, 1);
  assert.match(t.sent[0].subject, /Bienvenido/);
  await t.close();
});

test('backup de ponta a ponta: não há, grava, lê igual, ignora o mais velho e aceita o mais novo', async () => {
  const t = await testApp();
  const api = await appClient(t, (await t.user()).token);
  await api.bootstrap('pt');
  assert.equal(await api.getSnapshot(), null);
  const doc = { coins: 120, owned: ['melitta'], settings: { language: 'pt' } };
  assert.equal(await api.putSnapshot({ v: 1, updatedAt: 2000, data: doc }), 'saved');
  assert.deepEqual(await api.getSnapshot(), { v: 1, updatedAt: 2000, data: doc });
  assert.equal(await api.putSnapshot({ v: 1, updatedAt: 1000, data: { coins: 1 } }), 'stale');
  assert.deepEqual((await api.getSnapshot())?.data, doc);
  assert.equal(await api.putSnapshot({ v: 1, updatedAt: 3000, data: { coins: 200 } }), 'saved');
  assert.equal((await api.getSnapshot())?.updatedAt, 3000);
  await t.close();
});

test('antes do perfil, o backup responde "ainda não há" (o app não quebra se o bootstrap ainda não terminou)', async () => {
  const t = await testApp();
  const api = await appClient(t, (await t.user()).token);
  assert.equal(await api.getSnapshot(), null);
  await t.close();
});

test('excluir a conta apaga tudo; entrar de novo cria um perfil novo e vazio', async () => {
  const t = await testApp();
  const u = await t.user('bia@exemplo.com');
  const api = await appClient(t, u.token);
  await api.bootstrap('pt');
  await api.putSnapshot({ v: 1, updatedAt: 5, data: { coins: 9 } });
  await api.deleteAccount();
  assert.equal(await api.getSnapshot(), null);
  await api.deleteAccount(); // já apagada: o cliente trata o 404 como sucesso
  assert.equal((await api.bootstrap('pt')).created, true);
  assert.equal(await api.getSnapshot(), null);
  await t.close();
});

test('token inválido vira 401 do servidor, e o cliente o devolve como ApiError', async () => {
  const t = await testApp();
  const api = await appClient(t, 'token.invalido.aqui');
  await assert.rejects(() => api.bootstrap(), (e: ApiError) => e.status === 401 && e.code === 'unauthorized');
  await t.close();
});

test('corpo grande demais volta como 413 com o código do servidor', async () => {
  const t = await testApp();
  const api = await appClient(t, (await t.user()).token);
  await api.bootstrap();
  await assert.rejects(() => api.putSnapshot({ v: 1, updatedAt: 1, data: { x: 'a'.repeat(1_200_000) } }), (e: ApiError) => e.status === 413 && e.code === 'payload_too_large');
  await t.close();
});
