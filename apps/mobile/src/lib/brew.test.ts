import test from 'node:test';
import assert from 'node:assert/strict';
import { coinsFor, outcomeOf, qualityOf } from './brew';

const MIN = 60_000;

test('qualidade pelo quanto o copo encheu', () => {
  assert.equal(qualityOf(0.1), 'ralo');
  assert.equal(qualityOf(0.35), 'equilibrado');
  assert.equal(qualityOf(0.99), 'equilibrado');
  assert.equal(qualityOf(1), 'encorpado');
});

test('uma moeda por minuto, com 20% de bônus no copo cheio', () => {
  assert.equal(coinsFor(22 * MIN + 30_000, 45 * MIN), 22);
  assert.equal(coinsFor(45 * MIN, 45 * MIN), 45 + 9);
  assert.equal(coinsFor(99 * MIN, 45 * MIN), 45 + 9); // passar do alvo não rende mais
});

test('parar cedo rende o proporcional, nunca zero', () => {
  const o = outcomeOf(0, 45 * MIN, 30 * MIN);
  assert.equal(o.status, 'interrupted');
  assert.equal(o.coins, 30);
  assert.equal(o.quality, 'equilibrado');
});

test('o tempo é limitado ao alvo e o copo cheio termina como done', () => {
  const o = outcomeOf(1000, 30 * MIN, 1000 + 500 * MIN);
  assert.equal(o.elapsedMs, 30 * MIN);
  assert.equal(o.status, 'done');
  assert.equal(o.quality, 'encorpado');
});

test('relógio que andou para trás não gera tempo negativo', () => {
  assert.equal(outcomeOf(10_000, 30 * MIN, 5_000).elapsedMs, 0);
});
