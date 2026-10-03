import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Button, Card, Chip, Screen, Segmented, Txt } from '@/components/ui';
import { useApp } from '@/store/useApp';
import { useCalibrate } from '@/engine/useCalibrate';
import { ensureNotificationPermission } from '@/lib/notifications';
import { cloudAvailable } from '@/lib/cloud';
import { hasProfile } from '@/lib/profile';
import { useTestTools } from '@/lib/admin';
import { useAuth } from '@/store/useAuth';
import type { Language, ThemeMode } from '@/store/types';
import { LANGS, dictionaries, useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

const GOALS = [60, 90, 120, 180, 240];

function Row({ title, hint, value, onChange }: { title: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="title" style={{ fontSize: 15 }}>
          {title}
        </Txt>
        <Txt v="small" color="muted">
          {hint}
        </Txt>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.accent, false: c.line }} thumbColor={c.surface} accessibilityLabel={title} />
    </View>
  );
}

export default function Ajustes() {
  const router = useRouter();
  const { t } = useI18n();
  const { settings } = useApp();
  const set = useApp((s) => s.setSettings);
  const addCoins = useApp((s) => s.addCoins);
  const loadDemo = useApp((s) => s.loadDemo);
  const loadTestUser = useApp((s) => s.loadTestUser);
  const resetAll = useApp((s) => s.resetAll);
  const { run: calibrate, busy: calibrating, message: cal, available } = useCalibrate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState<string | null>(null);
  const showDev = useTestTools();
  const setOnboarded = useApp((s) => s.setOnboarded);
  const profile = useApp((s) => s.profile);
  const authUser = useAuth((s) => s.user);

  const toggleNotify = async (v: boolean) => {
    setNotifyMsg(null);
    if (v && !(await ensureNotificationPermission())) {
      setNotifyMsg(t('set.notifyDenied'));
      return;
    }
    set({ notifyOnDone: v });
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
        <Txt v="display">{t('set.title')}</Txt>
        <Button label={t('common.close')} tone="quiet" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
      </View>

      <Card style={{ gap: 12 }}>
        <Txt v="title">{t('set.goal')}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {GOALS.map((g) => (
            <Chip key={g} label={`${(g / 60).toFixed(g % 60 === 0 ? 0 : 1).replace('.', t('number.locale') === 'en-US' ? '.' : ',')} h`} on={settings.goalMin === g} onPress={() => set({ goalMin: g })} />
          ))}
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <Txt v="title">{t('set.look')}</Txt>
        <Segmented<ThemeMode>
          value={settings.themeMode}
          onChange={(v) => set({ themeMode: v })}
          options={[
            { value: 'system', label: t('theme.system') },
            { value: 'light', label: t('theme.light') },
            { value: 'dark', label: t('theme.dark') },
          ]}
        />
      </Card>

      <Card style={{ gap: 12 }}>
        <Txt v="title">{t('set.language')}</Txt>
        <Segmented<Language>
          value={settings.language}
          onChange={(v) => set({ language: v })}
          options={LANGS.map((l) => ({ value: l, label: dictionaries[l]['lang.name'] }))}
        />
      </Card>

      <Card style={{ gap: 14 }}>
        <Row title={t('set.autoTitle')} hint={t('set.autoHint')} value={settings.autoStart} onChange={(v) => set({ autoStart: v })} />
        <View style={{ gap: 8 }}>
          <Txt v="small" color="muted">
            {t('set.calibrateHelp')}
          </Txt>
          <Button label={calibrating ? t('calib.busy') : t('set.calibrate')} tone="quiet" disabled={calibrating || !available} onPress={calibrate} />
          {!available && (
            <Txt v="small" color="muted">
              {t('set.noSensor')}
            </Txt>
          )}
          {cal && (
            <Txt v="small" color="accent" accessibilityLiveRegion="polite">
              {cal}
            </Txt>
          )}
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Row title={t('set.notify')} hint={t('set.notifyHint')} value={settings.notifyOnDone} onChange={toggleNotify} />
        {notifyMsg && (
          <Txt v="small" color="bad" accessibilityLiveRegion="polite">
            {notifyMsg}
          </Txt>
        )}
      </Card>

      {showDev && (
      <Card style={{ gap: 14 }}>
        <Txt v="title">{t('set.testTools')}</Txt>
        <Row title={t('set.quick')} hint={t('set.quickHint')} value={settings.quickBrew} onChange={(v) => set({ quickBrew: v })} />
        <Button label={t('set.demo')} tone="quiet" onPress={loadDemo} />
        <Button label={t('set.testUser')} tone="quiet" onPress={loadTestUser} />
        <Button label={t('set.plus500')} tone="quiet" onPress={() => addCoins(500)} />
        <Button label={t('set.plus10k')} tone="quiet" onPress={() => addCoins(10_000)} />
        {confirmReset ? (
          <View style={{ gap: 8 }}>
            <Txt v="small" color="bad">
              {t('set.resetWarn')}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label={t('set.resetDo')} tone="dark" style={{ flex: 1 }} onPress={() => { resetAll(); setConfirmReset(false); }} />
              <Button label={t('guide.cancel')} tone="quiet" style={{ flex: 1 }} onPress={() => setConfirmReset(false)} />
            </View>
          </View>
        ) : (
          <Button label={t('set.reset')} tone="quiet" onPress={() => setConfirmReset(true)} />
        )}
      </Card>
      )}

      {cloudAvailable() && (
        <Card style={{ gap: 10 }}>
          <Txt v="title">{t('account.cardTitle')}</Txt>
          <Txt v="small" color="muted">
            {authUser ? t('account.cardIn', { email: authUser.email ?? '' }) : t('account.cardOut')}
          </Txt>
          <Button label={t('account.open')} tone="quiet" onPress={() => router.push('/conta')} />
        </Card>
      )}

      <Card style={{ gap: 10 }}>
        <Txt v="title">{t('profile.title')}</Txt>
        <Txt v="small" color="muted">
          {profile.name ? t('profile.cardFilled', { name: profile.name }) : hasProfile(profile) ? t('profile.cardFilledNoName') : t('profile.cardBody')}
        </Txt>
        <Button label={t('profile.open')} tone="quiet" onPress={() => router.push('/perfil')} />
      </Card>

      <Card style={{ gap: 10 }}>
        <Button label={t('set.intro')} tone="quiet" onPress={() => setOnboarded(false)} />
        <Button label={t('set.privacy')} tone="quiet" onPress={() => router.push('/privacidade')} />
      </Card>

      <Txt v="small" color="muted">
        {t('set.footer')}
      </Txt>
      <Txt v="label" color="muted">
        {t('set.version', { v: Constants.expoConfig?.version ?? '1.0.0' })}
        {showDev ? ` · ${t('set.devOn')}` : ''}
      </Txt>
    </Screen>
  );
}
