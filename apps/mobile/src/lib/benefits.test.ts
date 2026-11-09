import test from 'node:test';
import assert from 'node:assert/strict';
import { afterPurchase, itemBenefits } from './benefits';
import { byId, CATALOG } from '@/data/catalog';

test('cafeteira: bônus, tempo do copo e a xícara que combina', () => {
  const b = byId('v60')!;
  const r = itemBenefits(b);
  assert.equal(r.earn, b.earn ?? 0);
  assert.equal(r.minutes, b.brewMinutes);
  assert.deepEqual(r.partners, ['cupo']);
  assert.equal(r.collectionOnly, false);
});

test('a xícara mostra a cafeteira que combina e não tem tempo de copo', () => {
  const r = itemBenefits(byId('cupo')!);
  assert.deepEqual(r.partners, ['v60']);
  assert.equal(r.minutes, null);
});

test('todo item à venda tem algo a mostrar: bônus, tempo, combinação ou a nota de coleção', () => {
  for (const i of CATALOG.filter((x) => x.price > 0)) {
    const r = itemBenefits(i);
    assert.ok(r.earn > 0 || r.minutes !== null || r.partners.length > 0 || r.collectionOnly, i.id);
  }
});

test('saldo depois da compra e o que falta', () => {
  assert.deepEqual(afterPurchase(500, 200), { ok: true, balance: 300, missing: 0 });
  assert.deepEqual(afterPurchase(200, 200), { ok: true, balance: 0, missing: 0 });
  assert.deepEqual(afterPurchase(150, 200), { ok: false, balance: 0, missing: 50 });
});
