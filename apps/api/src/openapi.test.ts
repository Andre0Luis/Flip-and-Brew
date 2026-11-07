import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from './config';
import { honoPath, operations, toSchema } from './openapi';
import { testApp } from './test/helpers';
import { profilePatchSchema } from '@flipandbrew/shared';

test('toda rota da API está documentada, e toda rota documentada existe (a documentação não envelhece)', async () => {
  const t = await testApp();
  const docs = new Set(['GET /docs', 'GET /openapi.json']);
  // `ALL` são middlewares (login, CORS, limites); só contam as rotas de verdade.
  const real = t.app.routes.filter((r) => r.method !== 'ALL').map((r) => `${r.method} ${r.path}`).filter((r) => !docs.has(r));
  const documented = operations.map((o) => `${o.method.toUpperCase()} ${honoPath(o.path)}`);
  assert.deepEqual(real.filter((r) => !documented.includes(r)), [], 'rotas sem documentação: acrescente em src/openapi.ts');
  assert.deepEqual(documented.filter((d) => !real.includes(d)), [], 'documentadas, mas não existem');
  assert.equal(new Set(documented).size, documented.length, 'rota documentada duas vezes');
  await t.close();
});

test('/openapi.json é um OpenAPI 3.1 coerente: login só onde precisa, corpos vindos do Zod e respostas referenciadas existem', async () => {
  const t = await testApp();
  const res = await t.call('/openapi.json');
  assert.equal(res.status, 200);
  const doc = res.body;
  assert.equal(doc.openapi, '3.1.0');
  assert.equal(doc.components.securitySchemes.bearerAuth.scheme, 'bearer');
  assert.equal(doc.paths['/health'].get.security, undefined);
  assert.deepEqual(doc.paths['/v1/me'].get.security, [{ bearerAuth: [] }]);
  assert.ok(doc.paths['/v1/admin/overview'].get.responses['403']);
  assert.equal(doc.paths['/v1/me'].patch.requestBody.content['application/json'].schema.additionalProperties, false);
  const refs = JSON.stringify(doc).match(/#\/components\/schemas\/(\w+)/g) ?? [];
  for (const r of refs) assert.ok(doc.components.schemas[r.split('/').pop()!], `referência quebrada: ${r}`);
  for (const [path, item] of Object.entries<Record<string, { responses: object }>>(doc.paths)) {
    for (const [method, op] of Object.entries(item)) assert.ok(Object.keys(op.responses).length > 0, `${method} ${path} sem respostas`);
  }
  await t.close();
});

test('o esquema do Zod vira JSON Schema limpo (sem $schema e sem limites de inteiro seguro)', () => {
  const s = toSchema(profilePatchSchema) as { properties: Record<string, { minLength?: number }>; additionalProperties: boolean };
  assert.equal(s.additionalProperties, false);
  assert.equal(JSON.stringify(s).includes('$schema'), false);
  assert.equal(JSON.stringify(s).includes('9007199254740991'), false);
  assert.equal(JSON.stringify(toSchema(profilePatchSchema)).includes('"handle"'), true);
});

test('/docs serve o Swagger UI apontando para /openapi.json, sem pedir login', async () => {
  const t = await testApp();
  const res = await t.app.request('/docs');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /\/openapi\.json/);
  assert.match(html, /swagger-ui-dist@5\.\d+\.\d+/, 'a versão da UI precisa estar fixa');
  await t.close();
});

test('com a documentação desligada, /docs e /openapi.json não existem', async () => {
  const t = await testApp({ docsEnabled: false });
  assert.equal((await t.app.request('/docs')).status, 404);
  assert.equal((await t.app.request('/openapi.json')).status, 404);
  await t.close();
});

test('configuração: documentação ligada fora de produção e desligada em produção, salvo DOCS_ENABLED', () => {
  const base = { AUTH_PROVIDER: 'dev', DEV_JWT_SECRET: 'x'.repeat(20) };
  assert.equal(loadConfig(base).docsEnabled, true);
  assert.equal(loadConfig({ ...base, DOCS_ENABLED: 'false' }).docsEnabled, false);
  const prod = { NODE_ENV: 'production', DATABASE_URL: 'postgres://x', AUTH_PROVIDER: 'supabase' };
  assert.equal(loadConfig(prod).docsEnabled, false);
  assert.equal(loadConfig({ ...prod, DOCS_ENABLED: 'true' }).docsEnabled, true);
  assert.throws(() => loadConfig({ ...base, DOCS_ENABLED: 'talvez' }));
});
