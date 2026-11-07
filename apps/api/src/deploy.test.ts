import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Guardas contra dois erros reais do deploy na Vercel (ver apps/api/README.md, "Deploy na Vercel").
const root = fileURLToPath(new URL('..', import.meta.url));
const json = (f: string) => JSON.parse(readFileSync(`${root}${f}`, 'utf8'));

test('a Vercel acha exatamente uma entrada: src/index.ts (app.ts e server.ts na raiz do src confundem o preset Hono)', () => {
  // Os nomes que o preset Hono procura (docs da Vercel): app|index|server na raiz do projeto e em src/.
  const candidate = /^(app|index|server)\.(js|cjs|mjs|ts|cts|mts)$/;
  const found = ['', 'src/'].flatMap((dir) => (existsSync(`${root}${dir}`) ? readdirSync(`${root}${dir}`) : []).filter((f) => candidate.test(f)).map((f) => `${dir}${f}`));
  assert.deepEqual(found, ['src/index.ts']);
});

test('o tsconfig fixa o typeRoots dentro de apps/api: o builder da Vercel estende o tsconfig a partir de outra pasta e, sem isto, perde o @types/node (TS2688)', () => {
  const { compilerOptions: o } = json('tsconfig.json');
  assert.ok(Array.isArray(o.types) && o.types.includes('node'));
  assert.deepEqual(o.typeRoots, ['./node_modules/@types']);
});

test('a instalação na Vercel inclui as devDependencies (o npm as pula com NODE_ENV=production)', () => {
  const v = json('vercel.json');
  assert.equal(v.framework, 'hono');
  assert.match(v.installCommand, /--include=dev/);
});
