import type { Checkin, Session } from '@/store/types';
import { dayKey, minutesByDay } from './stats';

const DAY = 86_400_000;

/** Desconto nas cafeteiras: até 30% por dias seguidos de check-in e até 20% por dias dentro da meta offline. */
export const MAX_CHECKIN_DISCOUNT = 30;
export const MAX_OFFLINE_DISCOUNT = 20;
export const OFFLINE_WINDOW_DAYS = 14;

/** Dias seguidos de check-in. Se hoje ainda não foi respondido, a conta segue de ontem, para a sequência não "quebrar" de manhã. */
export function checkinStreak(checkins: Checkin[], now = Date.now()): number {
  const days = new Set(checkins.map((c) => c.day));
  let t = days.has(dayKey(now)) ? now : now - DAY;
  let n = 0;
  while (days.has(dayKey(t))) {
    n++;
    t -= DAY;
  }
  return n;
}

/** Fração (0 a 1) dos últimos dias completos em que o tempo offline bateu a meta diária. Hoje não entra: o dia ainda não acabou. */
export function offlineShare(sessions: Session[], goalMin: number, days = OFFLINE_WINDOW_DAYS, now = Date.now()): number {
  const by = minutesByDay(sessions);
  let met = 0;
  for (let i = 1; i <= days; i++) if ((by[dayKey(now - i * DAY)] ?? 0) >= goalMin) met++;
  return met / days;
}

export type DiscountInput = { checkins: Checkin[]; sessions: Session[]; goalMin: number };

export type Discount = { percent: number; streak: number; share: number; fromCheckins: number; fromOffline: number };

export function discountFor({ checkins, sessions, goalMin }: DiscountInput, now = Date.now()): Discount {
  const streak = checkinStreak(checkins, now);
  const share = offlineShare(sessions, goalMin, OFFLINE_WINDOW_DAYS, now);
  const fromCheckins = Math.min(MAX_CHECKIN_DISCOUNT, streak);
  const fromOffline = Math.round(MAX_OFFLINE_DISCOUNT * share);
  return { percent: fromCheckins + fromOffline, streak, share, fromCheckins, fromOffline };
}

/** Preço com desconto, em moedas inteiras e nunca abaixo de 1. */
export const discountedPrice = (price: number, percent: number) => (price <= 0 ? 0 : Math.max(1, Math.round((price * (100 - percent)) / 100)));

/** Só cafeteiras ganham desconto; copos, séries especiais e pacotes de café têm sempre o preço cheio. */
export function priceOf(item: { kind: 'brewer' | 'cup' | 'beans'; price: number }, percent: number): number {
  return item.kind === 'brewer' ? discountedPrice(item.price, percent) : item.price;
}
