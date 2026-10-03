import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestEnergyWeekday, bestWeekday, completionRate, criticalHour, favoriteCombo, longestStreak, weekdayAverages } from './patterns';
import { withCheckin } from './checkin';
import type { Session } from '@/store/types';

const NOW = new Date(2026, 9, 14, 12).getTime(); // quarta
const DAY = 86_400_000;
const mk = (back: number, minutes: number, status: 'done' | 'interrupted' = 'done', hour = 9, brewerId = 'melitta', cupId = 'paper'): Session => {
  const d = new Date(NOW - back * DAY);
  d.setHours(hour, 0, 0, 0);
  return { id: `p${back}-${hour}-${brewerId}`, brewerId, cupId, startedAt: d.getTime(), elapsedMs: minutes * 60_000, targetMs: 40 * 60_000, status, coins: minutes, quality: status === 'done' ? 'encorpado' : 'ralo' } as Session;
};

test('o dia da semana com mais tempo offline sai da média por dia da semana', () => {
  // 7 dias (hoje e os 6 anteriores): a quarta de hoje com 100 min é a maior.
  const sessions = [mk(0, 100), mk(1, 20), mk(2, 30), mk(6, 10)];
  const avgs = weekdayAverages(sessions, 8, NOW);
  assert.equal(avgs.length, 7);
  assert.equal(bestWeekday(avgs), 3); // quarta-feira
  assert.equal(bestWeekday(new Array(7).fill(0)), null);
});

test('a taxa de conclusão conta copos cheios entre os iniciados', () => {
  const sessions = [mk(1, 40), mk(2, 40), mk(3, 10, 'interrupted'), mk(4, 40)];
  assert.deepEqual(completionRate(sessions, 30, NOW), { started: 4, done: 3, rate: 0.75 });
  assert.deepEqual(completionRate([], 30, NOW), { started: 0, done: 0, rate: 0 });
});

test('a combinação favorita precisa de ao menos 3 copos', () => {
  assert.equal(favoriteCombo([mk(1, 40), mk(2, 40)]), null);
  const sessions = [mk(1, 40, 'done', 9, 'moka', 'tiny'), mk(2, 40, 'done', 9, 'moka', 'tiny'), mk(3, 40, 'done', 9, 'moka', 'tiny'), mk(4, 40)];
  assert.deepEqual(favoriteCombo(sessions), { brewerId: 'moka', cupId: 'tiny', count: 3 });
});

test('a maior sequência de todos os tempos ignora dias abaixo de 10 minutos', () => {
  const sessions = [mk(10, 30), mk(9, 30), mk(8, 30), mk(7, 5), mk(5, 30), mk(4, 30)];
  assert.equal(longestStreak(sessions), 3);
  assert.equal(longestStreak([]), 0);
});

test('a hora crítica é onde mais copos foram interrompidos, com pelo menos duas ocorrências', () => {
  assert.equal(criticalHour([mk(1, 5, 'interrupted', 22)]), null);
  assert.equal(criticalHour([mk(1, 5, 'interrupted', 22), mk(2, 5, 'interrupted', 22), mk(3, 5, 'interrupted', 14)]), 22);
});

test('o dia da semana com mais energia precisa de duas respostas', () => {
  let c = withCheckin([], 5, NOW); // quarta
  assert.equal(bestEnergyWeekday(c), null);
  c = withCheckin(c, 5, NOW - 7 * DAY); // outra quarta
  c = withCheckin(c, 2, NOW - DAY);
  assert.equal(bestEnergyWeekday(c), 3);
});
