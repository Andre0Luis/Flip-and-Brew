import React from 'react';
import { View } from 'react-native';
import { Screen, Txt } from '@/components/ui';
import { useI18n } from '@/i18n';
import { SignedOut } from './conta';

/** Portão de login: com o backend próprio ligado, o app só abre depois de entrar. */
export default function Entrar() {
  const { t } = useI18n();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingTop: 8 }}>
        <Txt v="display">{t('gate.title')}</Txt>
      </View>
      <SignedOut required />
    </Screen>
  );
}
