import { useMemo } from 'react';
import { useApp } from '@/store/useApp';
import { pt } from './pt';
import { en } from './en';
import { es } from './es';

export type Lang = 'pt' | 'en' | 'es';
export const LANGS: Lang[] = ['pt', 'en', 'es'];
export const DEFAULT_LANG: Lang = 'pt';

type Raw = keyof typeof pt;
/** Chave pública: as variantes .one/.many de plural contam como uma chave só. */
export type Key = Raw extends infer K ? (K extends `${infer B}.one` | `${infer B}.many` ? B : K) : never;
export type Params = Record<string, string | number>;

export const dictionaries: Record<Lang, Record<Raw, string>> = { pt, en, es };

export function translate(lang: Lang, key: Key, params?: Params): string {
  const dict = dictionaries[lang] as Record<string, string>;
  let raw: string | undefined;
  if (params && typeof params.n === 'number') {
    raw = dict[`${key}.${params.n === 1 ? 'one' : 'many'}`];
  }
  raw ??= dict[key] ?? (dictionaries[DEFAULT_LANG] as Record<string, string>)[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

export type T = (key: Key, params?: Params) => string;

export function useI18n() {
  const lang = useApp((s) => s.settings.language);
  return useMemo(() => {
    const t: T = (key, params) => translate(lang, key, params);
    return { lang, t };
  }, [lang]);
}

const list = (lang: Lang, key: Key) => translate(lang, key).split(',');

export function weekdayInitial(lang: Lang, weekday: number): string {
  return list(lang, 'date.initials')[weekday] ?? '';
}

export function formatDateLong(lang: Lang, d: Date): string {
  return translate(lang, 'date.long', {
    weekday: list(lang, 'date.weekdays')[d.getDay()],
    day: d.getDate(),
    month: list(lang, 'date.months')[d.getMonth()],
  });
}

export function formatDateShort(lang: Lang, ts: number): string {
  const d = new Date(ts);
  return translate(lang, 'date.short', { day: d.getDate(), month: list(lang, 'date.months')[d.getMonth()] });
}

export function formatNumber(lang: Lang, n: number): string {
  return n.toLocaleString(translate(lang, 'number.locale'));
}
