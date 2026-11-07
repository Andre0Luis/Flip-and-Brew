// Moedas pelo tempo com a tela bloqueada (ADR-0023). Regras puras, sem importar o módulo nativo, para testar em Node.
import { dayKey } from './stats';
import { hasData, lockedMs, type UsageDay } from './usage';

/** Taxa bem abaixo da dos copos (1 moeda por minuto): guardar o celular rende, mas o copo rende muito mais. */
export const PASSIVE_MIN_PER_COIN = 10;
/** Teto por dia, para o tempo parado não virar fonte principal de moedas. */
export const PASSIVE_MAX_COINS_PER_DAY = 60;
/** Sono mínimo descontado todo dia do tempo bloqueado, em minutos. */
export const SLEEP_LIMITS = { min: 240, max: 540, step: 30, default: 360 } as const;
/** Quantos dias de moeda passiva ficam anotados (o Android guarda poucos dias de uso, então mais que isso não faz sentido). */
const KEEP_DAYS = 30;

export type PassiveState = {
  /** primeiro dia contado: o dia em que a pessoa começou a usar o recurso. Dias antes dele não rendem. */
  since: string | null;
  /** dias já pagos (um pagamento por dia, definitivo) */
  credited: string[];
  /** aviso "você ganhou N moedas" ainda não dispensado */
  notice: { coins: number } | null;
};
export const NO_PASSIVE: PassiveState = { since: null, credited: [], notice: null };

export const normalizeSleep = (min: number) => {
  const { min: lo, max: hi, step } = SLEEP_LIMITS;
  const v = Number.isFinite(min) ? Math.round(min / step) * step : SLEEP_LIMITS.default;
  return Math.min(hi, Math.max(lo, v));
};

/** Minutos que contam num dia: bloqueado, menos o sono mínimo, menos o tempo dos copos (que já rende moeda por conta própria). */
export function eligibleMin(day: UsageDay, sleepMin: number, cupMin: number, now = Date.now()): number {
  return Math.max(0, lockedMs(day, now) / 60_000 - normalizeSleep(sleepMin) - cupMin);
}

export const passiveCoins = (eligible: number) => Math.min(PASSIVE_MAX_COINS_PER_DAY, Math.floor(eligible / PASSIVE_MIN_PER_COIN));

export type PassivePlan = { credits: { day: string; coins: number }[]; total: number };

/**
 * Dias terminados que ainda não foram pagos. Hoje fica de fora (ainda está passando) e dias sem nenhum dado também
 * (sem a leitura do sistema não dá para saber). `cupMinByDay` vem de `minutesByDay(sessions)`.
 */
export function planPassive(i: {
  days: UsageDay[];
  now: number;
  sleepMin: number;
  cupMinByDay: Record<string, number>;
  since: string;
  credited: string[];
}): PassivePlan {
  const today = dayKey(i.now);
  const credits: PassivePlan['credits'] = [];
  const seen = new Set(i.credited);
  for (const d of i.days) {
    const key = dayKey(d.dayStart);
    if (key >= today || key < i.since || seen.has(key) || !hasData(d)) continue;
    seen.add(key);
    credits.push({ day: key, coins: passiveCoins(eligibleMin(d, i.sleepMin, i.cupMinByDay[key] ?? 0, i.now)) });
  }
  return { credits, total: credits.reduce((a, c) => a + c.coins, 0) };
}

/** Anota os dias pagos (só os mais recentes) e guarda o aviso, se rendeu moeda. */
export function applyPlan(state: PassiveState, plan: PassivePlan): PassiveState {
  if (!plan.credits.length) return state;
  const credited = [...state.credited, ...plan.credits.map((c) => c.day)].sort().slice(-KEEP_DAYS);
  return { ...state, credited, notice: plan.total > 0 ? { coins: (state.notice?.coins ?? 0) + plan.total } : state.notice };
}
