import type { Checkin, Session } from '@/store/types';
import { dayKey, minutesByDay } from './stats';

export const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const;
const DAY = 86_400_000;

/** O check-in do dia, se já foi feito. */
export function todayCheckin(checkins: Checkin[], now = Date.now()): Checkin | null {
  const key = dayKey(now);
  return checkins.find((c) => c.day === key) ?? null;
}

/** Registra a energia de hoje. Responder de novo no mesmo dia troca a resposta, nunca duplica. */
export function withCheckin(checkins: Checkin[], energy: number, now = Date.now()): Checkin[] {
  const level = Math.min(5, Math.max(1, Math.round(energy)));
  const key = dayKey(now);
  return [...checkins.filter((c) => c.day !== key), { day: key, energy: level, at: now }].sort((a, b) => a.day.localeCompare(b.day));
}

/** Remove o check-in de um dia (para refazer). */
export const withoutCheckin = (checkins: Checkin[], day: string): Checkin[] => checkins.filter((c) => c.day !== day);

/** Histórico do mais recente ao mais antigo. */
export const checkinHistory = (checkins: Checkin[], limit = 14): Checkin[] => [...checkins].sort((a, b) => b.day.localeCompare(a.day)).slice(0, limit);

/** Energia dos últimos 7 dias (do mais antigo ao de hoje); dia sem resposta vira null. */
export function energyWeek(checkins: Checkin[], now = Date.now()): (number | null)[] {
  const by = new Map(checkins.map((c) => [c.day, c.energy]));
  return Array.from({ length: 7 }, (_, i) => by.get(dayKey(now - (6 - i) * DAY)) ?? null);
}

/** Média e comparação da energia entre dias com mais e com menos tempo offline que a meta (limitada a 2 h). */
export function energySummary(checkins: Checkin[], sessions: Session[], goalMin: number, days = 30, now = Date.now()) {
  const since = dayKey(now - days * DAY);
  const recent = checkins.filter((c) => c.day >= since);
  if (!recent.length) return null;
  const by = minutesByDay(sessions);
  const limit = Math.min(goalMin, 120);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const high = recent.filter((c) => (by[c.day] ?? 0) >= limit);
  const low = recent.filter((c) => (by[c.day] ?? 0) < limit);
  return {
    average: avg(recent.map((c) => c.energy)),
    week: energyWeek(checkins, now),
    high: high.length >= 2 ? avg(high.map((c) => c.energy)) : null,
    low: low.length >= 2 ? avg(low.map((c) => c.energy)) : null,
  };
}
