// Regras puras do RevenueCat, sem importar o SDK, para testar em Node.

/** Entitlement que o RevenueCat libera para lifetime, yearly e monthly. */
export const PRO_ENTITLEMENT = 'flip_and_brew_pro';

/** Compra única "Remover anúncios" (não consumível). O mesmo id vale no Play Console, na App Store e no RevenueCat. */
export const REMOVE_ADS_PRODUCT = 'remove_ads';
/** Entitlement que o RevenueCat libera para a compra acima. */
export const REMOVE_ADS_ENTITLEMENT = 'remove_ads';

/** `adFree`: sem banner, seja por ter comprado a remoção ou por ter o Pro. */
export type ProInfo = { active: boolean; expiresAt: string | null; willRenew: boolean; manageUrl: string | null; adFree: boolean };
export const NO_PRO: ProInfo = { active: false, expiresAt: null, willRenew: false, manageUrl: null, adFree: false };

/** O produto de moedas precisa terminar em número, por exemplo "coins_500". */
export const coinsOf = (productId: string) => {
  const m = productId.match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
};

/** Lê o entitlement do cliente. Função pura, testável sem o SDK. */
export function proFromCustomerInfo(info: {
  entitlements: { active: Record<string, { expirationDate: string | null; willRenew: boolean } | undefined> };
  managementURL?: string | null;
  /** Aceita a compra mesmo se o produto ainda não foi ligado ao entitlement no painel. */
  allPurchasedProductIdentifiers?: string[];
}): ProInfo {
  const manageUrl = info.managementURL ?? null;
  const boughtNoAds =
    !!info.entitlements.active[REMOVE_ADS_ENTITLEMENT] || !!info.allPurchasedProductIdentifiers?.includes(REMOVE_ADS_PRODUCT);
  const e = info.entitlements.active[PRO_ENTITLEMENT];
  if (!e) return { ...NO_PRO, manageUrl, adFree: boughtNoAds };
  return { active: true, expiresAt: e.expirationDate, willRenew: e.willRenew, manageUrl, adFree: true };
}

