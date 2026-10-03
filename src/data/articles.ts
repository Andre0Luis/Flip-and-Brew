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
  { id: 'cafe-casas', category: 'coffee', minutes: 3, related: ['cafe-iemen', 'ritual-conversa'] },
  { id: 'cafe-brasil-ciclo', category: 'coffee', minutes: 4, related: ['cafe-historia', 'cafe-regioes'] },
  { id: 'cafe-colombia', category: 'coffee', minutes: 3, related: ['cafe-regioes', 'cafe-centroamerica'] },
  { id: 'cafe-quenia', category: 'coffee', minutes: 3, related: ['cafe-etiopia', 'taste-acidez'] },
  { id: 'cafe-centroamerica', category: 'coffee', minutes: 3, related: ['cafe-colombia', 'cafe-processos'] },
  { id: 'cafe-vietna', category: 'coffee', minutes: 3, related: ['cafe-graos', 'cafe-indonesia'] },
  { id: 'cafe-indonesia', category: 'coffee', minutes: 3, related: ['cafe-vietna', 'cafe-processos'] },
  { id: 'cafe-processos', category: 'coffee', minutes: 4, related: ['cafe-graos', 'taste-docura'] },
  { id: 'cafe-sustentavel', category: 'coffee', minutes: 4, related: ['cafe-selos', 'cafe-brasil-ciclo'] },
  { id: 'cafe-selos', category: 'coffee', minutes: 3, related: ['cafe-sustentavel', 'taste-fresco'] },
  { id: 'cafe-tipos', category: 'coffee', minutes: 4, related: ['cafe-graos', 'cafe-selos'] },
  { id: 'brew-espresso', category: 'brewing', minutes: 4, related: ['brew-moka', 'cafe-moagem'] },
  { id: 'brew-moka', category: 'brewing', minutes: 3, related: ['brew-espresso', 'cafe-moagem'] },
  { id: 'brew-v60', category: 'brewing', minutes: 4, related: ['brew-bloom', 'brew-chemex'] },
  { id: 'brew-chemex', category: 'brewing', minutes: 3, related: ['brew-v60', 'taste-docura'] },
  { id: 'brew-prensa', category: 'brewing', minutes: 3, related: ['brew-aeropress', 'cafe-corpo'] },
  { id: 'brew-aeropress', category: 'brewing', minutes: 3, related: ['brew-prensa', 'brew-espresso'] },
  { id: 'brew-turca', category: 'brewing', minutes: 3, related: ['cafe-moagem', 'cafe-iemen'] },
  { id: 'brew-sifao', category: 'brewing', minutes: 4, related: ['brew-chemex', 'brew-v60'] },
  { id: 'brew-pano', category: 'brewing', minutes: 3, related: ['cafe-corpo', 'cafe-moagem'] },
  { id: 'brew-phin', category: 'brewing', minutes: 3, related: ['cafe-vietna', 'brew-pano'] },
  { id: 'brew-capsula', category: 'brewing', minutes: 3, related: ['brew-espresso', 'ritual-pausa'] },
  { id: 'brew-coldbrew', category: 'brewing', minutes: 4, related: ['brew-prensa', 'taste-docura'] },
  { id: 'brew-agua', category: 'brewing', minutes: 3, related: ['cafe-proporcao', 'brew-extracao'] },
  { id: 'brew-bloom', category: 'brewing', minutes: 3, related: ['brew-v60', 'brew-chemex'] },
  { id: 'brew-extracao', category: 'brewing', minutes: 4, related: ['cafe-corpo', 'brew-agua'] },
  { id: 'brew-moedor', category: 'brewing', minutes: 3, related: ['cafe-moagem', 'brew-extracao'] },
  { id: 'brew-leite', category: 'brewing', minutes: 3, related: ['brew-espresso', 'brew-moka'] },
  { id: 'taste-roda', category: 'taste', minutes: 3, related: ['taste-descritores', 'taste-aroma'] },
  { id: 'taste-acidez', category: 'taste', minutes: 3, related: ['taste-amargor', 'cafe-corpo'] },
  { id: 'taste-amargor', category: 'taste', minutes: 3, related: ['taste-acidez', 'taste-docura'] },
  { id: 'taste-docura', category: 'taste', minutes: 3, related: ['taste-amargor', 'brew-chemex'] },
  { id: 'taste-aroma', category: 'taste', minutes: 3, related: ['taste-roda', 'brew-bloom'] },
  { id: 'taste-cupping', category: 'taste', minutes: 4, related: ['taste-roda', 'taste-descritores'] },
  { id: 'taste-defeitos', category: 'taste', minutes: 3, related: ['cafe-selos', 'taste-fresco'] },
  { id: 'taste-harmoniza', category: 'taste', minutes: 3, related: ['taste-docura', 'taste-acidez'] },
  { id: 'taste-fresco', category: 'taste', minutes: 3, related: ['brew-bloom', 'taste-defeitos'] },
  { id: 'taste-descritores', category: 'taste', minutes: 3, related: ['taste-roda', 'taste-cupping'] },
  { id: 'health-cafeina', category: 'health', minutes: 4, related: ['health-meia-vida', 'health-tolerancia'] },
  { id: 'health-meia-vida', category: 'health', minutes: 3, related: ['health-cafeina', 'health-quando'] },
  { id: 'health-ansiedade', category: 'health', minutes: 3, related: ['health-cafeina', 'ritual-atencao'] },
  { id: 'health-gestacao', category: 'health', minutes: 3, related: ['health-cafeina', 'health-descafeinado'] },
  { id: 'health-hidratacao', category: 'health', minutes: 3, related: ['health-cafeina', 'health-quando'] },
  { id: 'health-descafeinado', category: 'health', minutes: 3, related: ['health-meia-vida', 'health-gestacao'] },
  { id: 'health-treino', category: 'health', minutes: 3, related: ['health-cafeina', 'health-quando'] },
  { id: 'health-estomago', category: 'health', minutes: 3, related: ['taste-acidez', 'brew-coldbrew'] },
  { id: 'health-tolerancia', category: 'health', minutes: 3, related: ['health-cafeina', 'health-descafeinado'] },
  { id: 'health-quando', category: 'health', minutes: 3, related: ['health-meia-vida', 'ritual-manha'] },
  { id: 'ritual-sem-celular', category: 'ritual', minutes: 3, related: ['ritual-pausa', 'ritual-conversa'] },
  { id: 'ritual-pausa', category: 'ritual', minutes: 3, related: ['ritual-sem-celular', 'ritual-manha'] },
  { id: 'ritual-conversa', category: 'ritual', minutes: 3, related: ['cafe-casas', 'ritual-sem-celular'] },
  { id: 'ritual-manha', category: 'ritual', minutes: 3, related: ['health-quando', 'ritual-sem-celular'] },
  { id: 'ritual-trabalho', category: 'ritual', minutes: 3, related: ['ritual-pausa', 'ritual-sem-celular'] },
  { id: 'ritual-atencao', category: 'ritual', minutes: 3, related: ['ritual-presente', 'health-ansiedade'] },
  { id: 'ritual-solitude', category: 'ritual', minutes: 3, related: ['ritual-atencao', 'ritual-conversa'] },
  { id: 'ritual-presente', category: 'ritual', minutes: 3, quoteId: 'sq-1', related: ['ritual-atencao', 'est-memento'] },
  { id: 'ritual-lento', category: 'ritual', minutes: 3, related: ['ritual-presente', 'brew-phin'] },
  { id: 'est-amor-fati', category: 'stoicism', minutes: 3, quoteId: 'ep-8', related: ['est-premeditatio', 'est-memento'] },
  { id: 'est-memento', category: 'stoicism', minutes: 3, quoteId: 'sq-brev', related: ['ritual-presente', 'est-amor-fati'] },
  { id: 'est-premeditatio', category: 'stoicism', minutes: 3, quoteId: 'sq-13', related: ['est-amor-fati', 'est-memento'] },
  { id: 'est-visao-alto', category: 'stoicism', minutes: 3, quoteId: 'ep-1', related: ['est-memento', 'est-amor-fati'] },
  { id: 'est-diario', category: 'stoicism', minutes: 3, quoteId: 'sq-1', related: ['ritual-manha', 'est-amor-fati'] },
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
