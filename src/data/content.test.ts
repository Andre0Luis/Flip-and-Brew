import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT } from './content';
import { ARTICLE_BASE, PRACTICE_BASE, getArticles, practiceOfDay } from './articles';
import { CATALOG } from './catalog';
import { QUOTE_IDS, getQuotes, quoteOfDay } from './quotes';
import { LANGS } from '@/i18n';

const filled = (s: string) => typeof s === 'string' && s.trim().length > 0;

test('todo id tem texto em todos os idiomas', () => {
  for (const l of LANGS) {
    const c = CONTENT[l];
    for (const id of QUOTE_IDS) assert.ok(c.quotes[id], `${l}: frase ${id}`);
    for (const a of ARTICLE_BASE) assert.ok(c.articles[a.id], `${l}: artigo ${a.id}`);
    for (const p of PRACTICE_BASE) assert.ok(c.practices[p.id], `${l}: prática ${p.id}`);
    for (const i of CATALOG) assert.ok(c.items[i.id], `${l}: item ${i.id}`);
    assert.deepEqual(Object.keys(c.quotes).sort(), [...QUOTE_IDS].sort(), `${l}: frases sobrando`);
    assert.equal(Object.keys(c.articles).length, ARTICLE_BASE.length, `${l}: artigos sobrando`);
  }
});

test('nenhum campo de texto está vazio e as listas têm o mesmo tamanho do português', () => {
  for (const l of LANGS) {
    for (const id of QUOTE_IDS) {
      const q = CONTENT[l].quotes[id];
      for (const f of [q.text, q.author, q.source, q.context]) assert.ok(filled(f), `${l}:${id}`);
      assert.equal(q.tryToday.length, CONTENT.pt.quotes[id].tryToday.length, `${l}:${id} tryToday`);
    }
    for (const a of ARTICLE_BASE) {
      const t = CONTENT[l].articles[a.id];
      for (const f of [t.title, t.summary, t.oneLine, t.inApp]) assert.ok(filled(f), `${l}:${a.id}`);
      assert.equal(t.body.length, CONTENT.pt.articles[a.id].body.length, `${l}:${a.id} body`);
      assert.equal(t.tryToday.length, CONTENT.pt.articles[a.id].tryToday.length, `${l}:${a.id} tryToday`);
    }
  }
});

test('artigos apontam para frases e artigos que existem', () => {
  const ids = new Set(ARTICLE_BASE.map((a) => a.id));
  for (const a of ARTICLE_BASE) {
    if (a.quoteId) assert.ok(QUOTE_IDS.includes(a.quoteId as never), `${a.id} → frase ${a.quoteId}`);
    for (const r of a.related) assert.ok(ids.has(r), `${a.id} → ${r}`);
  }
});

test('a frase e a prática do dia são as mesmas em todos os idiomas', () => {
  const day = new Date(2025, 9, 15);
  const ids = LANGS.map((l) => quoteOfDay(l, day).id);
  assert.equal(new Set(ids).size, 1);
  const pr = LANGS.map((l) => practiceOfDay(l, day).id);
  assert.equal(new Set(pr).size, 1);
});

test('getters devolvem texto no idioma pedido', () => {
  assert.equal(getQuotes('en').find((q) => q.id === 'nt-vento')?.text, 'Wind extinguishes a candle and energizes fire.');
  assert.match(getArticles('es')[0].title, /Antifrágil/);
  assert.match(getArticles('pt')[0].title, /Antifrágil/);
});

test('o texto do criador existe e está preenchido nos três idiomas', () => {
  for (const l of LANGS) {
    const c = CONTENT[l].creator;
    for (const f of [c.title, c.byline, c.motto, c.closing, c.signature]) assert.ok(filled(f), `${l}: criador`);
    assert.equal(c.blocks.length, CONTENT.pt.creator.blocks.length, `${l}: blocos do criador`);
    for (const b of c.blocks) assert.ok(filled(b.heading) && filled(b.text), `${l}: bloco`);
  }
});
