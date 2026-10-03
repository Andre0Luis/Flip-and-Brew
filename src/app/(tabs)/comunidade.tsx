import React from 'react';
import { View } from 'react-native';
import { Card, Header, Screen, Txt } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

/** Comunidade: ainda não existe. A tela só avisa que vem aí e diz como vai funcionar (docs/COMUNIDADE.md). */
export default function Comunidade() {
  const { c } = useTheme();
  const { t } = useI18n();
  return (
    <Screen>
      <Header title={t('community.title')} />
      <Card style={{ gap: 14, alignItems: 'center', paddingVertical: 28 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="people" size={30} color={c.accent} />
        </View>
        <Txt v="display" style={{ textAlign: 'center' }}>
          {t('community.soon')}
        </Txt>
        <Txt v="body" color="muted" style={{ textAlign: 'center', maxWidth: 340 }}>
          {t('community.body')}
        </Txt>
      </Card>
      <Card style={{ gap: 8 }}>
        {(['community.p1', 'community.p2', 'community.p3'] as const).map((k) => (
          <View key={k} style={{ flexDirection: 'row', gap: 10 }}>
            <Txt v="body" color="accent">
              •
            </Txt>
            <Txt v="small" color="muted" style={{ flex: 1 }}>
              {t(k)}
            </Txt>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
