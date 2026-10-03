import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { Card, Screen, Txt } from '@/components/ui';
import { CONTENT } from '@/data/content';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

/** "Por que este app existe": o texto do criador, em tela própria, aberta por Ajustes. */
export default function Criador() {
  const router = useRouter();
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const text = CONTENT[lang].creator;
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
      <Txt v="display">{text.title}</Txt>
      <Txt v="small" color="muted">
        {text.byline}
      </Txt>
      <Card inverse style={{ paddingVertical: 22 }}>
        <Txt v="quote" color="bg" style={{ textAlign: 'center' }}>
          {text.motto}
        </Txt>
      </Card>
      {text.blocks.map((b) => (
        <View key={b.heading} style={{ gap: 6 }}>
          <Txt v="label" color="accent">
            {b.heading}
          </Txt>
          <Txt v="body">{b.text}</Txt>
        </View>
      ))}
      <View style={{ gap: 2, paddingTop: 6 }}>
        <Txt v="body" color="muted">
          {text.closing}
        </Txt>
        <Txt v="title">{text.signature}</Txt>
      </View>
    </Screen>
  );
}
