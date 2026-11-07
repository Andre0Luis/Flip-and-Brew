import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from './bootstrap';

const env = { NODE_ENV: 'test', AUTH_PROVIDER: 'dev', DEV_JWT_SECRET: 'x'.repeat(24), DATABASE_URL: 'pglite:' };

test('buildApp monta a API a partir do ambiente (o mesmo caminho do servidor local e da Vercel)', async () => {
  const { app, handle } = await buildApp(env);
  assert.equal((await app.request('/health')).status, 200);
  assert.equal((await app.request('/v1/me')).status, 401);
  await handle.close();
});

test('a entrada da Vercel (src/index.ts) exporta um app Hono que responde e inicia sob demanda', async () => {
  Object.assign(process.env, env);
  const { default: entry } = await import('./index');
  const res = await entry.request('/health');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal((await entry.request('/v1/me')).status, 401);
});

test('se a configuração está errada, a entrada responde 503 sem vazar detalhes e tenta de novo depois', async () => {
  const saved = { ...process.env };
  try {
    Object.assign(process.env, { NODE_ENV: 'production', AUTH_PROVIDER: 'dev', DEV_JWT_SECRET: 'x'.repeat(24) });
    // O sufixo na URL força uma cópia nova do módulo (o estado `ready` é do módulo).
    const fresh = (await import(`./index.ts?broken=${Date.now()}`)).default as typeof import('./index').default;
    const res = await fresh.request('/health');
    assert.equal(res.status, 503);
    const body = JSON.stringify(await res.json());
    assert.doesNotMatch(body, /DEV_JWT_SECRET|AUTH_PROVIDER/);
  } finally {
    for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
  }
});
