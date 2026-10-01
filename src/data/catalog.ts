export type ItemKind = 'brewer' | 'cup';

export type CatalogItem = {
  id: string;
  kind: ItemKind;
  name: string;
  blurb: string;
  /** moedas; 0 = já vem com o app */
  price: number;
  /** sequência (dias) necessária no lugar de moedas */
  streakUnlock?: number;
  /** só cafeteiras: minutos offline para encher o copo */
  brewMinutes?: number;
};

export const CATALOG: CatalogItem[] = [
  { id: 'v60', kind: 'brewer', name: 'Coado V60', blurb: 'Limpo e leve. Enche o copo em 45 minutos.', price: 0, brewMinutes: 45 },
  { id: 'press', kind: 'brewer', name: 'Prensa francesa', blurb: 'Corpo cheio. Pede uma hora inteira.', price: 300, brewMinutes: 60 },
  { id: 'moka', kind: 'brewer', name: 'Moka italiana', blurb: 'Forte e rápida. 30 minutos.', price: 600, brewMinutes: 30 },
  { id: 'chemex', kind: 'brewer', name: 'Chemex', blurb: 'Para quem aguenta 75 minutos.', price: 0, streakUnlock: 30, brewMinutes: 75 },
  { id: 'cup', kind: 'cup', name: 'Xícara de porcelana', blurb: 'A primeira da prateleira.', price: 0 },
  { id: 'tiny', kind: 'cup', name: 'Xícara de espresso', blurb: 'Pequena, para o café curto.', price: 200 },
  { id: 'mug', kind: 'cup', name: 'Caneca âmbar', blurb: 'Esmaltada, cor de caramelo.', price: 150 },
  { id: 'mugb', kind: 'cup', name: 'Caneca petróleo', blurb: 'Azul esverdeado, bem fria na mão.', price: 150 },
  { id: 'glass', kind: 'cup', name: 'Copo de latte', blurb: 'Vidro com camadas de leite.', price: 250 },
];

export const byId = (id: string) => CATALOG.find((i) => i.id === id);
export const brewers = () => CATALOG.filter((i) => i.kind === 'brewer');
export const cups = () => CATALOG.filter((i) => i.kind === 'cup');
export const STARTER_IDS = CATALOG.filter((i) => i.price === 0 && !i.streakUnlock).map((i) => i.id);
