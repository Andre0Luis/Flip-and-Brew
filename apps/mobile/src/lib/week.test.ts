import test from 'node:test';
import assert from 'node:assert/strict';
import { isoWeekOf, weekGoalProgress, weekStart, weekTotals } from './week';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

test('a semana começa na segunda 00:00 do aparelho', () => {
  assert.equal(weekStart(at(2026, 11, 12)), new Date(2026, 10, 9).getTime()); // quinta → segunda dia 9
  assert.equal(weekStart(at(2026, 11, 9, 0)), new Date(2026, 10, 9).getTime());
  assert.equal(weekStart(at(2026, 11, 15, 23)), new Date(2026, 10, 9).getTime()); // domingo ainda é a mesma semana
});

test('semana ISO pelo calendário local, inclusive na virada do ano', () => {
  assert.equal(isoWeekOf(at(2026, 11, 9)), '2026-W46');
  assert.equal(isoWeekOf(at(2027, 1, 1)), '2026-W53');
  assert.equal(isoWeekOf(at(2024, 12, 30)), '2025-W01');
});

test('totais: só desde segunda, minutos de todos os copos e só os cheios contam como copo', () => {
  const now = at(2026, 11, 12, 20);
  const sessions = [
    { startedAt: at(2026, 11, 8, 10), elapsedMs: 60 * 60_000, status: 'done' }, // domingo anterior: fora
    { startedAt: at(2026, 11, 9, 9), elapsedMs: 45 * 60_000, status: 'done' },
    { startedAt: at(2026, 11, 11, 9), elapsedMs: 20 * 60_000 + 29_000, status: 'interrupted' },
    { startedAt: at(2026, 11, 12, 9), elapsedMs: 40 * 60_000, status: 'done' },
  ];
  assert.deepEqual(weekTotals(sessions, now), { week: '2026-W46', offlineMinutes: 105, cups: 2 });
  assert.deepEqual(weekTotals([], now), { week: '2026-W46', offlineMinutes: 0, cups: 0 });
});

test('meta da semana: meta diária vezes 7, e o progresso para em 100%', () => {
  const now = at(2026, 11, 12, 20);
  const s = [{ startedAt: at(2026, 11, 10, 9), elapsedMs: 210 * 60_000, status: 'done' }];
  assert.deepEqual(weekGoalProgress(s, 120, now), { minutes: 210, goal: 840, pct: 0.25 });
  assert.equal(weekGoalProgress([{ startedAt: at(2026, 11, 10, 9), elapsedMs: 2000 * 60_000, status: 'done' }], 120, now).pct, 1);
  assert.equal(weekGoalProgress([], 0, now).goal, 1); // meta zerada não divide por zero
});
