import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { adsSupported, bannerUnitId, startAds } from '@/lib/ads';
import { shouldShowAds } from '@/lib/adsRules';
import { loadAdsSdk } from '@/lib/adsSdk';
import { useI18n } from '@/i18n';
import { usePro } from '@/store/usePro';
import { useTheme } from '@/theme/ThemeProvider';

/** Banner no fim das telas, dentro da rolagem. Só aparece depois de carregar e some de vez para quem removeu os anúncios. */
export function AdBanner() {
  const adFree = usePro((s) => s.adFree);
  const show = shouldShowAds({ adFree, unitId: bannerUnitId, supported: adsSupported });
  return show ? <Banner unitId={bannerUnitId as string} /> : null;
}

function Banner({ unitId }: { unitId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const { c, f } = useTheme();
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    void startAds().then((ok) => live && (ok ? setReady(true) : setFailed(true)));
    return () => {
      live = false;
    };
  }, []);

  if (failed || !ready) return null;
  const { BannerAd, BannerAdSize } = loadAdsSdk();

  return (
    <View style={loaded ? { gap: 6, alignItems: 'center', marginTop: 8 } : { height: 0, overflow: 'hidden' }}>
      {loaded && (
        <Text style={{ fontFamily: f.monoMedium, fontSize: 10, letterSpacing: 1.3, textTransform: 'uppercase', color: c.muted }}>{t('ads.label')}</Text>
      )}
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setFailed(true)}
      />
      {loaded && (
        <Pressable accessibilityRole="button" onPress={() => router.push('/ajustes')} hitSlop={10}>
          <Text style={{ fontFamily: f.body, fontSize: 13, color: c.muted, textDecorationLine: 'underline' }}>{t('ads.removeLink')}</Text>
        </Pressable>
      )}
    </View>
  );
}
