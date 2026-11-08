import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { NO_PRO, PRO_ENTITLEMENT, REMOVE_ADS_PRODUCT, coinsOf, proFromCustomerInfo, type ProInfo } from './proRules';
export { PRO_ENTITLEMENT, type ProInfo };

// No Expo Go não existe a loja nativa e o RevenueCat recusa as chaves de loja (goog_, appl_).
// Ali só vale a chave da Test Store do RevenueCat (EXPO_PUBLIC_REVENUECAT_TEST_KEY); sem ela, as compras ficam desligadas.
export const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// As chaves vêm de variáveis de ambiente do build (EAS secrets ou .env.local). Sem elas, as compras ficam desligadas.
const KEY = inExpoGo
  ? process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY
  : Platform.select({
      ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    });

/** Chaves "test_" são da Test Store e derrubam o app em build de release, então só valem em desenvolvimento e no Expo Go. */
const keyAllowed = !!KEY && (__DEV__ || inExpoGo || !KEY.startsWith('test_'));

export const purchasesConfigured = Platform.OS !== 'web' && keyAllowed;
/** No Expo Go sem a chave de teste: as compras estão desligadas por causa do ambiente, não por falta de configuração. */
export const purchasesBlockedByExpoGo = Platform.OS !== 'web' && inExpoGo && !KEY;

export type CoinPack = { id: string; coins: number; price: string; raw: unknown };
type Sdk = typeof import('react-native-purchases').default;
let ready = false;

function sdk(): Sdk {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Purchases = require('react-native-purchases').default as Sdk;
  if (!ready) {
    if (__DEV__) Purchases.setLogLevel('DEBUG' as never);
    Purchases.configure({ apiKey: KEY as string });
    ready = true;
  }
  return Purchases;
}

export async function loadCoinPacks(): Promise<CoinPack[]> {
  if (!purchasesConfigured) return [];
  try {
    const offerings = await sdk().getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    return packages
      .map((p) => ({ id: p.identifier, coins: coinsOf(p.product.identifier), price: p.product.priceString, raw: p }))
      .filter((p) => p.coins > 0)
      .sort((x, y) => x.coins - y.coins); // a loja devolve em qualquer ordem
  } catch {
    return [];
  }
}

/** Devolve as moedas compradas ou null se foi cancelado ou falhou. */
export async function buyCoinPack(pack: CoinPack): Promise<number | null> {
  try {
    await sdk().purchasePackage(pack.raw as never);
    return pack.coins;
  } catch {
    return null; // cancelamento do usuário também cai aqui
  }
}

export type RemoveAdsOffer = { price: string; raw: unknown };

/** Preço da compra única "Remover anúncios", direto da loja (não depende do offering do painel). */
export async function loadRemoveAds(): Promise<RemoveAdsOffer | null> {
  if (!purchasesConfigured) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PRODUCT_CATEGORY } = require('react-native-purchases') as typeof import('react-native-purchases');
    const [product] = await sdk().getProducts([REMOVE_ADS_PRODUCT], PRODUCT_CATEGORY.NON_SUBSCRIPTION);
    return product ? { price: product.priceString, raw: product } : null;
  } catch {
    return null;
  }
}

/** Devolve o estado novo do cliente ou null se foi cancelado ou falhou. */
export async function buyRemoveAds(offer: RemoveAdsOffer): Promise<ProInfo | null> {
  try {
    const r = await sdk().purchaseStoreProduct(offer.raw as never);
    return proFromCustomerInfo(r.customerInfo);
  } catch {
    return null; // cancelamento do usuário também cai aqui
  }
}

export async function fetchPro(): Promise<ProInfo> {
  if (!purchasesConfigured) return NO_PRO;
  try {
    return proFromCustomerInfo(await sdk().getCustomerInfo());
  } catch {
    return NO_PRO;
  }
}

/** Escuta mudanças (compra, renovação, restauração). Devolve a função para parar de escutar. */
export function listenPro(cb: (p: ProInfo) => void): () => void {
  if (!purchasesConfigured) return () => {};
  const s = sdk();
  const fn = (info: Parameters<typeof proFromCustomerInfo>[0]) => cb(proFromCustomerInfo(info));
  s.addCustomerInfoUpdateListener(fn as never);
  return () => {
    s.removeCustomerInfoUpdateListener(fn as never);
  };
}

/** Liga o RevenueCat à conta do app, para a compra seguir o usuário entre aparelhos. */
export async function identify(uid: string | null) {
  if (!purchasesConfigured) return;
  try {
    if (uid) await sdk().logIn(uid);
    else if (!(await sdk().isAnonymous())) await sdk().logOut();
  } catch {
    /* sem rede: o RevenueCat tenta de novo na próxima abertura */
  }
}

export async function restore(): Promise<ProInfo> {
  if (!purchasesConfigured) return NO_PRO;
  try {
    return proFromCustomerInfo(await sdk().restorePurchases());
  } catch {
    return NO_PRO;
  }
}

/** Mostra o paywall configurado no painel. Devolve true se o usuário terminou com o Pro ativo. */
export async function presentPaywall(): Promise<boolean> {
  if (!purchasesConfigured) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const UI = require('react-native-purchases-ui').default;
    sdk();
    const r = await UI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: PRO_ENTITLEMENT });
    return r === 'PURCHASED' || r === 'RESTORED' || r === 'NOT_PRESENTED';
  } catch {
    return false;
  }
}

/** Central do cliente: gerenciar, cancelar e pedir reembolso. Só faz sentido para quem já tem assinatura. */
export async function presentCustomerCenter(): Promise<void> {
  if (!purchasesConfigured) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const UI = require('react-native-purchases-ui').default;
    sdk();
    await UI.presentCustomerCenter();
  } catch {
    /* o painel pode não ter a Central do cliente ativada */
  }
}
