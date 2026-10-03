import { CONTENT, type ItemText } from './content';
import type { Lang } from '@/i18n';

export type ItemKind = 'brewer' | 'cup' | 'beans';

// Parte neutra do catálogo. Nome e descrição vêm de data/content/<idioma>.ts.
export type CatalogItem = {
  id: string;
  kind: ItemKind;
  /** moedas; 0 = já vem com o app */
  price: number;
  /** sequência (dias) necessária no lugar de moedas */
  streakUnlock?: number;
  /** bônus (em %) nas moedas ganhas por copo quando o item está em uso */
  earn?: number;
  /** só cafeteiras: minutos offline para encher o copo */
  brewMinutes?: number;
  /** itens de uma coleção temática, mostrados juntos no Guia */
  collection?: 'stoic' | 'mountain' | 'night' | 'botequim' | 'gold' | 'torcida' | 'universe';
};

export const CATALOG: CatalogItem[] = [
  // Cafeteiras. Têm desconto por check-in seguido e por tempo offline (lib/pricing.ts) e dão bônus de moedas (lib/earnings.ts).
  // As três primeiras à venda custam pouco, para chamar a atenção; as demais pedem constância.
  // Com 1 moeda por minuto (mais 20% no copo cheio), cada preço aqui equivale a horas de tempo offline.
  // Começa-se com a Melitta, a mais simples, o papel e o café extraforte (os três a custo zero).
  { id: 'melitta', kind: 'brewer', price: 0, brewMinutes: 40, earn: 0 },
  { id: 'cloth', kind: 'brewer', price: 300, brewMinutes: 55, earn: 5 },
  { id: 'v60', kind: 'brewer', price: 400, brewMinutes: 45, earn: 5 },
  { id: 'press', kind: 'brewer', price: 600, brewMinutes: 60, earn: 10 },
  { id: 'turkish', kind: 'brewer', price: 1800, brewMinutes: 20, earn: 10 },
  { id: 'phin', kind: 'brewer', price: 2100, brewMinutes: 50, earn: 12 },
  { id: 'aeropress', kind: 'brewer', price: 2400, brewMinutes: 35, earn: 15 },
  { id: 'drip', kind: 'brewer', price: 2700, brewMinutes: 40, earn: 8 },
  { id: 'coldbrew', kind: 'brewer', price: 3000, brewMinutes: 90, earn: 18 },
  { id: 'moka', kind: 'brewer', price: 3300, brewMinutes: 30, earn: 20 },
  { id: 'capsule', kind: 'brewer', price: 3900, brewMinutes: 15, earn: 12 },
  { id: 'siphon', kind: 'brewer', price: 6000, brewMinutes: 50, earn: 30 },
  { id: 'espresso', kind: 'brewer', price: 7500, brewMinutes: 25, earn: 32 },
  { id: 'chemex', kind: 'brewer', price: 0, streakUnlock: 30, brewMinutes: 75, earn: 25 },
  // Xícaras, canecas e copos, sempre pelo preço cheio. Também dão bônus, menor que o das cafeteiras.
  { id: 'paper', kind: 'cup', price: 0, earn: 0 },
  { id: 'cup', kind: 'cup', price: 250, earn: 0 },
  { id: 'mug', kind: 'cup', price: 250, earn: 0 },
  { id: 'mugb', kind: 'cup', price: 250, earn: 0 },
  { id: 'tiny', kind: 'cup', price: 450, earn: 2 },
  { id: 'americano', kind: 'cup', price: 600, earn: 3 },
  { id: 'mugg', kind: 'cup', price: 900, earn: 3 },
  { id: 'mugr', kind: 'cup', price: 900, earn: 3 },
  { id: 'mugk', kind: 'cup', price: 900, earn: 3 },
  { id: 'bowl', kind: 'cup', price: 900, earn: 3 },
  { id: 'glass', kind: 'cup', price: 1050, earn: 4 },
  { id: 'irish', kind: 'cup', price: 1140, earn: 4 },
  { id: 'double', kind: 'cup', price: 1200, earn: 5 },
  { id: 'cupb', kind: 'cup', price: 1260, earn: 5 },
  { id: 'cupg', kind: 'cup', price: 1260, earn: 5 },
  { id: 'cupo', kind: 'cup', price: 1260, earn: 5 },
  { id: 'travel', kind: 'cup', price: 1350, earn: 6 },
  // Séries especiais: mais caras, sem desconto e com o maior bônus.
  { id: 'stoic-ep', kind: 'cup', price: 2300, earn: 10, collection: 'stoic' },
  { id: 'stoic-sq', kind: 'cup', price: 2300, earn: 10, collection: 'stoic' },
  { id: 'stoic-ma', kind: 'cup', price: 2300, earn: 10, collection: 'stoic' },
  { id: 'bot-americano', kind: 'cup', price: 2550, earn: 10, collection: 'botequim' },
  { id: 'bot-xicara', kind: 'cup', price: 2550, earn: 10, collection: 'botequim' },
  { id: 'bot-esmaltada', kind: 'cup', price: 2550, earn: 10, collection: 'botequim' },
  { id: 'night-moon', kind: 'cup', price: 2800, earn: 12, collection: 'night' },
  { id: 'night-star', kind: 'cup', price: 2800, earn: 12, collection: 'night' },
  { id: 'night-comet', kind: 'cup', price: 2800, earn: 12, collection: 'night' },
  { id: 'camp', kind: 'cup', price: 3050, earn: 15, collection: 'mountain' },
  { id: 'peak', kind: 'cup', price: 3050, earn: 15, collection: 'mountain' },
  { id: 'summit', kind: 'cup', price: 3050, earn: 15, collection: 'mountain' },
  { id: 'gold-cup', kind: 'cup', price: 5600, earn: 25, collection: 'gold' },
  { id: 'gold-mug', kind: 'cup', price: 5600, earn: 25, collection: 'gold' },
  { id: 'gold-glass', kind: 'cup', price: 5600, earn: 25, collection: 'gold' },
  { id: 'club-cor', kind: 'cup', price: 3300, earn: 12, collection: 'torcida' },
  { id: 'club-spfc', kind: 'cup', price: 3300, earn: 12, collection: 'torcida' },
  { id: 'club-pal', kind: 'cup', price: 3300, earn: 12, collection: 'torcida' },
  { id: 'club-san', kind: 'cup', price: 3300, earn: 12, collection: 'torcida' },
  { id: 'club-fla', kind: 'cup', price: 3300, earn: 12, collection: 'torcida' },
  { id: 'club-xv', kind: 'cup', price: 3300, earn: 12, collection: 'torcida' },
  { id: 'uni-galaxy', kind: 'cup', price: 7650, earn: 30, collection: 'universe' },
  { id: 'uni-saturn', kind: 'cup', price: 7650, earn: 30, collection: 'universe' },
  { id: 'uni-eclipse', kind: 'cup', price: 7650, earn: 30, collection: 'universe' },
  { id: 'uni-nebula', kind: 'cup', price: 7650, earn: 30, collection: 'universe' },
  // Pacotes de café (categorias do mercado brasileiro): quanto melhor o café, mais moedas. Sem desconto.
  { id: 'pack-extraforte', kind: 'beans', price: 0, earn: 0 },
  { id: 'pack-tradicional', kind: 'beans', price: 450, earn: 4 },
  { id: 'pack-superior', kind: 'beans', price: 1350, earn: 10 },
  { id: 'pack-gourmet', kind: 'beans', price: 3000, earn: 20 },
  { id: 'pack-especial', kind: 'beans', price: 7500, earn: 35 },
];

export type LocalizedItem = CatalogItem & ItemText;

export const byId = (id: string) => CATALOG.find((i) => i.id === id);
export const brewers = () => CATALOG.filter((i) => i.kind === 'brewer');
export const cups = () => CATALOG.filter((i) => i.kind === 'cup');
export const packs = () => CATALOG.filter((i) => i.kind === 'beans');
export const COLLECTIONS = ['stoic', 'mountain', 'botequim', 'torcida', 'night', 'gold', 'universe'] as const;
export const STARTER_IDS = CATALOG.filter((i) => i.price === 0 && !i.streakUnlock).map((i) => i.id);

export const itemText = (lang: Lang, id: string): ItemText => CONTENT[lang].items[id] ?? CONTENT.pt.items[id] ?? { name: id, blurb: '' };
export const localize = (lang: Lang, item: CatalogItem): LocalizedItem => ({ ...item, ...itemText(lang, item.id) });
