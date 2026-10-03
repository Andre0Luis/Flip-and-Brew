import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/Icon';
import { Button, Card, Chip, Field, Screen, Segmented, Txt } from '@/components/ui';
import { ProfileForm } from '@/components/ProfileForm';
import { formatDateShort, useI18n, type Key } from '@/i18n';
import { AuthError, getBackend, isValidEmail, MIN_PASSWORD, toAuthError } from '@/lib/cloud';
import { backupNow, localData, resolveChoice, restoreNow } from '@/lib/cloud/sync';
import { useAuth } from '@/store/useAuth';
import { useNow } from '@/hooks/useNow';
import { TEST_EMAIL, TEST_PASSWORD } from '@/lib/testUser';
import { useTheme } from '@/theme/ThemeProvider';

type Mode = 'in' | 'up';

function when(lang: 'pt' | 'en' | 'es', ts: number) {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${formatDateShort(lang, ts)}, ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Conta() {
  const router = useRouter();
  const { c } = useTheme();
  const { t } = useI18n();
  const status = useAuth((s) => s.status);
  const [notice, setNotice] = useState<string | null>(null);

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
      <Txt v="display">{t('account.title')}</Txt>
      {notice && (
        <Card style={{ backgroundColor: c.soft }}>
          <Txt v="small" accessibilityLiveRegion="polite">
            {notice}
          </Txt>
        </Card>
      )}
      {status === 'loading' ? <Txt v="body" color="muted">{t('account.loading')}</Txt> : status === 'signedIn' ? <SignedIn onNotice={setNotice} /> : <SignedOut />}
    </Screen>
  );
}

function ErrorLine({ error }: { error: AuthError | string | null }) {
  const { t } = useI18n();
  if (!error) return null;
  if (error instanceof AuthError && error.code === 'cancelled') return null; // fechar o seletor do Google não é erro
  const text = typeof error === 'string' ? error : t(`auth.err.${error.code}` as Key);
  return (
    <Txt v="small" color="bad" accessibilityLiveRegion="polite">
      {text}
    </Txt>
  );
}

function SignedOut() {
  const router = useRouter();
  const { c } = useTheme();
  const { t } = useI18n();
  const backend = getBackend();
  const [mode, setMode] = useState<Mode>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthError | string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await fn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      setError(toAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!backend) return setError(new AuthError('not-configured'));
    if (!email.trim() || !password) return setError(t('auth.fillAll'));
    if (!isValidEmail(email)) return setError(new AuthError('invalid-email'));
    if (mode === 'up') {
      if (password.length < MIN_PASSWORD) return setError(new AuthError('weak-password'));
      if (password !== confirm) return setError(t('auth.mismatch'));
    }
    void run(() => (mode === 'up' ? backend.signUp(email, password) : backend.signIn(email, password)));
  };

  const forgot = () => {
    if (!backend) return;
    if (!isValidEmail(email)) return setError(t('auth.fillEmail'));
    void run(async () => {
      await backend.sendPasswordReset(email);
      setInfo(t('auth.resetSent'));
    });
  };

  return (
    <View style={{ gap: 16 }}>
      <Txt v="body" color="muted">
        {t('account.optional')}
      </Txt>
      {backend?.kind === 'mock' && (
        <Card style={{ gap: 8, backgroundColor: c.soft }}>
          <Txt v="small">{t('auth.testHint', { email: TEST_EMAIL, password: TEST_PASSWORD })}</Txt>
          <Button
            label={t('auth.testFill')}
            tone="quiet"
            onPress={() => {
              setMode('in');
              setEmail(TEST_EMAIL);
              setPassword(TEST_PASSWORD);
            }}
          />
        </Card>
      )}
      <Segmented<Mode>
        value={mode}
        onChange={(m) => {
          setMode(m);
          setError(null);
          setInfo(null);
        }}
        options={[
          { value: 'in', label: t('auth.modeIn') },
          { value: 'up', label: t('auth.modeUp') },
        ]}
      />

      <View style={{ gap: 12 }}>
        <Field label={t('auth.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" returnKeyType="next" />
        <Field label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === 'up' ? 'new-password' : 'current-password'} textContentType={mode === 'up' ? 'newPassword' : 'password'} returnKeyType={mode === 'up' ? 'next' : 'done'} onSubmitEditing={mode === 'in' ? submit : undefined} />
        {mode === 'up' && <Field label={t('auth.confirm')} value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" textContentType="newPassword" returnKeyType="done" onSubmitEditing={submit} />}
      </View>

      {mode === 'up' && (
        <View style={{ gap: 12 }}>
          <Chip label={t('profile.signupToggle')} on={showProfile} onPress={() => setShowProfile((v) => !v)} />
          {showProfile && (
            <>
              <ProfileForm />
              <Txt v="small" color="muted">
                {t('profile.privacy')}
              </Txt>
            </>
          )}
        </View>
      )}

      <ErrorLine error={error} />
      {info && (
        <Txt v="small" color="good" accessibilityLiveRegion="polite">
          {info}
        </Txt>
      )}

      <Button label={mode === 'up' ? t('auth.submitUp') : t('auth.submitIn')} onPress={submit} disabled={busy} />
      {mode === 'in' && (
        <Pressable accessibilityRole="button" onPress={forgot} hitSlop={8} style={{ alignSelf: 'center' }}>
          <Txt v="small" color="accent" style={{ textDecorationLine: 'underline' }}>
            {t('auth.forgot')}
          </Txt>
        </Pressable>
      )}

      {backend?.googleAvailable() && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#8884' }} />
            <Txt v="label" color="muted">
              {t('auth.or')}
            </Txt>
            <View style={{ flex: 1, height: 1, backgroundColor: '#8884' }} />
          </View>
          <Button label={t('auth.google')} tone="quiet" onPress={() => run(() => backend.signInGoogle())} disabled={busy} />
        </>
      )}

      {mode === 'up' && (
        <View style={{ gap: 4 }}>
          <Txt v="small" color="muted">
            {t('auth.consent')}
          </Txt>
          <Pressable accessibilityRole="link" onPress={() => router.push('/privacidade')} hitSlop={8}>
            <Txt v="small" color="accent" style={{ textDecorationLine: 'underline' }}>
              {t('auth.privacyLink')}
            </Txt>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function SignedIn({ onNotice }: { onNotice: (s: string | null) => void }) {
  const { t, lang } = useI18n();
  const { c, r } = useTheme();
  const backend = getBackend();
  const { user, sync, lastBackupAt, choice } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthError | string | null>(null);
  const now = useNow(60_000);
  if (!user || !backend) return null;

  const doBackup = async () => {
    setMessage(null);
    setMessage((await backupNow()) ? t('backup.ok') : t('backup.fail'));
  };
  const doRestore = async () => {
    setConfirmRestore(false);
    setMessage(null);
    const ok = await restoreNow();
    setMessage(ok ? t('backup.restored') : useAuth.getState().sync === 'error' ? t('backup.fail') : t('backup.none'));
  };

  const doDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      if (user.provider === 'password' && !password) throw new AuthError('wrong-credentials');
      await backend.reauthenticate(user.provider === 'password' ? password : undefined);
      await backend.deleteAccount();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onNotice(t('delete.done'));
    } catch (e) {
      setError(toAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const local = localData();
  const syncing = sync === 'syncing';

  return (
    <View style={{ gap: 16 }}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Txt v="title" color="accentFg">
            {(user.email ?? '?').charAt(0).toUpperCase()}
          </Txt>
        </View>
        <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
          <Txt v="small" color="muted">
            {t('account.signedAs')}
          </Txt>
          <Txt v="title" numberOfLines={1}>
            {user.email}
          </Txt>
          <Txt v="small" color="muted">
            {user.provider === 'google' ? t('account.providerGoogle') : t('account.providerPassword')}
          </Txt>
        </View>
      </Card>
      {user.provider === 'password' && !user.emailVerified && (
        <Txt v="small" color="muted">
          {t('account.verifyNote')}
        </Txt>
      )}

      {choice && (
        <Card inverse style={{ gap: 12 }}>
          <Txt v="title" color="bg">
            {t('choice.title')}
          </Txt>
          <Txt v="small" color="bg" style={{ opacity: 0.85 }}>
            {t('choice.body')}
          </Txt>
          {([
            ['choice.localLabel', local.sessions.filter((s) => s.status === 'done').length, local.coins, now],
            ['choice.cloudLabel', choice.data.sessions.filter((s) => s.status === 'done').length, choice.data.coins, choice.updatedAt],
          ] as const).map(([label, cups, coins, ts]) => (
            <View key={label} style={{ gap: 2 }}>
              <Txt v="label" color="bg" style={{ opacity: 0.7 }}>
                {t(label)}
              </Txt>
              <Txt v="small" color="bg">
                {t('choice.summary', { cups, coins, date: when(lang, ts) })}
              </Txt>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label={t('choice.local')} style={{ flex: 1, paddingHorizontal: 12 }} onPress={() => void resolveChoice('local')} />
            <Button label={t('choice.cloud')} tone="quietOnDark" style={{ flex: 1, paddingHorizontal: 12 }} onPress={() => void resolveChoice('cloud')} />
          </View>
        </Card>
      )}

      <Card style={{ gap: 12 }}>
        <Txt v="title">{t('backup.title')}</Txt>
        <Txt v="small" color="muted">
          {syncing ? t('backup.syncing') : lastBackupAt ? t('backup.last', { when: when(lang, lastBackupAt) }) : t('backup.never')}
        </Txt>
        <Txt v="small" color="muted">
          {t('backup.auto')}
        </Txt>
        {message && (
          <Txt v="small" color={message === t('backup.fail') ? 'bad' : 'good'} accessibilityLiveRegion="polite">
            {message}
          </Txt>
        )}
        <Button label={t('backup.now')} tone="quiet" disabled={syncing || !!choice} onPress={doBackup} />
        {confirmRestore ? (
          <View style={{ gap: 8 }}>
            <Txt v="small" color="bad">
              {t('backup.restoreWarn')}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label={t('backup.restoreDo')} tone="dark" style={{ flex: 1 }} onPress={doRestore} />
              <Button label={t('delete.cancel')} tone="quiet" style={{ flex: 1 }} onPress={() => setConfirmRestore(false)} />
            </View>
          </View>
        ) : (
          <Button label={t('backup.restore')} tone="quiet" disabled={syncing || !!choice} onPress={() => setConfirmRestore(true)} />
        )}
      </Card>

      <Button label={t('account.signOut')} tone="quiet" onPress={() => void backend.signOut()} />

      <Card style={{ gap: 12, borderColor: c.bad, borderRadius: r.lg }}>
        <Txt v="title" color="bad">
          {t('delete.title')}
        </Txt>
        <Txt v="small" color="muted">
          {t('delete.body')}
        </Txt>
        {deleting ? (
          <View style={{ gap: 10 }}>
            {user.provider === 'password' ? (
              <>
                <Txt v="small">{t('delete.confirmPassword')}</Txt>
                <Field label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" error={!!error} />
              </>
            ) : (
              <Txt v="small">{t('delete.confirmGoogle')}</Txt>
            )}
            <ErrorLine error={error} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label={t('delete.do')} tone="dark" disabled={busy} style={{ flex: 1, paddingHorizontal: 12 }} onPress={doDelete} />
              <Button
                label={t('delete.cancel')}
                tone="quiet"
                style={{ flex: 1 }}
                onPress={() => {
                  setDeleting(false);
                  setPassword('');
                  setError(null);
                }}
              />
            </View>
          </View>
        ) : (
          <Button label={t('delete.start')} tone="quiet" onPress={() => setDeleting(true)} />
        )}
      </Card>
    </View>
  );
}
