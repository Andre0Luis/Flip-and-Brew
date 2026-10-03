import { byId } from '@/data/catalog';

/** O bônus total nunca passa de 50%: as moedas não podem ficar fáceis. */
export const MAX_EARN_BONUS = 70;
/** Combinação que combina: cada par abaixo soma mais este bônus. */
export const SYNERGY_BONUS = 5;

// Pares de cafeteira e xícara que fazem sentido juntos.
const SYNERGIES: [string, string][] = [
  ['turkish', 'mugk'],
  ['cloth', 'mugr'],
  ['siphon', 'glass'],
  ['aeropress', 'camp'],
  ['chemex', 'summit'],
  ['moka', 'tiny'],
  ['press', 'mugg'],
  ['melitta', 'cupb'],
  ['v60', 'cupo'],
  ['phin', 'americano'],
  ['capsule', 'travel'],
  ['espresso', 'gold-cup'],
  ['coldbrew', 'night-comet'],
  ['drip', 'bot-esmaltada'],
];

export type EarnBonus = { brewer: number; cup: number; pack: number; synergy: number; total: number };

/** Bônus de moedas da combinação cafeteira + xícara + pacote de café, em porcentagem. */
export function earnBonus(brewerId: string, cupId: string, packId?: string): EarnBonus {
  const brewer = byId(brewerId)?.earn ?? 0;
  const cup = byId(cupId)?.earn ?? 0;
  const pack = (packId ? byId(packId)?.earn : 0) ?? 0;
  const synergy = SYNERGIES.some(([b, c]) => b === brewerId && c === cupId) ? SYNERGY_BONUS : 0;
  return { brewer, cup, pack, synergy, total: Math.min(MAX_EARN_BONUS, brewer + cup + pack + synergy) };
}
