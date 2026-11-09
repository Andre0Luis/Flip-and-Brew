import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteInputSchema } from './shared.js';
import { seedDailyQuotes } from './db/seed-quotes.js';
import { seedQuotes } from './seed/quotes-data.js';
import { testApp } from './test/helpers.js';

const one = (id: string, text = 'Uma frase de teste.') => ({
  id,
  content: { pt: { text, author: 'Autora', source: 'Livro' }, en: { text: 'A test quote.', author: 'Author', source: 'Book' }, es: { text: 'Una frase de prueba.', author: 'Autora', source: 'Libro' } },
});

test('as frases da carga: mais de 100, ids únicos, os três idiomas e dentro do esquema do endpoint', () => {
  const list = seedQuotes();
  assert.ok(list.length >= 100, `só ${list.length}`);
  assert.equal(new Set(list.map((q) => q.id)).size, list.length);
  assert.equal(new Set(list.map((q) => q.position)).size, list.length);
  for (const q of list) {
    const r = quoteInputSchema.safeParse(q);
    assert.ok(r.success, `${q.id}: ${r.success ? '' : r.error.message}`);
    for (const l of ['pt', 'en', 'es'] as const) assert.ok(q.content[l].source.length > 0, `${q.id} sem fonte em ${l}`);
  }
});

test('o rodízio não repete o mesmo autor em dias seguidos', () => {
  const list = seedQuotes();
  let streak = 0;
  for (let i = 1; i < list.length; i++) if (list[i].content.pt.author === list[i - 1].content.pt.author) streak += 1;
  // Só no fim, quando sobram poucos autores com muitas frases, pode haver repetição.
  assert.ok(streak <= 10, `${streak} repetições seguidas`);
});

test('a carga grava tudo e roda de novo sem duplicar', async () => {
  const t = await testApp();
  const n = await seedDailyQuotes(t.handle);
  const again = await seedDailyQuotes(t.handle);
  assert.equal(n, again);
  const dono = await t.member('dono@exemplo.com');
  const list = await t.call('/v1/quotes', { token: dono.token });
  assert.equal(list.status, 200);
  assert.equal(list.body.quotes.length, n);
  assert.equal(list.body.quotes[0].id, seedQuotes()[0].id);
  await t.close();
});

test('só admin escreve; qualquer pessoa logada lê as ativas', async () => {
  const t = await testApp();
  const admin = await t.member('dono@exemplo.com');
  const user = await t.member('ana@exemplo.com');
  assert.equal((await t.call('/v1/quotes')).status, 401);
  assert.equal((await t.call('/v1/admin/quotes', { token: user.token, method: 'PUT', body: { quotes: [one('x1')] } })).status, 403);
  assert.equal((await t.call('/v1/admin/quotes', { token: user.token })).status, 403);

  const put = await t.call('/v1/admin/quotes', { token: admin.token, method: 'PUT', body: { quotes: [one('x1'), one('x2')] } });
  assert.equal(put.status, 200);
  assert.deepEqual(put.body, { saved: 2, total: 2 });
  const list = await t.call('/v1/quotes', { token: user.token });
  assert.deepEqual(list.body.quotes.map((q: { id: string }) => q.id), ['x1', 'x2']);
  assert.equal(list.body.quotes[0].content.pt.text, 'Uma frase de teste.');
  await t.close();
});

test('corrigir mantém o lugar, desativar tira do rodízio e apagar remove', async () => {
  const t = await testApp();
  const admin = await t.member('dono@exemplo.com');
  await t.call('/v1/admin/quotes', { token: admin.token, method: 'PUT', body: { quotes: [one('aa'), one('bb'), one('cc')] } });
  await t.call('/v1/admin/quotes', { token: admin.token, method: 'PUT', body: { quotes: [one('bb', 'Texto novo.')] } });
  await t.call('/v1/admin/quotes', { token: admin.token, method: 'PUT', body: { quotes: [{ ...one('cc'), active: false }] } });
  const user = await t.member('ana@exemplo.com');
  const active = (await t.call('/v1/quotes', { token: user.token })).body.quotes;
  assert.deepEqual(active.map((q: { id: string }) => q.id), ['aa', 'bb']);
  assert.equal(active[1].content.pt.text, 'Texto novo.');
  const all = (await t.call('/v1/admin/quotes', { token: admin.token })).body.quotes;
  assert.equal(all.length, 3);
  assert.equal(all[2].active, false);
  assert.equal((await t.call('/v1/admin/quotes/aa', { token: admin.token, method: 'DELETE' })).status, 204);
  assert.equal((await t.call('/v1/admin/quotes/aa', { token: admin.token, method: 'DELETE' })).status, 404);
  await t.close();
});

test('entrada inválida: id fora do padrão, id repetido e idioma faltando', async () => {
  const t = await testApp();
  const admin = await t.member('dono@exemplo.com');
  const put = (quotes: unknown[]) => t.call('/v1/admin/quotes', { token: admin.token, method: 'PUT', body: { quotes } });
  assert.equal((await put([one('ID Ruim!')])).status, 400);
  assert.equal((await put([one('dup'), one('dup')])).status, 400);
  const semEs = one('semes') as { content: Record<string, unknown> };
  delete semEs.content.es;
  assert.equal((await put([semEs])).status, 400);
  assert.equal((await put([])).status, 400);
  await t.close();
});
