import { dayKey } from './stats';
import type { Session } from '@/store/types';

/** Técnica Pomodoro. Os tempos são da pessoa; o padrão é o clássico: 25 min de foco, 5 de pausa e 15 de pausa longa a cada 4 focos. */
export type PomoConfig = { focusMin: number; breakMin: number; longBreakMin: number; cycle: number };

export const DEFAULT_POMO: PomoConfig = { focusMin: 25, breakMin: 5, longBreakMin: 15, cycle: 4 };

/** Limites e passos de cada campo, usados pela tela de ajustes. */
export const POMO_LIMITS = {
  focusMin: { min: 5, max: 120, step: 5 },
  breakMin: { min: 1, max: 30, step: 1 },
  longBreakMin: { min: 5, max: 60, step: 5 },
  cycle: { min: 2, max: 8, step: 1 },
} as const;

/** Aceita qualquer coisa vinda do disco ou do backup e devolve uma configuração válida. */
export function normalizePomo(raw?: Partial<PomoConfig> | null): PomoConfig {
  const pick = (k: keyof PomoConfig) => {
    const { min, max } = POMO_LIMITS[k];
    const v = Math.round(Number(raw?.[k]));
    return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : DEFAULT_POMO[k];
  };
  return { focusMin: pick('focusMin'), breakMin: pick('breakMin'), longBreakMin: pick('longBreakMin'), cycle: pick('cycle') };
}

/** Pausa em andamento. Como o copo, conta pelo horário de início, então sobrevive ao app em segundo plano. */
export type Rest = { startedAt: number; targetMs: number; long: boolean };

/** Pomodoros terminados hoje (copos de foco que encheram). Os interrompidos não contam. */
export function pomodorosToday(sessions: Session[], now: number): number {
  const today = dayKey(now);
  return sessions.filter((s) => s.pomodoro && s.status === 'done' && dayKey(s.startedAt) === today).length;
}

/** Posição no ciclo, de 1 até `cycle`: o último foco fecha o ciclo, o seguinte abre outro. */
export function cyclePosition(doneToday: number, cfg: PomoConfig = DEFAULT_POMO): number {
  return doneToday <= 0 ? 0 : ((doneToday - 1) % cfg.cycle) + 1;
}

/** A pausa que vem depois do foco que acabou de fechar: longa ao fechar o ciclo, curta nos demais. */
export function breakFor(doneToday: number, cfg: PomoConfig = DEFAULT_POMO): { minutes: number; long: boolean } {
  const long = doneToday > 0 && doneToday % cfg.cycle === 0;
  return { minutes: long ? cfg.longBreakMin : cfg.breakMin, long };
}

export function makeRest(doneToday: number, now: number, cfg: PomoConfig = DEFAULT_POMO): Rest {
  const b = breakFor(doneToday, cfg);
  return { startedAt: now, targetMs: b.minutes * 60_000, long: b.long };
}

export const restLeftMs = (rest: Rest, now: number) => Math.max(0, rest.startedAt + rest.targetMs - now);
export const restOver = (rest: Rest, now: number) => restLeftMs(rest, now) === 0;
