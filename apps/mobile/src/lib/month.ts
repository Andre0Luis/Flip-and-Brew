import type { Checkin, Session } from '@/store/types';
import { dayKey, minutesByDay } from './stats';

export type MonthCell = {
  key: string;
  /** dia do mês (1 a 31) */
  day: number;
  ts: number;
  /** pertence ao mês mostrado (as pontas da primeira e da última semana, não) */
  inMonth: boolean;
  isToday: boolean;
  future: boolean;
  /** energia do check-in (1 a 5) ou null */
  energy: number | null;
  /** minutos offline no dia */
  minutes: number;
  goalMet: boolean;
};

/** Grade do mês em semanas de domingo a sábado, com check-in, minutos offline e se a meta foi batida em cada dia. */
export function monthGrid(year: number, month: number, checkins: Checkin[], sessions: Session[], goalMin: number, now = Date.now()): MonthCell[][] {
  const energy = new Map(checkins.map((c) => [c.day, c.energy]));
  const by = minutesByDay(sessions);
  const todayKey = dayKey(now);
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = new Date(year, month, 1 - first.getDay());
  const end = new Date(year, month, last.getDate() + (6 - last.getDay()));
  const weeks: MonthCell[][] = [];
  for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const key = dayKey(d.getTime());
    const minutes = by[key] ?? 0;
    const cell: MonthCell = {
      key,
      day: d.getDate(),
      ts: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime(),
      inMonth: d.getMonth() === month,
      isToday: key === todayKey,
      future: key > todayKey,
      energy: energy.get(key) ?? null,
      minutes,
      goalMet: minutes >= goalMin,
    };
    if (d.getDay() === 0) weeks.push([]);
    weeks[weeks.length - 1].push(cell);
  }
  return weeks;
}

export function monthSummary(weeks: MonthCell[][]) {
  const cells = weeks.flat().filter((c) => c.inMonth && !c.future);
  const answered = cells.filter((c) => c.energy !== null);
  const avg = answered.length ? answered.reduce((a, c) => a + (c.energy ?? 0), 0) / answered.length : 0;
  return { answered: answered.length, avgEnergy: avg, goalDays: cells.filter((c) => c.goalMet).length, days: cells.length };
}

/** Mês anterior ou seguinte, sem passar do mês atual. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}
