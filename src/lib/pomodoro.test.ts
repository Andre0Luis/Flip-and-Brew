import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breakFor, CYCLE, cyclePosition, FOCUS_MIN, makeRest, pomodorosToday, restLeftMs, restOver } from './pomodoro';
import type { Session } from '@/store/types';

const NOW = new Date(2026, 9, 14, 15).getTime();
const DAY = 86_400_000;
const sess = (over: Partial<Session>): Session =>
  ({ id: `p${Math.random()}`, brewerId: 'melitta', cupId: 'paper', startedAt: NOW - 3_600_000, elapsedMs: FOCUS_MIN * 60_000, targetMs: FOCUS_MIN * 60_000, status: 'done', coins: 30, quality: 'encorpado', pomodoro: true, ...over }) as Session;

test('só contam os pomodoros terminados hoje; interrompidos, de ontem e copos de café ficam de fora', () => {
  const sessions = [sess({}), sess({ status: 'interrupted' }), sess({ startedAt: NOW - DAY }), sess({ pomodoro: undefined })];
  assert.equal(pomodorosToday(sessions, NOW), 1);
});

test('o quarto foco fecha o ciclo com pausa longa, os demais têm pausa curta', () => {
  assert.deepEqual(breakFor(1), { minutes: 5, long: false });
  assert.deepEqual(breakFor(3), { minutes: 5, long: false });
  assert.deepEqual(breakFor(CYCLE), { minutes: 15, long: true });
  assert.deepEqual(breakFor(CYCLE + 1), { minutes: 5, long: false });
  assert.deepEqual(breakFor(CYCLE * 2), { minutes: 15, long: true });
});

test('a posição no ciclo volta a 1 depois do quarto foco', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 8, 9].map(cyclePosition), [0, 1, 2, 3, 4, 1, 4, 1]);
});

test('a pausa conta pelo horário e termina sozinha', () => {
  const rest = makeRest(1, NOW);
  assert.equal(rest.targetMs, 5 * 60_000);
  assert.equal(restLeftMs(rest, NOW + 60_000), 4 * 60_000);
  assert.equal(restOver(rest, NOW + 4 * 60_000), false);
  assert.equal(restOver(rest, NOW + 5 * 60_000), true);
  assert.equal(restLeftMs(rest, NOW + 99 * 60_000), 0);
});
