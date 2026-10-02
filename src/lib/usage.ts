import type { DayBar } from './stats';

/** Um dia de uso do sistema, como o módulo nativo devolve. */
export type UsageDay = { dayStart: number; unlocks: number; screenMs: number };

export const hasData = (d: UsageDay) => d.unlocks > 0 || d.screenMs > 0;

const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();

export type UsageSummary = {
  today: UsageDay | undefined;
  /** média dos dias completos com dados (hoje fica de fora, porque ainda está passando) */
  avgUnlocks: number;
  avgScreenMin: number;
  fullDays: number;
};

export function summarizeUsage(days: UsageDay[], now = Date.now()): UsageSummary {
  const today = days.find((d) => sameDay(d.dayStart, now));
  const full = days.filter((d) => !sameDay(d.dayStart, now) && hasData(d));
  const avg = (f: (d: UsageDay) => number) => (full.length ? full.reduce((a, d) => a + f(d), 0) / full.length : 0);
  return { today, avgUnlocks: avg((d) => d.unlocks), avgScreenMin: avg((d) => d.screenMs / 60_000), fullDays: full.length };
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
