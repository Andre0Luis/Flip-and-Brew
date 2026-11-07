import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_BONUS, allClaimed, bonusClaimed, claimKey, missionsFor, pruneClaims, recentMissions } from './missions';
import { withCheckin } from './checkin';
import { dayKey } from './stats';
import type { Session } from '@/store/types';

const NOW = new Date(2026, 9, 14, 12).getTime();
const DAY = 86_400_000;
const base = { sessions: [] as Session[], checkins: [], practicesDone: [] as string[], goalMin: 120, claimed: [] as string[] };
const sess = (hour: number, minutes: number, status: 'done' | 'interrupted' = 'done', daysBack = 0): Session => {
  const d = new Date(NOW - daysBack * DAY);
  d.setHours(hour, 0, 0, 0);
  return { id: `m${hour}-${minutes}-${daysBack}`, brewerId: 'melitta', cupId: 'paper', startedAt: d.getTime(), elapsedMs: minutes * 60_000, targetMs: 40 * 60_000, status, coins: minutes, quality: status === 'done' ? 'encorpado' : 'ralo' } as Session;
};

test('o dia sorteia três missões, sempre as mesmas para a mesma data', () => {
  const a = missionsFor(base, NOW);
  const b = missionsFor(base, NOW + 3_600_000);
  assert.equal(a.length, 3);
  assert.deepEqual(a.map((m) => m.id), b.map((m) => m.id));
  const days = new Set(Array.from({ length: 14 }, (_, i) => missionsFor(base, NOW + i * DAY).map((m) => m.id).join()));
  assert.ok(days.size > 3, 'as missões variam de um dia para o outro');
});

test('o progresso vem dos dados do dia', () => {
  let found = false;
  for (let i = 0; i < 10 && !found; i++) {
    const t = NOW + i * DAY;
    const ctx = { ...base, checkins: withCheckin([], 4, t), practicesDone: [dayKey(t)], sessions: [sess(8, 130, 'done', -i), sess(21, 130, 'done', -i)].map((s) => ({ ...s, startedAt: s.startedAt + i * DAY })) };
    const ms = missionsFor(ctx, t);
    for (const m of ms) {
      if (m.id === 'checkin' || m.id === 'practice') assert.equal(m.done, true);
      if (m.id === 'fullcup1' || m.id === 'morning' || m.id === 'night' || m.id === 'offline-goal' || m.id === 'offline-half') assert.equal(m.done, true, m.id);
      if (m.id === 'fullcup2') assert.equal(m.done, true);
    }
    found = true;
  }
  assert.ok(found);
});

test('sem dados, nada está concluído e o progresso não passa do alvo', () => {
  const ms = missionsFor(base, NOW);
  assert.ok(ms.every((m) => !m.done && m.progress === 0 && !m.claimed));
  const heavy = missionsFor({ ...base, sessions: [sess(10, 500)] }, NOW);
  assert.ok(heavy.every((m) => m.progress <= m.target));
});

test('resgatado, bônus e limpeza de resgates antigos', () => {
  const ms = missionsFor(base, NOW);
  const claimed = ms.map((m) => claimKey(dayKey(NOW), m.id));
  assert.equal(allClaimed(missionsFor({ ...base, claimed }, NOW)), true);
  assert.equal(bonusClaimed([...claimed, claimKey(dayKey(NOW), 'all')], NOW), true);
  assert.equal(bonusClaimed(claimed, NOW), false);
  assert.equal(ALL_BONUS, 30);
  const old = claimKey(dayKey(NOW - 40 * DAY), 'checkin');
  assert.deepEqual(pruneClaims([old, ...claimed], NOW), claimed);
});

test('o histórico lista as missões resgatadas, da mais nova para a mais antiga, sem o bônus', () => {
  const list = recentMissions(['2026-10-12:checkin', '2026-10-14:fullcup1', '2026-10-14:all', '2026-10-13:night']);
  assert.deepEqual(list, [{ day: '2026-10-14', id: 'fullcup1' }, { day: '2026-10-13', id: 'night' }, { day: '2026-10-12', id: 'checkin' }]);
  assert.equal(recentMissions(list.map((l) => `${l.day}:${l.id}`), 2).length, 2);
});
