import { dayKey } from './stats';
import type { Session } from '@/store/types';

/** Técnica Pomodoro: 25 min de foco, 5 de pausa, e a cada 4 focos uma pausa longa. */
export const FOCUS_MIN = 25;
export const SHORT_BREAK_MIN = 5;
export const LONG_BREAK_MIN = 15;
export const CYCLE = 4;

/** Pausa em andamento. Como o copo, conta pelo horário de início, então sobrevive ao app em segundo plano. */
export type Rest = { startedAt: number; targetMs: number; long: boolean };

/** Pomodoros terminados hoje (copos de foco que encheram). Os interrompidos não contam. */
export function pomodorosToday(sessions: Session[], now: number): number {
  const today = dayKey(now);
  return sessions.filter((s) => s.pomodoro && s.status === 'done' && dayKey(s.startedAt) === today).length;
}

/** Posição no ciclo, de 1 a CYCLE: o 4º foco fecha o ciclo, o 5º abre outro. */
export function cyclePosition(doneToday: number): number {
  return doneToday <= 0 ? 0 : ((doneToday - 1) % CYCLE) + 1;
}

/** A pausa que vem depois do foco que acabou de fechar: longa a cada CYCLE focos, curta nos demais. */
export function breakFor(doneToday: number): { minutes: number; long: boolean } {
  const long = doneToday > 0 && doneToday % CYCLE === 0;
  return { minutes: long ? LONG_BREAK_MIN : SHORT_BREAK_MIN, long };
}

export function makeRest(doneToday: number, now: number): Rest {
  const b = breakFor(doneToday);
  return { startedAt: now, targetMs: b.minutes * 60_000, long: b.long };
}

export const restLeftMs = (rest: Rest, now: number) => Math.max(0, rest.startedAt + rest.targetMs - now);
export const restOver = (rest: Rest, now: number) => restLeftMs(rest, now) === 0;
