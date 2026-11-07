import { test } from 'node:test';
import assert from 'node:assert/strict';
import { monthGrid, monthSummary, shiftMonth } from './month';
import { withCheckin } from './checkin';
import type { Session } from '@/store/types';

// 14 de outubro de 2026 (quarta). Outubro começa numa quinta e termina numa sábado.
const NOW = new Date(2026, 9, 14, 12).getTime();
const DAY = 86_400_000;
const sess = (back: number, min: number): Session => ({ id: `s${back}`, brewerId: 'melitta', cupId: 'paper', startedAt: NOW - back * DAY, elapsedMs: min * 60_000, targetMs: min * 60_000, status: 'done', coins: min, quality: 'encorpado' }) as Session;

test('a grade tem semanas completas de domingo a sábado e marca as pontas fora do mês', () => {
  const weeks = monthGrid(2026, 9, [], [], 120, NOW);
  assert.ok(weeks.every((w) => w.length === 7));
  assert.equal(weeks.length, 5);
  assert.equal(weeks[0][0].inMonth, false); // domingo 27 de setembro
  assert.equal(weeks[0][4].day, 1); // quinta, 1º de outubro
  assert.equal(weeks[0][4].inMonth, true);
  assert.equal(weeks.flat().filter((c) => c.inMonth).length, 31);
});

test('hoje, o futuro, a energia e a meta batida aparecem em cada dia', () => {
  const checkins = withCheckin(withCheckin([], 4, NOW), 2, NOW - DAY);
  const weeks = monthGrid(2026, 9, checkins, [sess(1, 130), sess(2, 30)], 120, NOW);
  const cells = weeks.flat();
  const today = cells.find((c) => c.isToday)!;
  assert.equal(today.day, 14);
  assert.equal(today.energy, 4);
  const d13 = cells.find((c) => c.day === 13 && c.inMonth)!;
  assert.equal(d13.energy, 2);
  assert.equal(d13.goalMet, true);
  assert.equal(cells.find((c) => c.day === 12 && c.inMonth)!.goalMet, false);
  assert.equal(cells.find((c) => c.day === 20 && c.inMonth)!.future, true);
});

test('o resumo conta só dias do mês que já passaram', () => {
  const checkins = withCheckin(withCheckin(withCheckin([], 5, NOW), 3, NOW - DAY), 1, NOW + 5 * DAY);
  const s = monthSummary(monthGrid(2026, 9, checkins, [sess(1, 200)], 120, NOW));
  assert.equal(s.answered, 2);
  assert.equal(s.avgEnergy, 4);
  assert.equal(s.goalDays, 1);
  assert.equal(s.days, 14);
});

test('trocar de mês atravessa o ano', () => {
  assert.deepEqual(shiftMonth(2026, 0, -1), { year: 2025, month: 11 });
  assert.deepEqual(shiftMonth(2026, 11, 1), { year: 2027, month: 0 });
});
