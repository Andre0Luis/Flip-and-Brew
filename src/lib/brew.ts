export type Quality = 'ralo' | 'equilibrado' | 'encorpado';

export const GRACE_MS = 15_000; // tempo para pousar o celular antes de contar como pegada
export const MIN_LOGGED_MS = 30_000; // abaixo disso a sessão é descartada (toque acidental)
export const COINS_PER_MINUTE = 1;
export const FULL_CUP_BONUS = 0.2;

export function qualityOf(ratio: number): Quality {
  if (ratio >= 1) return 'encorpado';
  if (ratio >= 0.35) return 'equilibrado';
  return 'ralo';
}

export function coinsFor(elapsedMs: number, targetMs: number): number {
  const minutes = Math.floor(Math.min(elapsedMs, targetMs) / 60_000);
  const base = minutes * COINS_PER_MINUTE;
  const bonus = elapsedMs >= targetMs ? Math.round((targetMs / 60_000) * FULL_CUP_BONUS) : 0;
  return base + bonus;
}

export type BrewOutcome = { elapsedMs: number; status: 'done' | 'interrupted'; coins: number; quality: Quality };

export function outcomeOf(startedAt: number, targetMs: number, now: number): BrewOutcome {
  const elapsedMs = Math.max(0, Math.min(now - startedAt, targetMs));
  const status = elapsedMs >= targetMs ? 'done' : 'interrupted';
  return { elapsedMs, status, coins: coinsFor(elapsedMs, targetMs), quality: qualityOf(elapsedMs / targetMs) };
}

