import { Platform } from 'react-native';
import { NO_PRO, PRO_ENTITLEMENT, coinsOf, proFromCustomerInfo, type ProInfo } from './proRules';
export { PRO_ENTITLEMENT, type ProInfo };

// As chaves vêm de variáveis de ambiente do build (EAS secrets ou .env). Sem elas, as compras ficam desligadas.
const KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

/** Chaves "test_" são da Test Store e derrubam o app em build de release, então só valem em desenvolvimento. */
const keyAllowed = !!KEY && (__DEV__ || !KEY.startsWith('test_'));

export const purchasesConfigured = Platform.OS !== 'web' && keyAllowed;

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
      .filter((p) => p.coins > 0);
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
