import { test } from 'node:test';
import assert from 'node:assert/strict';
import { earnBonus, MAX_EARN_BONUS } from './earnings';
import { coinsFor } from './brew';
import { CATALOG } from '@/data/catalog';

const MIN = 60_000;

test('o bônus é a soma da cafeteira, da xícara e de uma combinação que combina', () => {
  assert.deepEqual(earnBonus('melitta', 'paper'), { brewer: 0, cup: 0, pack: 0, synergy: 0, total: 0 });
  assert.equal(earnBonus('moka', 'cupb').total, 25); // 20 + 5
  assert.deepEqual(earnBonus('turkish', 'mugk'), { brewer: 10, cup: 3, pack: 0, synergy: 5, total: 18 });
  assert.equal(earnBonus('inexistente', 'cup').total, 0);
});

test('o bônus nunca passa do teto, mesmo com a melhor combinação', () => {
  for (const b of CATALOG.filter((i) => i.kind === 'brewer'))
    for (const c of CATALOG.filter((i) => i.kind === 'cup'))
      for (const p of CATALOG.filter((i) => i.kind === 'beans')) assert.ok(earnBonus(b.id, c.id, p.id).total <= MAX_EARN_BONUS);
  assert.equal(earnBonus('chemex', 'summit').total, 45); // 25 + 15 + 5
  assert.equal(earnBonus('espresso', 'gold-cup', 'pack-especial').total, MAX_EARN_BONUS); // 32 + 25 + 35 + 5 passa do teto
});

test('o bônus multiplica as moedas do copo, e zero mantém o valor de sempre', () => {
  assert.equal(coinsFor(45 * MIN, 45 * MIN, 0), 54);
  assert.equal(coinsFor(45 * MIN, 45 * MIN, 20), 65); // 54 * 1,2 = 64,8
  assert.equal(coinsFor(30 * MIN, 45 * MIN, 10), 33);
});

test('as três primeiras cafeteiras e xícaras à venda são as mais baratas; as séries especiais, as mais caras', () => {
  for (const kind of ['brewer', 'cup'] as const) {
    const buyable = CATALOG.filter((i) => i.kind === kind && i.price > 0 && !i.collection).sort((a, b) => a.price - b.price);
    assert.ok(buyable[2].price < buyable[3].price, `${kind}: o corte depois das três primeiras`);
  }
  const common = Math.max(...CATALOG.filter((i) => i.kind === 'cup' && !i.collection).map((i) => i.price));
  for (const i of CATALOG.filter((x) => x.collection)) assert.ok(i.price > common, `${i.id} deve custar mais que as peças comuns`);
});

test('o pacote de café muda as moedas: extraforte rende pouco, especial rende bem mais', () => {
  const totals = ['pack-extraforte', 'pack-tradicional', 'pack-superior', 'pack-gourmet', 'pack-especial'].map((p) => earnBonus('melitta', 'paper', p).total);
  assert.deepEqual(totals, [0, 4, 10, 20, 35]);
  assert.deepEqual([...totals].sort((a, b) => a - b), totals); // cada categoria rende mais que a anterior
});
