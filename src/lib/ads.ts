import { Platform } from 'react-native';
import { inExpoGo } from './purchases';
import { pickBannerUnit } from './adsRules';
import { loadAdsSdk } from './adsSdk';

// Os IDs do AdMob vêm de variáveis de ambiente do build. Sem eles, o app não mostra anúncio (e continua funcionando).
const CONFIGURED = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS,
  android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
});

export const bannerUnitId = pickBannerUnit(__DEV__, CONFIGURED);

/** O SDK é nativo: não existe no Expo Go nem na web. */
export const adsSupported = Platform.OS !== 'web' && !inExpoGo;

let started: Promise<boolean> | null = null;

/** Pede o consentimento (onde a lei exige) e liga o SDK, uma vez só. Devolve se já pode pedir anúncios. */
export function startAds(): Promise<boolean> {
  if (!adsSupported) return Promise.resolve(false);
  started ??= (async () => {
    try {
      const { default: mobileAds, AdsConsent, MaxAdContentRating } = loadAdsSdk();
      const consent = await AdsConsent.gatherConsent();
      if (!consent.canRequestAds) return false;
      await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.PG });
      await mobileAds().initialize();
      return true;
    } catch {
      return false;
    }
  })();
  return started;
}

/** Há anúncio neste build (e, portanto, sentido em vender a remoção). */
export const adsEnabled = adsSupported && !!bannerUnitId;
