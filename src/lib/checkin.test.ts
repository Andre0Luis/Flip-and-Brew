import { test } from 'node:test';
import assert from 'node:assert/strict';
import { energySummary, energyWeek, todayCheckin, withCheckin } from './checkin';
import { dayKey } from './stats';
import type { Session } from '@/store/types';

const NOON = new Date(2026, 9, 14, 12).getTime();
const DAY = 86_400_000;

test('responder de novo no mesmo dia troca a resposta, sem duplicar', () => {
  const a = withCheckin([], 2, NOON);
  const b = withCheckin(a, 4, NOON + 3_600_000);
  assert.equal(b.length, 1);
  assert.equal(todayCheckin(b, NOON)?.energy, 4);
});

test('a energia fica entre 1 e 5 e a lista sai ordenada por dia', () => {
  let c = withCheckin([], 9, NOON);
  c = withCheckin(c, 0, NOON - DAY);
  assert.deepEqual(c.map((x) => x.energy), [1, 5]);
  assert.ok(c[0].day < c[1].day);
});

test('sem check-in hoje, não há resposta do dia', () => {
  assert.equal(todayCheckin(withCheckin([], 3, NOON - DAY), NOON), null);
});

test('a semana tem 7 dias, com null onde não houve resposta', () => {
  const w = energyWeek(withCheckin(withCheckin([], 5, NOON), 2, NOON - 2 * DAY), NOON);
  assert.equal(w.length, 7);
  assert.deepEqual(w, [null, null, null, null, 2, null, 5]);
});

test('o resumo compara dias com muito e pouco tempo offline', () => {
  const sessions: Session[] = [];
  let checkins: ReturnType<typeof withCheckin> = [];
  for (let i = 1; i <= 6; i++) {
    const t = NOON - i * DAY;
    const long = i % 2 === 0;
    checkins = withCheckin(checkins, long ? 5 : 2, t);
    if (long) sessions.push({ id: `s${i}`, brewerId: 'v60', cupId: 'cup', startedAt: t, elapsedMs: 130 * 60_000, targetMs: 130 * 60_000, status: 'done', coins: 130, quality: 'full' } as Session);
  }
  const s = energySummary(checkins, sessions, 120, 30, NOON)!;
  assert.equal(s.high, 5);
  assert.equal(s.low, 2);
  assert.equal(s.average, 3.5);
});

test('sem check-ins, o resumo é nulo', () => {
  assert.equal(energySummary([], [], 120, 30, NOON), null);
  assert.equal(dayKey(NOON), '2026-10-14');
});
