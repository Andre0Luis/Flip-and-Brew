// Regras puras do RevenueCat, sem importar o SDK, para testar em Node.

/** Entitlement que o RevenueCat libera para lifetime, yearly e monthly. */
export const PRO_ENTITLEMENT = 'flip_and_brew_pro';

export type ProInfo = { active: boolean; expiresAt: string | null; willRenew: boolean; manageUrl: string | null };
export const NO_PRO: ProInfo = { active: false, expiresAt: null, willRenew: false, manageUrl: null };

/** O produto de moedas precisa terminar em número, por exemplo "coins_500". */
export const coinsOf = (productId: string) => {
  const m = productId.match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
};

/** Lê o entitlement do cliente. Função pura, testável sem o SDK. */
export function proFromCustomerInfo(info: {
  entitlements: { active: Record<string, { expirationDate: string | null; willRenew: boolean } | undefined> };
  managementURL?: string | null;
}): ProInfo {
  const e = info.entitlements.active[PRO_ENTITLEMENT];
  if (!e) return { ...NO_PRO, manageUrl: info.managementURL ?? null };
  return { active: true, expiresAt: e.expirationDate, willRenew: e.willRenew, manageUrl: info.managementURL ?? null };
}

