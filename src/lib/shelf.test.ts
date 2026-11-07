import test from 'node:test';
import assert from 'node:assert/strict';
import { equippedFirst } from './shelf';

const list = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
const ids = (xs: { id: string }[]) => xs.map((x) => x.id).join('');

test('o item em uso vai para o começo e os outros mantêm a ordem', () => {
  assert.equal(ids(equippedFirst(list, 'c')), 'cabd');
  assert.equal(ids(equippedFirst(list, 'd')), 'dabc');
});

test('já no começo, ou id que não está na lista, não muda nada', () => {
  assert.equal(ids(equippedFirst(list, 'a')), 'abcd');
  assert.equal(ids(equippedFirst(list, 'x')), 'abcd');
});

test('não altera a lista original', () => {
  equippedFirst(list, 'c');
  assert.equal(ids(list), 'abcd');
});
