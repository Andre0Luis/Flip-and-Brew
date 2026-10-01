import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaries, formatDateLong, formatDateShort, formatNumber, LANGS, translate, weekdayInitial } from './index';

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('os três idiomas têm exatamente as mesmas chaves', () => {
  const base = Object.keys(dictionaries.pt).sort();
  for (const l of LANGS) assert.deepEqual(Object.keys(dictionaries[l]).sort(), base, `idioma ${l}`);
});

test('nenhuma tradução está vazia e os placeholders batem com o português', () => {
  for (const l of LANGS) {
    for (const [key, pt] of Object.entries(dictionaries.pt)) {
      const v = (dictionaries[l] as Record<string, string>)[key];
      assert.ok(v && v.trim().length > 0, `${l}:${key} vazio`);
      assert.deepEqual(placeholders(v), placeholders(pt), `${l}:${key} placeholders diferentes`);
    }
  }
});

test('interpolação e plural', () => {
  assert.equal(translate('pt', 'unit.day', { n: 1 }), 'dia');
  assert.equal(translate('pt', 'unit.day', { n: 3 }), 'dias');
  assert.equal(translate('en', 'unit.cup', { n: 1 }), 'cup');
  assert.equal(translate('es', 'unit.cup', { n: 0 }), 'tazas');
  assert.equal(translate('en', 'guide.buyQ', { name: 'Moka pot' }), 'Buy Moka pot?');
  assert.equal(translate('es', 'result.streak', { n: 8, unit: 'días' }), 'racha de 8 días');
});

test('chave sem valor para um parâmetro mantém o placeholder visível, sem quebrar', () => {
  assert.equal(translate('pt', 'guide.buyQ', {}), 'Comprar {name}?');
});

test('datas e números por idioma', () => {
  const d = new Date(2025, 9, 1); // quarta-feira, 1 de outubro
  assert.equal(formatDateLong('pt', d), 'quarta, 1 de out');
  assert.equal(formatDateLong('en', d), 'Wednesday, Oct 1');
  assert.equal(formatDateLong('es', d), 'miércoles, 1 de oct');
  assert.equal(formatDateShort('en', d.getTime()), 'Oct 1');
  assert.equal(weekdayInitial('en', 0), 'S');
  assert.equal(weekdayInitial('es', 3), 'X');
  assert.match(formatNumber('pt', 1240), /^1\.240$/);
  assert.match(formatNumber('en', 1240), /^1,240$/);
});
