import test from 'node:test';
import assert from 'node:assert/strict';
import { NO_PASSIVE, PASSIVE_MAX_COINS_PER_DAY, applyPlan, eligibleMin, normalizeSleep, passiveCoins, planPassive } from './passive';
import { dayKey } from './stats';
import type { UsageDay } from './usage';

const HOUR = 3_600_000;
const now = new Date(2026, 10, 10, 9, 0).getTime();
const start = (daysAgo: number) => new Date(2026, 10, 10 - daysAgo).getTime();
/** Dia completo com a tela ligada por `screenH` horas. */
const day = (daysAgo: number, screenH: number): UsageDay => ({ dayStart: start(daysAgo), unlocks: 30, locks: 30, screenMs: screenH * HOUR });
const base = { now, sleepMin: 360, cupMinByDay: {}, since: dayKey(start(7)), credited: [] as string[] };

test('o sono mínimo sai do tempo bloqueado antes de contar', () => {
  // 24 h - 6 h de tela = 18 h bloqueadas; menos 6 h de sono = 12 h = 720 min
  assert.equal(eligibleMin(day(1, 6), 360, 0, now), 720);
  assert.equal(eligibleMin(day(1, 6), 480, 0, now), 600);
});

test('quem passou o dia no celular não ganha nada: o bloqueado nem chega ao sono mínimo', () => {
  assert.equal(eligibleMin(day(1, 19), 360, 0, now), 0); // só 5 h bloqueadas
  assert.equal(passiveCoins(0), 0);
});

test('o tempo dos copos não conta duas vezes', () => {
  assert.equal(eligibleMin(day(1, 6), 360, 60, now), 660);
  assert.equal(eligibleMin(day(1, 6), 360, 5000, now), 0);
});

test('10 minutos valem 1 moeda e o dia tem teto', () => {
  assert.equal(passiveCoins(59), 5);
  assert.equal(passiveCoins(60), 6);
  assert.equal(passiveCoins(720), PASSIVE_MAX_COINS_PER_DAY);
});

test('o sono mínimo fica entre 4 e 9 horas, de meia em meia hora', () => {
  assert.equal(normalizeSleep(100), 240);
  assert.equal(normalizeSleep(900), 540);
  assert.equal(normalizeSleep(370), 360);
  assert.equal(normalizeSleep(NaN), 360);
});

test('só dias terminados, depois de "since", com dados e ainda não pagos entram no plano', () => {
  const days = [day(0, 1), day(1, 6), day(2, 6), day(9, 6), { dayStart: start(3), unlocks: 0, locks: 0, screenMs: 0 }];
  const plan = planPassive({ ...base, days, credited: [dayKey(start(2))] });
  assert.deepEqual(plan.credits.map((c) => c.day), [dayKey(start(1))]); // hoje, dia pago, anterior ao since e sem dados ficam de fora
  assert.equal(plan.total, PASSIVE_MAX_COINS_PER_DAY);
});

test('aplicar o plano anota os dias e o aviso; rodar de novo não paga duas vezes', () => {
  const days = [day(1, 6), day(2, 6)];
  const plan = planPassive({ ...base, days });
  const state = applyPlan(NO_PASSIVE, plan);
  assert.equal(state.credited.length, 2);
  assert.equal(state.notice?.coins, plan.total);
  const again = planPassive({ ...base, days, credited: state.credited });
  assert.equal(again.credits.length, 0);
  assert.equal(applyPlan(state, again), state);
});

test('dia que rendeu zero também é anotado, mas não gera aviso', () => {
  const plan = planPassive({ ...base, days: [day(1, 19)] });
  assert.equal(plan.total, 0);
  const state = applyPlan(NO_PASSIVE, plan);
  assert.equal(state.credited.length, 1);
  assert.equal(state.notice, null);
});
