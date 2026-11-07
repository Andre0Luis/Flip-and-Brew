import test from 'node:test';
import assert from 'node:assert/strict';
import { lockedMs, screenBars, summarizeUsage, type UsageDay } from './usage';

const DAY = 86_400_000;
const NOW = new Date(2025, 9, 15, 20, 0, 0).getTime();
const start = (back: number) => {
  const d = new Date(NOW - back * DAY);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const day = (back: number, unlocks: number, screenMin: number, locks = 0): UsageDay => ({ dayStart: start(back), unlocks, locks, screenMs: screenMin * 60_000 });

test('a média ignora hoje e dias sem dados', () => {
  const days = [day(3, 0, 0), day(2, 40, 120), day(1, 60, 180), day(0, 10, 30)];
  const s = summarizeUsage(days, NOW);
  assert.equal(s.fullDays, 2);
  assert.equal(s.avgUnlocks, 50);
  assert.equal(s.avgScreenMin, 150);
  assert.equal(s.today?.unlocks, 10);
});

test('sem dados, tudo é zero e nada quebra', () => {
  const s = summarizeUsage([], NOW);
  assert.deepEqual({ ...s }, { today: undefined, avgUnlocks: 0, avgLocks: 0, avgScreenMin: 0, avgLockedMin: 0, fullDays: 0 });
  assert.deepEqual(screenBars([], NOW), []);
});

test('barras de tela marcam hoje e usam minutos', () => {
  const bars = screenBars([day(1, 5, 90), day(0, 8, 45)], NOW);
  assert.equal(bars[0].isToday, false);
  assert.equal(bars[1].isToday, true);
  assert.equal(bars[0].minutes, 90);
  assert.equal(bars[1].weekday, new Date(NOW).getDay());
});

test('a tela bloqueada é o resto do dia depois da tela ligada; hoje conta só até agora', () => {
  // NOW é 20h: já passaram 20 h do dia. Com 4 h de tela ligada, ficaram 16 h bloqueada.
  assert.equal(lockedMs(day(0, 30, 240, 40), NOW) / 3_600_000, 16);
  // Um dia completo tem 24 h.
  assert.equal(lockedMs(day(1, 30, 360, 40), NOW) / 3_600_000, 18);
  // Nunca fica negativo, mesmo que o sistema some demais.
  assert.equal(lockedMs(day(0, 1, 60 * 30, 1), NOW), 0);
});

test('a média de bloqueios e de tela bloqueada usa só dias completos', () => {
  const s = summarizeUsage([day(2, 40, 120, 30), day(1, 60, 180, 50), day(0, 5, 10, 8)], NOW);
  assert.equal(s.avgLocks, 40);
  assert.equal(s.avgLockedMin / 60, 21.5); // (22 h + 21 h) / 2
});
