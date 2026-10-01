import { CONTENT, type ArticleText, type PracticeText } from './content';
import type { Lang } from '@/i18n';

export type Category = 'antifragile' | 'stoicism' | 'digital' | 'sleep';
export const CATEGORIES: Category[] = ['antifragile', 'stoicism', 'digital', 'sleep'];

type ArticleBase = { id: string; category: Category; minutes: number; quoteId: string; related: string[] };

export const ARTICLE_BASE: ArticleBase[] = [
  { id: 'antifragil', category: 'antifragile', minutes: 3, quoteId: 'nt-vento', related: ['via-negativa', 'recaida'] },
  { id: 'controle', category: 'stoicism', minutes: 4, quoteId: 'ep-1', related: ['notificacoes', 'desconforto'] },
  { id: 'notificacoes', category: 'digital', minutes: 3, quoteId: 'ep-5', related: ['controle', 'atencao'] },
  { id: 'sono', category: 'sleep', minutes: 4, quoteId: 'sq-1', related: ['atencao', 'manha'] },
  { id: 'via-negativa', category: 'antifragile', minutes: 3, quoteId: 'ma-520', related: ['antifragil', 'atencao'] },
  { id: 'desconforto', category: 'stoicism', minutes: 4, quoteId: 'sq-13', related: ['controle', 'antifragil'] },
  { id: 'atencao', category: 'digital', minutes: 3, quoteId: 'sq-brev', related: ['notificacoes', 'via-negativa'] },
  { id: 'recaida', category: 'antifragile', minutes: 3, quoteId: 'nt-vento', related: ['antifragil', 'desconforto'] },
  { id: 'manha', category: 'digital', minutes: 3, quoteId: 'ma-847', related: ['sono', 'notificacoes'] },
];

export type Article = ArticleBase & ArticleText;

export const getArticles = (lang: Lang): Article[] => ARTICLE_BASE.map((a) => ({ ...a, ...CONTENT[lang].articles[a.id] }));
export const articleById = (lang: Lang, id: string): Article | undefined => getArticles(lang).find((a) => a.id === id);
export const ARTICLE_COUNT = ARTICLE_BASE.length;

type PracticeBase = { id: string; minutes: number; coins: number };

export const PRACTICE_BASE: PracticeBase[] = [
  { id: 'tedio', minutes: 10, coins: 5 },
  { id: 'janela', minutes: 5, coins: 5 },
  { id: 'caminhada', minutes: 15, coins: 5 },
  { id: 'carta', minutes: 5, coins: 5 },
  { id: 'refeicao', minutes: 20, coins: 5 },
  { id: 'agua', minutes: 2, coins: 5 },
  { id: 'controle', minutes: 5, coins: 5 },
  { id: 'respirar', minutes: 3, coins: 5 },
];

export type Practice = PracticeBase & PracticeText;

export function practiceOfDay(lang: Lang, date = new Date()): Practice {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86400000);
  const base = PRACTICE_BASE[day % PRACTICE_BASE.length];
  return { ...base, ...CONTENT[lang].practices[base.id] };
}
