import { CONTENT, type ArticleText, type PracticeText } from './content';
import type { Lang } from '@/i18n';

export type Category = 'antifragile' | 'stoicism' | 'digital' | 'sleep' | 'coffee' | 'brewing' | 'taste' | 'health' | 'ritual';
export const CATEGORIES: Category[] = ['antifragile', 'stoicism', 'digital', 'sleep', 'coffee', 'brewing', 'taste', 'health', 'ritual'];

type ArticleBase = { id: string; category: Category; minutes: number; /** frase estoica opcional que abre o artigo */ quoteId?: string; related: string[] };

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
  // gen:articles:start
  { id: 'cafe-historia', category: 'coffee', minutes: 3, related: ['cafe-graos', 'cafe-regioes'] },
  { id: 'cafe-graos', category: 'coffee', minutes: 3, related: ['cafe-regioes', 'cafe-torra'] },
  { id: 'cafe-regioes', category: 'coffee', minutes: 3, related: ['cafe-graos', 'cafe-corpo'] },
  { id: 'cafe-torra', category: 'taste', minutes: 3, related: ['cafe-corpo', 'cafe-moagem'] },
  { id: 'cafe-moagem', category: 'brewing', minutes: 3, related: ['cafe-proporcao', 'cafe-metodos'] },
  { id: 'cafe-proporcao', category: 'brewing', minutes: 3, related: ['cafe-moagem', 'cafe-corpo'] },
  { id: 'cafe-corpo', category: 'taste', minutes: 4, related: ['cafe-torra', 'cafe-proporcao'] },
  { id: 'cafe-metodos', category: 'brewing', minutes: 4, related: ['cafe-moagem', 'cafe-dicas'] },
  { id: 'cafe-dicas', category: 'brewing', minutes: 3, related: ['cafe-proporcao', 'cafe-metodos'] },
  { id: 'cafe-etiopia', category: 'coffee', minutes: 3, related: ['cafe-historia', 'cafe-processos'] },
  { id: 'cafe-iemen', category: 'coffee', minutes: 3, related: ['cafe-etiopia', 'cafe-casas'] },
  { id: 'cafe-casas', category: 'coffee', minutes: 3, related: ['cafe-iemen', 'cafe-historia'] },
  { id: 'cafe-brasil-ciclo', category: 'coffee', minutes: 4, related: ['cafe-historia', 'cafe-regioes'] },
  { id: 'cafe-colombia', category: 'coffee', minutes: 3, related: ['cafe-regioes', 'cafe-centroamerica'] },
  { id: 'cafe-quenia', category: 'coffee', minutes: 3, related: ['cafe-etiopia', 'cafe-historia'] },
  { id: 'cafe-centroamerica', category: 'coffee', minutes: 3, related: ['cafe-colombia', 'cafe-processos'] },
  { id: 'cafe-vietna', category: 'coffee', minutes: 3, related: ['cafe-graos', 'cafe-indonesia'] },
  { id: 'cafe-indonesia', category: 'coffee', minutes: 3, related: ['cafe-vietna', 'cafe-processos'] },
  { id: 'cafe-processos', category: 'coffee', minutes: 4, related: ['cafe-graos', 'cafe-historia'] },
  { id: 'cafe-sustentavel', category: 'coffee', minutes: 4, related: ['cafe-selos', 'cafe-brasil-ciclo'] },
  { id: 'cafe-selos', category: 'coffee', minutes: 3, related: ['cafe-sustentavel', 'cafe-historia'] },
  // gen:articles:end
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
