import React, { useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Button, Field, Screen, Txt } from '@/components/ui';
import { useI18n, type Key } from '@/i18n';
import { AuthError, getBackend, MIN_PASSWORD, toAuthError } from '@/lib/cloud';
import { parseRecoveryUrl } from '@/lib/cloud/recoveryLink';

/** Abre pelo link do e-mail de recuperação de senha (`flipandbrew://nova-senha#access_token=...`). */
export default function NovaSenha() {
  const router = useRouter();
  const { t } = useI18n();
  const url = Linking.useLinkingURL();
  const link = parseRecoveryUrl(url);
  const backend = getBackend();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthError | string | null>(null);
  const [done, setDone] = useState(false);

  const leave = () => router.dismissTo('/');

  const save = async () => {
    if (!backend?.resetPasswordWithLink || !url) return;
    if (password.length < MIN_PASSWORD) return setError(new AuthError('weak-password'));
    if (password !== confirm) return setError(t('auth.mismatch'));
    setBusy(true);
    setError(null);
    try {
      await backend.resetPasswordWithLink(url, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setDone(true);
    } catch (e) {
      setError(toAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const usable = link?.kind === 'tokens' && !!backend?.resetPasswordWithLink;
  const errorText = error ? (typeof error === 'string' ? error : t(`auth.err.${error.code}` as Key)) : null;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingTop: 8 }}>
        <Txt v="display">{t('newPass.title')}</Txt>
      </View>
      {done ? (
        <View style={{ gap: 16 }}>
          <Txt v="body" color="good" accessibilityLiveRegion="polite">
            {t('newPass.done')}
          </Txt>
          <Button label={t('newPass.continue')} onPress={leave} />
        </View>
      ) : usable ? (
        <View style={{ gap: 16 }}>
          <Txt v="body" color="muted">
            {t('newPass.body')}
          </Txt>
          <Field label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
          <Field label={t('auth.confirm')} value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" textContentType="newPassword" returnKeyType="done" onSubmitEditing={save} />
          {errorText && (
            <Txt v="small" color="bad" accessibilityLiveRegion="polite">
              {errorText}
            </Txt>
          )}
          <Button label={t('newPass.save')} onPress={save} disabled={busy} />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          <Txt v="body" color="muted">
            {t(link?.kind === 'error' ? 'auth.err.link-expired' : 'newPass.noLink')}
          </Txt>
          <Button label={t('newPass.continue')} tone="quiet" onPress={leave} />
        </View>
      )}
    </Screen>
  );
}
