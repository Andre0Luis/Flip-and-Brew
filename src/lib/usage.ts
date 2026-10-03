import type { DayBar } from './stats';

/** Um dia de uso do sistema, como o módulo nativo devolve. */
export type UsageDay = { dayStart: number; unlocks: number; /** vezes que a tela apagou ou foi bloqueada */ locks: number; screenMs: number };

const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

export const hasData = (d: UsageDay) => d.unlocks > 0 || d.locks > 0 || d.screenMs > 0;

const DAY_MS = 86_400_000;

/** Tempo com a tela apagada ou bloqueada no dia: o que passou do dia menos o tempo de tela ligada. Conta como tempo offline. */
export function lockedMs(d: UsageDay, now = Date.now()): number {
  const elapsed = sameDay(d.dayStart, now) ? now - d.dayStart : DAY_MS;
  return Math.max(0, elapsed - d.screenMs);
}

export type UsageSummary = {
  today: UsageDay | undefined;
  /** média dos dias completos com dados (hoje fica de fora, porque ainda está passando) */
  avgUnlocks: number;
  avgLocks: number;
  avgScreenMin: number;
  /** média de minutos por dia com a tela bloqueada (dias completos) */
  avgLockedMin: number;
  fullDays: number;
};

export function summarizeUsage(days: UsageDay[], now = Date.now()): UsageSummary {
  const today = days.find((d) => sameDay(d.dayStart, now));
  const full = days.filter((d) => !sameDay(d.dayStart, now) && hasData(d));
  const avg = (f: (d: UsageDay) => number) => (full.length ? full.reduce((a, d) => a + f(d), 0) / full.length : 0);
  return {
    today,
    avgUnlocks: avg((d) => d.unlocks),
    avgLocks: avg((d) => d.locks),
    avgScreenMin: avg((d) => d.screenMs / 60_000),
    avgLockedMin: avg((d) => lockedMs(d, now) / 60_000),
    fullDays: full.length,
  };
}

/** Tempo de tela por dia no mesmo formato do gráfico de minutos offline. */
export function screenBars(days: UsageDay[], now = Date.now()): DayBar[] {
  return days.map((d) => ({
    key: String(d.dayStart),
    weekday: new Date(d.dayStart).getDay(),
    minutes: d.screenMs / 60_000,
    isToday: sameDay(d.dayStart, now),
  }));
}
