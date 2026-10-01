import { Platform } from 'react-native';

// As chaves vêm de variáveis de ambiente do build (EAS secrets ou .env.local). Sem elas, as compras ficam desligadas.
const KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

export const purchasesConfigured = Platform.OS !== 'web' && !!KEY;

export type CoinPack = { id: string; coins: number; price: string; raw: unknown };

let ready = false;

function sdk() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Purchases = require('react-native-purchases').default;
  if (!ready) {
    Purchases.configure({ apiKey: KEY });
    ready = true;
  }
  return Purchases;
}

/** O produto precisa terminar em número de moedas, por exemplo "coins_500". */
const coinsOf = (productId: string) => {
  const m = productId.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
};

export async function loadCoinPacks(): Promise<CoinPack[]> {
  if (!purchasesConfigured) return [];
  try {
    const offerings = await sdk().getOfferings();
    const packages: any[] = offerings?.current?.availablePackages ?? [];
    return packages
      .map((p) => ({ id: p.identifier as string, coins: coinsOf(p.product.identifier), price: p.product.priceString as string, raw: p }))
      .filter((p) => p.coins > 0);
  } catch {
    return [];
  }
}

/** Devolve as moedas compradas ou null se foi cancelado ou falhou. */
export async function buyCoinPack(pack: CoinPack): Promise<number | null> {
  try {
    await sdk().purchasePackage(pack.raw);
    return pack.coins;
  } catch {
    return null;
  }
}
