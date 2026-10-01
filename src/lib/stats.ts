import type { Session } from '@/store/types';

const DAY = 86_400_000;
export const MIN_STREAK_MINUTES = 10;

export function dayKey(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function minutesByDay(sessions: Session[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of sessions) {
    const k = dayKey(s.startedAt);
    out[k] = (out[k] ?? 0) + s.elapsedMs / 60_000;
  }
  return out;
}

export function todayStats(sessions: Session[], now = Date.now()) {
  const key = dayKey(now);
  const today = sessions.filter((s) => dayKey(s.startedAt) === key);
  return {
    minutes: today.reduce((a, s) => a + s.elapsedMs / 60_000, 0),
    cups: today.filter((s) => s.status === 'done').length,
    count: today.length,
  };
}

const INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export type DayBar = { key: string; label: string; minutes: number; isToday: boolean };

export function lastDays(sessions: Session[], n: number, now = Date.now()): DayBar[] {
  const by = minutesByDay(sessions);
  const t0 = startOfDay(now);
  const out: DayBar[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const ts = t0 - i * DAY;
    const k = dayKey(ts);
    out.push({ key: k, label: INITIALS[new Date(ts).getDay()], minutes: by[k] ?? 0, isToday: i === 0 });
  }
  return out;
}

export type Cell = { key: string; level: 0 | 1 | 2 | 3; missed: boolean; isToday: boolean; label: string };

/** Calendário de 4 semanas terminando hoje. Nível 3 = meta batida. "missed" = dia sem nada depois do primeiro uso. */
export function calendar(sessions: Session[], goalMin: number, days = 28, now = Date.now()): Cell[] {
  const by = minutesByDay(sessions);
  const first = sessions.length ? Math.min(...sessions.map((s) => startOfDay(s.startedAt))) : Infinity;
  const t0 = startOfDay(now);
  const out: Cell[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const ts = t0 - i * DAY;
    const k = dayKey(ts);
    const m = by[k] ?? 0;
    const ratio = goalMin > 0 ? m / goalMin : 0;
    const level: Cell['level'] = m < 1 ? 0 : ratio >= 1 ? 3 : ratio >= 0.5 ? 2 : 1;
    out.push({ key: k, level, missed: m < 1 && ts >= first && i !== 0, isToday: i === 0, label: INITIALS[new Date(ts).getDay()] });
  }
  return out;
}

export function streak(sessions: Session[], now = Date.now()): number {
  const by = minutesByDay(sessions);
  const t0 = startOfDay(now);
  let i = (by[dayKey(t0)] ?? 0) >= MIN_STREAK_MINUTES ? 0 : 1; // hoje ainda pode virar
  let n = 0;
  while ((by[dayKey(t0 - i * DAY)] ?? 0) >= MIN_STREAK_MINUTES) {
    n++;
    i++;
  }
  return n;
}

export function longestSession(sessions: Session[], sinceTs = 0): Session | undefined {
  return sessions.filter((s) => s.startedAt >= sinceTs).sort((a, b) => b.elapsedMs - a.elapsedMs)[0];
}

/** Minutos offline por hora do dia (0 a 23), somando as sessões dos últimos `days` dias. */
export function hourly(sessions: Session[], days = 30, now = Date.now()): number[] {
  const out = new Array<number>(24).fill(0);
  const since = now - days * DAY;
  for (const s of sessions) {
    if (s.startedAt < since) continue;
    let t = s.startedAt;
    const end = s.startedAt + s.elapsedMs;
    while (t < end) {
      const nextHour = new Date(t);
      nextHour.setMinutes(0, 0, 0);
      const stop = Math.min(end, nextHour.getTime() + 3_600_000);
      out[new Date(t).getHours()] += (stop - t) / 60_000;
      t = stop;
    }
  }
  return out;
}

export const TRIGGERS = ['Notificação', 'Tédio', 'Trabalho', 'Hábito', 'Outro'] as const;
export type Trigger = (typeof TRIGGERS)[number];

export function triggerCounts(sessions: Session[], days = 30, now = Date.now()): { trigger: string; count: number }[] {
  const since = now - days * DAY;
  const counts = new Map<string, number>();
  for (const s of sessions) {
    if (s.startedAt < since || !s.trigger) continue;
    counts.set(s.trigger, (counts.get(s.trigger) ?? 0) + 1);
  }
  return [...counts.entries()].map(([trigger, count]) => ({ trigger, count })).sort((a, b) => b.count - a.count);
}

export function moodSummary(sessions: Session[], goalMin: number, days = 30, now = Date.now()) {
  const since = now - days * DAY;
  const rated = sessions.filter((s) => s.mood && s.startedAt >= since);
  if (!rated.length) return null;
  const by = minutesByDay(sessions);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const high = rated.filter((s) => (by[dayKey(s.startedAt)] ?? 0) >= Math.min(goalMin, 120));
  const low = rated.filter((s) => (by[dayKey(s.startedAt)] ?? 0) < Math.min(goalMin, 120));
  return {
    average: avg(rated.map((s) => s.mood!)),
    ratings: rated.slice(-7).map((s) => s.mood!),
    high: high.length >= 2 ? avg(high.map((s) => s.mood!)) : null,
    low: low.length >= 2 ? avg(low.map((s) => s.mood!)) : null,
  };
}

/** Compara o dia seguinte a um dia perdido com a média dos demais dias com uso. */
export function afterMissInsight(sessions: Session[], now = Date.now()): { percent: number } | null {
  if (!sessions.length) return null;
  const by = minutesByDay(sessions);
  const t0 = startOfDay(now);
  const first = Math.min(...sessions.map((s) => startOfDay(s.startedAt)));
  const afterMiss: number[] = [];
  const others: number[] = [];
  for (let ts = first; ts < t0; ts += DAY) {
    const m = by[dayKey(ts)] ?? 0;
    if (m < 1 || ts === first) continue; // só dias com uso entram na comparação
    const prev = by[dayKey(ts - DAY)] ?? 0;
    if (prev < 1) afterMiss.push(m);
    else others.push(m);
  }
  if (!afterMiss.length || !others.length) return null;
  const avgAfter = afterMiss.reduce((a, b) => a + b, 0) / afterMiss.length;
  const avgOthers = others.reduce((a, b) => a + b, 0) / others.length;
  if (avgOthers <= 0) return null;
  return { percent: Math.round(((avgAfter - avgOthers) / avgOthers) * 100) };
}

export type Score = { value: number; goalPct: number; completionPct: number; streakPct: number };

/** Equilíbrio de 0 a 100: 50% meta diária, 30% copos terminados, 20% sequência (14 dias = cheio). */
export function balanceScore(sessions: Session[], goalMin: number, now = Date.now()): Score | null {
  const week = lastDays(sessions, 7, now);
  const recent = sessions.filter((s) => s.startedAt >= startOfDay(now) - 6 * DAY);
  if (!recent.length) return null;
  const goalPct = week.reduce((a, d) => a + Math.min(d.minutes / goalMin, 1), 0) / 7;
  const completionPct = recent.filter((s) => s.status === 'done').length / recent.length;
  const streakPct = Math.min(streak(sessions, now) / 14, 1);
  return {
    value: Math.round((goalPct * 0.5 + completionPct * 0.3 + streakPct * 0.2) * 100),
    goalPct,
    completionPct,
    streakPct,
  };
}

export function weekTotals(sessions: Session[], now = Date.now()) {
  const days = lastDays(sessions, 7, now);
  const prev = lastDays(sessions, 14, now).slice(0, 7);
  const sum = (d: DayBar[]) => d.reduce((a, x) => a + x.minutes, 0);
  const since = startOfDay(now) - 6 * DAY;
  const inWeek = sessions.filter((s) => s.startedAt >= since);
  return {
    minutes: sum(days),
    deltaMinutes: sum(days) - sum(prev),
    cups: inWeek.filter((s) => s.status === 'done').length,
    full: inWeek.filter((s) => s.quality === 'encorpado').length,
    interrupted: inWeek.filter((s) => s.status === 'interrupted').length,
    sessions: inWeek.length,
  };
}
