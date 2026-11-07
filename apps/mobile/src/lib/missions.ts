import type { Checkin, Session } from '@/store/types';
import { dayKey } from './stats';

/** Bônus por resgatar as três missões do dia. */
export const ALL_BONUS = 30;

export type MissionId = 'checkin' | 'practice' | 'fullcup1' | 'fullcup2' | 'morning' | 'night' | 'offline-half' | 'offline-goal';

type Def = { id: MissionId; reward: number };

// Três vagas por dia, sorteadas de forma fixa pela data: uma de hábito, uma de copo e uma de tempo offline.
const SLOT_HABIT: Def[] = [
  { id: 'checkin', reward: 10 },
  { id: 'practice', reward: 10 },
];
const SLOT_CUP: Def[] = [
  { id: 'fullcup1', reward: 20 },
  { id: 'fullcup2', reward: 35 },
  { id: 'morning', reward: 15 },
  { id: 'night', reward: 15 },
];
const SLOT_OFFLINE: Def[] = [
  { id: 'offline-half', reward: 15 },
  { id: 'offline-goal', reward: 30 },
];

export type MissionContext = { sessions: Session[]; checkins: Checkin[]; practicesDone: string[]; goalMin: number; claimed: string[] };

export type Mission = { id: MissionId; reward: number; target: number; progress: number; done: boolean; claimed: boolean };

/** Número do dia, para o sorteio ser igual para a mesma data em qualquer aparelho. */
const dayNumber = (ts: number) => {
  const d = new Date(ts);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
};

export const claimKey = (day: string, id: string) => `${day}:${id}`;

export function missionsFor(ctx: MissionContext, now = Date.now()): Mission[] {
  const key = dayKey(now);
  const n = dayNumber(now);
  const picks = [SLOT_HABIT[n % SLOT_HABIT.length], SLOT_CUP[(n * 7 + 1) % SLOT_CUP.length], SLOT_OFFLINE[(n * 3 + 1) % SLOT_OFFLINE.length]];
  const today = ctx.sessions.filter((s) => dayKey(s.startedAt) === key);
  const fullToday = today.filter((s) => s.status === 'done' && s.quality === 'encorpado').length;
  const minutesToday = today.reduce((a, s) => a + s.elapsedMs / 60_000, 0);
  const halfGoal = Math.max(30, Math.round(ctx.goalMin / 2 / 15) * 15);

  const spec = (d: Def): { target: number; progress: number } => {
    switch (d.id) {
      case 'checkin':
        return { target: 1, progress: ctx.checkins.some((c) => c.day === key) ? 1 : 0 };
      case 'practice':
        return { target: 1, progress: ctx.practicesDone.includes(key) ? 1 : 0 };
      case 'fullcup1':
        return { target: 1, progress: fullToday };
      case 'fullcup2':
        return { target: 2, progress: fullToday };
      case 'morning':
        return { target: 1, progress: today.some((s) => new Date(s.startedAt).getHours() < 9) ? 1 : 0 };
      case 'night':
        return { target: 1, progress: today.some((s) => new Date(s.startedAt).getHours() >= 20) ? 1 : 0 };
      case 'offline-half':
        return { target: halfGoal, progress: Math.floor(minutesToday) };
      case 'offline-goal':
        return { target: ctx.goalMin, progress: Math.floor(minutesToday) };
    }
  };

  return picks.map((d) => {
    const { target, progress } = spec(d);
    return { id: d.id, reward: d.reward, target, progress: Math.min(progress, target), done: progress >= target, claimed: ctx.claimed.includes(claimKey(key, d.id)) };
  });
}

export const allClaimed = (ms: Mission[]) => ms.length > 0 && ms.every((m) => m.claimed);
export const bonusClaimed = (claimed: string[], now = Date.now()) => claimed.includes(claimKey(dayKey(now), 'all'));

/** Mantém só as resgates dos últimos dias, para a lista não crescer para sempre. */
export function pruneClaims(claimed: string[], now = Date.now(), keepDays = 14): string[] {
  const since = dayKey(now - keepDays * 86_400_000);
  return claimed.filter((c) => c.slice(0, 10) >= since);
}

/** Missões resgatadas mais recentes (sem o bônus), da mais nova para a mais antiga. */
export function recentMissions(claimed: string[], limit = 10): { day: string; id: MissionId }[] {
  return claimed
    .filter((c) => !c.endsWith(':all'))
    .map((c) => ({ day: c.slice(0, 10), id: c.slice(11) as MissionId }))
    .sort((a, b) => b.day.localeCompare(a.day))
    .slice(0, limit);
}
