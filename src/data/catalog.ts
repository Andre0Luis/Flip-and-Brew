import { CONTENT, type ItemText } from './content';
import type { Lang } from '@/i18n';

export type ItemKind = 'brewer' | 'cup';

// Parte neutra do catálogo. Nome e descrição vêm de data/content/<idioma>.ts.
export type CatalogItem = {
  id: string;
  kind: ItemKind;
  /** moedas; 0 = já vem com o app */
  price: number;
  /** sequência (dias) necessária no lugar de moedas */
  streakUnlock?: number;
  /** só cafeteiras: minutos offline para encher o copo */
  brewMinutes?: number;
  /** itens de uma coleção temática, mostrados juntos no Guia */
  collection?: 'stoic';
};

export const CATALOG: CatalogItem[] = [
  { id: 'v60', kind: 'brewer', price: 0, brewMinutes: 45 },
  { id: 'press', kind: 'brewer', price: 300, brewMinutes: 60 },
  { id: 'moka', kind: 'brewer', price: 600, brewMinutes: 30 },
  { id: 'chemex', kind: 'brewer', price: 0, streakUnlock: 30, brewMinutes: 75 },
  { id: 'cloth', kind: 'brewer', price: 150, brewMinutes: 55 },
  { id: 'melitta', kind: 'brewer', price: 200, brewMinutes: 40 },
  { id: 'aeropress', kind: 'brewer', price: 250, brewMinutes: 35 },
  { id: 'turkish', kind: 'brewer', price: 350, brewMinutes: 20 },
  { id: 'siphon', kind: 'brewer', price: 700, brewMinutes: 50 },
  { id: 'cup', kind: 'cup', price: 0 },
  { id: 'tiny', kind: 'cup', price: 200 },
  { id: 'mug', kind: 'cup', price: 150 },
  { id: 'mugb', kind: 'cup', price: 150 },
  { id: 'glass', kind: 'cup', price: 250 },
  { id: 'stoic-ep', kind: 'cup', price: 350, collection: 'stoic' },
  { id: 'stoic-sq', kind: 'cup', price: 350, collection: 'stoic' },
  { id: 'stoic-ma', kind: 'cup', price: 350, collection: 'stoic' },
];

export type LocalizedItem = CatalogItem & ItemText;

export const byId = (id: string) => CATALOG.find((i) => i.id === id);
export const brewers = () => CATALOG.filter((i) => i.kind === 'brewer');
export const cups = () => CATALOG.filter((i) => i.kind === 'cup');
export const STARTER_IDS = CATALOG.filter((i) => i.price === 0 && !i.streakUnlock).map((i) => i.id);

export const itemText = (lang: Lang, id: string): ItemText => CONTENT[lang].items[id] ?? CONTENT.pt.items[id] ?? { name: id, blurb: '' };
export const localize = (lang: Lang, item: CatalogItem): LocalizedItem => ({ ...item, ...itemText(lang, item.id) });
