import test from 'node:test';
import assert from 'node:assert/strict';
import { QUOTE_IDS, getQuotes, quoteById, quoteOfDay, setRemoteQuotes } from './quotes';

const remote = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  content: {
    pt: { text: `Frase ${id}.`, author: 'Autora', source: 'Livro', ...extra },
    en: { text: `Quote ${id}.`, author: 'Author', source: 'Book' },
    es: { text: `Frase ${id} es.`, author: 'Autora', source: 'Libro' },
  },
});

test('sem lista do servidor valem só as 9 de dentro do app', () => {
  assert.equal(getQuotes('pt').length, QUOTE_IDS.length);
  assert.equal(quoteOfDay('pt', new Date(2026, 0, 1)).id, QUOTE_IDS[1 % QUOTE_IDS.length]);
});

test('as do servidor entram depois das 9, com texto no idioma pedido e sem contexto quando não vem', () => {
  setRemoteQuotes([remote('q001'), remote('q002', { context: 'Um contexto.', tryToday: ['Uma ideia.'] })]);
  const pt = getQuotes('pt');
  assert.equal(pt.length, QUOTE_IDS.length + 2);
  assert.equal(pt[QUOTE_IDS.length].id, 'q001');
  assert.equal(quoteById('en', 'q001')?.text, 'Quote q001.');
  assert.equal(quoteById('es', 'q001')?.author, 'Autora');
  assert.deepEqual([quoteById('pt', 'q001')?.context, quoteById('pt', 'q001')?.tryToday], ['', []]);
  assert.deepEqual([quoteById('pt', 'q002')?.context, quoteById('pt', 'q002')?.tryToday], ['Um contexto.', ['Uma ideia.']]);
});

test('a frase do dia é a mesma em todos os idiomas e anda pela lista inteira', () => {
  setRemoteQuotes(Array.from({ length: 100 }, (_, i) => remote(`r${i}`)));
  const total = QUOTE_IDS.length + 100;
  const day = (n: number) => new Date(2026, 0, n);
  const ids = new Set<string>();
  for (let n = 1; n <= total; n++) {
    const id = quoteOfDay('pt', day(n)).id;
    assert.equal(quoteOfDay('en', day(n)).id, id);
    assert.equal(quoteOfDay('es', day(n)).id, id);
    ids.add(id);
  }
  assert.ok(ids.size > 100, `só ${ids.size} frases diferentes em ${total} dias`);
});

test('lixo da rede não entra: id repetido de dentro do app, id duplicado e idioma faltando', () => {
  const semEs = { id: 'sem-es', content: { pt: { text: 'a b c', author: 'x' }, en: { text: 'a b c', author: 'x' } } };
  setRemoteQuotes([remote('sq-13'), remote('ok1'), remote('ok1'), semEs, null, 'texto', { id: 5 }]);
  assert.deepEqual(getQuotes('pt').slice(QUOTE_IDS.length).map((q) => q.id), ['ok1']);
  setRemoteQuotes('não é lista');
  assert.equal(getQuotes('pt').length, QUOTE_IDS.length);
});
