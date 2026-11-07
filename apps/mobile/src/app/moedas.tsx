import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, CoinBadge, Screen, Txt } from '@/components/ui';
import { CoinShop } from '@/components/CoinShop';
import { useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';

/** Abre ao tocar no contador de moedas, em qualquer tela. */
export default function Moedas() {
  const router = useRouter();
  const { t } = useI18n();
  const coins = useApp((s) => s.coins);
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
        <Txt v="display">{t('coinShop.title')}</Txt>
        <Button label={t('common.close')} tone="quiet" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <CoinBadge coins={coins} interactive={false} />
      </View>
      <CoinShop />
    </Screen>
  );
}
