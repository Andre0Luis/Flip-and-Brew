import test from 'node:test';
import assert from 'node:assert/strict';
import { screenBars, summarizeUsage, type UsageDay } from './usage';

const DAY = 86_400_000;
const NOW = new Date(2025, 9, 15, 20, 0, 0).getTime();
const start = (back: number) => {
  const d = new Date(NOW - back * DAY);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const day = (back: number, unlocks: number, screenMin: number): UsageDay => ({ dayStart: start(back), unlocks, screenMs: screenMin * 60_000 });

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
  assert.deepEqual({ ...s }, { today: undefined, avgUnlocks: 0, avgScreenMin: 0, fullDays: 0 });
  assert.deepEqual(screenBars([], NOW), []);
});

test('barras de tela marcam hoje e usam minutos', () => {
  const bars = screenBars([day(1, 5, 90), day(0, 8, 45)], NOW);
  assert.equal(bars[0].isToday, false);
  assert.equal(bars[1].isToday, true);
  assert.equal(bars[0].minutes, 90);
  assert.equal(bars[1].weekday, new Date(NOW).getDay());
});
