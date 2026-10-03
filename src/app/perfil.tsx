import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/Icon';
import { Button, Screen, Txt } from '@/components/ui';
import { ProfileForm } from '@/components/ProfileForm';
import { hasProfile } from '@/lib/profile';
import { useApp } from '@/store/useApp';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

/** Perfil opcional: dados pessoais e preferências de café. Fica no aparelho; com conta, entra no backup. */
export default function Perfil() {
  const router = useRouter();
  const { c } = useTheme();
  const { t } = useI18n();
  const profile = useApp((s) => s.profile);
  const clearProfile = useApp((s) => s.clearProfile);
  return (
    <Screen>
      <View style={{ paddingTop: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="back" color={c.muted} />
          <Txt v="label" color="muted">
            {t('common.back')}
          </Txt>
        </Pressable>
      </View>
      <Txt v="display">{t('profile.title')}</Txt>
      <ProfileForm />
      <Txt v="small" color="muted">
        {t('profile.privacy')}
      </Txt>
      {hasProfile(profile) && (
        <View>
          <Button label={t('profile.clear')} tone="quiet" onPress={clearProfile} />
        </View>
      )}
    </Screen>
  );
}
