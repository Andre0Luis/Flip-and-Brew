import type { CatalogItem } from '@/data/catalog';
import { SYNERGY_BONUS, synergyPartners } from './earnings';

export type ItemBenefits = {
  /** bônus (em %) nas moedas de cada copo com o item em uso */
  earn: number;
  /** só cafeteiras: minutos para encher o copo */
  minutes: number | null;
  /** itens que combinam com este e somam `synergyBonus` */
  partners: string[];
  synergyBonus: number;
  /** nada rende moeda a mais: é só de coleção */
  collectionOnly: boolean;
};

/** O que a pessoa ganha ao comprar o item, para mostrar na confirmação da compra. */
export function itemBenefits(item: Pick<CatalogItem, 'id' | 'earn' | 'brewMinutes'>): ItemBenefits {
  const earn = item.earn ?? 0;
  const partners = synergyPartners(item.id);
  return { earn, minutes: item.brewMinutes ?? null, partners, synergyBonus: SYNERGY_BONUS, collectionOnly: earn === 0 && partners.length === 0 && item.brewMinutes == null };
}

/** Saldo depois da compra, ou quantas moedas faltam (`missing`) quando não dá. */
export function afterPurchase(coins: number, price: number): { ok: boolean; balance: number; missing: number } {
  return { ok: coins >= price, balance: Math.max(0, coins - price), missing: Math.max(0, price - coins) };
}
