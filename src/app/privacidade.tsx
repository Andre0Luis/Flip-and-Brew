import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { Screen, Txt } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

const SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export default function Privacidade() {
  const router = useRouter();
  const { c } = useTheme();
  const { t } = useI18n();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingTop: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="back" color={c.muted} />
          <Txt v="label" color="muted">
            {t('common.back')}
          </Txt>
        </Pressable>
      </View>
      <Txt v="display">{t('privacy.title')}</Txt>
      {SECTIONS.map((n) => (
        <View key={n} style={{ gap: 6 }}>
          <Txt v="title">{t(`privacy.h${n}` as 'privacy.h1')}</Txt>
          <Txt v="body" color="muted">
            {t(`privacy.p${n}` as 'privacy.p1')}
          </Txt>
        </View>
      ))}
    </Screen>
  );
}
