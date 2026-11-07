import test from 'node:test';
import assert from 'node:assert/strict';
import { supabaseAdmin } from './admin.js';

const KEY = 'chave-service-role-so-de-teste-123456';

function fake(status: number) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchFn = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(null, { status });
  }) as typeof fetch;
  return { calls, admin: supabaseAdmin({ url: 'https://abc.supabase.co/', serviceRoleKey: KEY, fetchFn }) };
}

test('apaga o usuário na Admin API do Supabase com a chave de serviço', async () => {
  const { calls, admin } = fake(200);
  await admin.deleteUser('11111111-1111-4111-8111-111111111111');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://abc.supabase.co/auth/v1/admin/users/11111111-1111-4111-8111-111111111111');
  assert.equal(calls[0].init.method, 'DELETE');
  const h = calls[0].init.headers as Record<string, string>;
  assert.equal(h.apikey, KEY);
  assert.equal(h.authorization, `Bearer ${KEY}`);
});

test('usuário que já não existe (404) conta como sucesso', async () => {
  await fake(404).admin.deleteUser('x');
});

test('qualquer outra falha lança erro sem vazar a chave', async () => {
  await assert.rejects(fake(500).admin.deleteUser('x'), (e: Error) => /500/.test(e.message) && !e.message.includes(KEY));
});
