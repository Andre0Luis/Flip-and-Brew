import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkinStreak, discountedPrice, discountFor, offlineShare, priceOf } from './pricing';
import { dayKey } from './stats';
import type { Checkin, Session } from '@/store/types';

const NOON = new Date(2026, 9, 14, 12).getTime();
const DAY = 86_400_000;
const ck = (back: number): Checkin => ({ day: dayKey(NOON - back * DAY), energy: 3, at: NOON - back * DAY });
const longDay = (back: number): Session =>
  ({ id: `s${back}`, brewerId: 'v60', cupId: 'cup', startedAt: NOON - back * DAY, elapsedMs: 130 * 60_000, targetMs: 130 * 60_000, status: 'done', coins: 130, quality: 'encorpado' }) as Session;

test('a sequência de check-in conta dias seguidos e para no primeiro buraco', () => {
  assert.equal(checkinStreak([], NOON), 0);
  assert.equal(checkinStreak([ck(0), ck(1), ck(2)], NOON), 3);
  assert.equal(checkinStreak([ck(0), ck(1), ck(3)], NOON), 2);
});

test('sem check-in hoje, a sequência continua contando de ontem', () => {
  assert.equal(checkinStreak([ck(1), ck(2)], NOON), 2);
  assert.equal(checkinStreak([ck(2), ck(3)], NOON), 0);
});

test('a parcela offline ignora hoje e conta dias que bateram a meta', () => {
  assert.equal(offlineShare([], 120, 14, NOON), 0);
  const sessions = [longDay(0), longDay(1), longDay(2), longDay(3), longDay(4), longDay(5), longDay(6), longDay(7)];
  assert.equal(offlineShare(sessions, 120, 14, NOON), 7 / 14);
});

test('o desconto soma check-ins (até 30) e offline (até 20), com teto de 50', () => {
  assert.equal(discountFor({ checkins: [], sessions: [], goalMin: 120 }, NOON).percent, 0);
  const streak10 = Array.from({ length: 10 }, (_, i) => ck(i));
  assert.equal(discountFor({ checkins: streak10, sessions: [], goalMin: 120 }, NOON).percent, 10);
  const streak40 = Array.from({ length: 40 }, (_, i) => ck(i));
  const allMet = Array.from({ length: 14 }, (_, i) => longDay(i + 1));
  const d = discountFor({ checkins: streak40, sessions: allMet, goalMin: 120 }, NOON);
  assert.equal(d.fromCheckins, 30);
  assert.equal(d.fromOffline, 20);
  assert.equal(d.percent, 50);
});

test('preço com desconto: arredonda, nunca zera e só vale para cafeteira', () => {
  assert.equal(discountedPrice(800, 25), 600);
  assert.equal(discountedPrice(3, 50), 2);
  assert.equal(discountedPrice(1, 50), 1);
  assert.equal(discountedPrice(0, 50), 0);
  assert.equal(priceOf({ kind: 'brewer', price: 1500 }, 50), 750);
  assert.equal(priceOf({ kind: 'cup', price: 900 }, 50), 900);
});
