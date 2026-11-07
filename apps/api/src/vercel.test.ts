import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { buildApp } from './build-app.js';

const env = { NODE_ENV: 'test', AUTH_PROVIDER: 'dev', DEV_JWT_SECRET: 'x'.repeat(24), DATABASE_URL: 'pglite:' };

test('buildApp monta a API a partir do ambiente (o mesmo caminho do servidor local e da Vercel)', async () => {
  const { app, handle } = await buildApp(env);
  assert.equal((await app.request('/health')).status, 200);
  assert.equal((await app.request('/v1/me')).status, 401);
  await handle.close();
});

test('a entrada da Vercel (src/index.ts) exporta um app Hono que responde e inicia sob demanda', async () => {
  Object.assign(process.env, env);
  const { default: entry } = await import('./index.js');
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
    const fresh = (await import(`./index.ts?broken=${Date.now()}`)).default as typeof import('./index.js').default;
    const res = await fresh.request('/health');
    assert.equal(res.status, 503);
    const body = JSON.stringify(await res.json());
    assert.doesNotMatch(body, /DEV_JWT_SECRET|AUTH_PROVIDER/);
  } finally {
    for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
  }
});

// A Vercel compila arquivo por arquivo e o Node em modo ESM (package.json "type": "module") não completa a extensão:
// `./build-app` quebra em produção com ERR_MODULE_NOT_FOUND, mesmo passando no tsc e no tsx.
test('todo import relativo do que vai para a Vercel termina em .js (ou .json)', () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.ts') && !name.endsWith('.test.ts')) files.push(full);
    }
  };
  walk(join(import.meta.dirname));
  assert.ok(files.length > 10);
  const bad: string[] = [];
  const spec = /(?:from|import\()\s*'(\.\.?\/[^']*)'/g;
  for (const f of files) {
    for (const m of readFileSync(f, 'utf8').matchAll(spec)) {
      if (!/\.(js|json)$/.test(m[1])) bad.push(`${f}: ${m[1]}`);
    }
  }
  assert.deepEqual(bad, []);
});
