import { CONTENT, type QuoteText } from './content';
import type { Lang } from '@/i18n';

export type Quote = QuoteText & { id: string };

export const QUOTE_IDS = ['sq-13', 'ma-520', 'ep-5', 'ep-1', 'sq-1', 'sq-brev', 'ma-847', 'ep-8', 'nt-vento'] as const;

export const getQuotes = (lang: Lang): Quote[] => QUOTE_IDS.map((id) => ({ id, ...CONTENT[lang].quotes[id] }));
export const quoteById = (lang: Lang, id: string): Quote | undefined => getQuotes(lang).find((q) => q.id === id);

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  return Math.floor((date.getTime() - start) / 86400000);
}

/** Frase do dia: muda a cada dia, igual para todo mundo, e é a mesma frase em todos os idiomas. */
export function quoteOfDay(lang: Lang, date = new Date()): Quote {
  const id = QUOTE_IDS[dayOfYear(date) % QUOTE_IDS.length];
  return { id, ...CONTENT[lang].quotes[id] };
}
