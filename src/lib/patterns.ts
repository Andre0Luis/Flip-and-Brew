import type { Checkin, Session } from '@/store/types';
import { dayKey, MIN_STREAK_MINUTES, minutesByDay } from './stats';

const DAY = 86_400_000;
const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Minutos offline médios por dia da semana (0 = domingo), nas últimas `weeks` semanas, só com os dias desde o primeiro copo. */
export function weekdayAverages(sessions: Session[], weeks = 8, now = Date.now()): number[] {
  const by = minutesByDay(sessions);
  const first = sessions.length ? Math.min(...sessions.map((s) => startOfDay(s.startedAt))) : startOfDay(now);
  const since = Math.max(first, startOfDay(now) - (weeks * 7 - 1) * DAY);
  const sum = new Array<number>(7).fill(0);
  const n = new Array<number>(7).fill(0);
  for (let t = since; t <= startOfDay(now); t += DAY) {
    const wd = new Date(t + DAY / 2).getDay();
    sum[wd] += by[dayKey(t)] ?? 0;
    n[wd] += 1;
  }
  return sum.map((s, i) => (n[i] ? s / n[i] : 0));
}

/** Dia da semana com mais tempo offline, ou null se ainda não há dado. */
export function bestWeekday(avgs: number[]): number | null {
  const max = Math.max(...avgs);
  return max > 0 ? avgs.indexOf(max) : null;
}

/** Quantos copos chegaram ao fim, entre os iniciados nos últimos `days` dias. */
export function completionRate(sessions: Session[], days = 30, now = Date.now()) {
  const since = startOfDay(now) - (days - 1) * DAY;
  const list = sessions.filter((s) => s.startedAt >= since);
  const done = list.filter((s) => s.status === 'done').length;
  return { started: list.length, done, rate: list.length ? done / list.length : 0 };
}

/** Combinação de cafeteira e xícara mais usada (precisa de pelo menos 3 copos). */
export function favoriteCombo(sessions: Session[]): { brewerId: string; cupId: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const s of sessions) counts.set(`${s.brewerId}|${s.cupId}`, (counts.get(`${s.brewerId}|${s.cupId}`) ?? 0) + 1);
  let best: [string, number] | null = null;
  for (const e of counts) if (!best || e[1] > best[1]) best = e;
  if (!best || best[1] < 3) return null;
  const [brewerId, cupId] = best[0].split('|');
  return { brewerId, cupId, count: best[1] };
}

/** Maior sequência de dias com pelo menos 10 minutos offline, em todo o histórico. */
export function longestStreak(sessions: Session[]): number {
  const by = minutesByDay(sessions);
  const days = Object.keys(by).filter((k) => by[k] >= MIN_STREAK_MINUTES).sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const k of days) {
    const t = new Date(`${k}T12:00:00`).getTime();
    run = prev !== null && Math.round((t - prev) / DAY) === 1 ? run + 1 : 1;
    prev = t;
    best = Math.max(best, run);
  }
  return best;
}

/** Hora do dia em que mais copos foram interrompidos (precisa de pelo menos 2). */
export function criticalHour(sessions: Session[]): number | null {
  const counts = new Array<number>(24).fill(0);
  for (const s of sessions) if (s.status === 'interrupted') counts[new Date(s.startedAt).getHours()] += 1;
  const max = Math.max(...counts);
  return max >= 2 ? counts.indexOf(max) : null;
}

/** Dia da semana com a energia média mais alta nos check-ins (precisa de pelo menos 2 respostas nesse dia). */
export function bestEnergyWeekday(checkins: Checkin[]): number | null {
  const sum = new Array<number>(7).fill(0);
  const n = new Array<number>(7).fill(0);
  for (const c of checkins) {
    const wd = new Date(`${c.day}T12:00:00`).getDay();
    sum[wd] += c.energy;
    n[wd] += 1;
  }
  let best: number | null = null;
  let bestAvg = 0;
  sum.forEach((s, i) => {
    if (n[i] >= 2 && s / n[i] > bestAvg) {
      bestAvg = s / n[i];
      best = i;
    }
  });
  return best;
}
