// Regras puras dos anúncios, sem importar o SDK, para testar em Node.

/** IDs de teste do Google. Em desenvolvimento o banner usa só o de teste, para nunca contar clique nosso como real. */
export const GOOGLE_TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';

/** Bloco de anúncio a usar: o de teste em desenvolvimento, o do painel do AdMob no release, ou nenhum se não foi configurado. */
export function pickBannerUnit(dev: boolean, configured: string | undefined): string | null {
  if (dev) return GOOGLE_TEST_BANNER;
  const id = configured?.trim();
  return id ? id : null;
}

/** O banner só aparece com bloco configurado e para quem não comprou a remoção nem tem o Pro. */
export function shouldShowAds({ adFree, unitId, supported }: { adFree: boolean; unitId: string | null; supported: boolean }) {
  return supported && !adFree && !!unitId;
}
