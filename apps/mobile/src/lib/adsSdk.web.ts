import type { AdsSdk } from './adsSdk';

/** Na web não há anúncio: `adsSupported` é falso e ninguém chama isto. */
export function loadAdsSdk(): AdsSdk {
  throw new Error('Anúncios não existem na web');
}
