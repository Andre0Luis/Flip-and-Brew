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
  collection?: 'stoic' | 'mountain';
};

export const CATALOG: CatalogItem[] = [
  // Cafeteiras. Têm desconto por check-in seguido e por tempo offline (lib/pricing.ts).
  { id: 'v60', kind: 'brewer', price: 0, brewMinutes: 45 },
  { id: 'cloth', kind: 'brewer', price: 200, brewMinutes: 55 },
  { id: 'melitta', kind: 'brewer', price: 300, brewMinutes: 40 },
  { id: 'press', kind: 'brewer', price: 400, brewMinutes: 60 },
  { id: 'turkish', kind: 'brewer', price: 500, brewMinutes: 20 },
  { id: 'aeropress', kind: 'brewer', price: 600, brewMinutes: 35 },
  { id: 'moka', kind: 'brewer', price: 800, brewMinutes: 30 },
  { id: 'siphon', kind: 'brewer', price: 1500, brewMinutes: 50 },
  { id: 'chemex', kind: 'brewer', price: 0, streakUnlock: 30, brewMinutes: 75 },
  // Xícaras e canecas, sempre pelo preço cheio.
  { id: 'cup', kind: 'cup', price: 0 },
  { id: 'mug', kind: 'cup', price: 150 },
  { id: 'mugb', kind: 'cup', price: 150 },
  { id: 'tiny', kind: 'cup', price: 200 },
  { id: 'mugg', kind: 'cup', price: 200 },
  { id: 'mugr', kind: 'cup', price: 200 },
  { id: 'mugk', kind: 'cup', price: 200 },
  { id: 'glass', kind: 'cup', price: 250 },
  { id: 'cupb', kind: 'cup', price: 280 },
  { id: 'cupg', kind: 'cup', price: 280 },
  { id: 'cupo', kind: 'cup', price: 280 },
  // Séries especiais: mais caras e sem desconto.
  { id: 'stoic-ep', kind: 'cup', price: 700, collection: 'stoic' },
  { id: 'stoic-sq', kind: 'cup', price: 700, collection: 'stoic' },
  { id: 'stoic-ma', kind: 'cup', price: 700, collection: 'stoic' },
  { id: 'camp', kind: 'cup', price: 900, collection: 'mountain' },
  { id: 'peak', kind: 'cup', price: 900, collection: 'mountain' },
  { id: 'summit', kind: 'cup', price: 900, collection: 'mountain' },
];

export type LocalizedItem = CatalogItem & ItemText;

export const byId = (id: string) => CATALOG.find((i) => i.id === id);
export const brewers = () => CATALOG.filter((i) => i.kind === 'brewer');
export const cups = () => CATALOG.filter((i) => i.kind === 'cup');
export const STARTER_IDS = CATALOG.filter((i) => i.price === 0 && !i.streakUnlock).map((i) => i.id);

export const itemText = (lang: Lang, id: string): ItemText => CONTENT[lang].items[id] ?? CONTENT.pt.items[id] ?? { name: id, blurb: '' };
export const localize = (lang: Lang, item: CatalogItem): LocalizedItem => ({ ...item, ...itemText(lang, item.id) });
