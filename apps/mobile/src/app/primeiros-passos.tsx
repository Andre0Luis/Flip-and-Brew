import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Screen, Txt } from '@/components/ui';
import { PassiveSettings } from '@/components/PassiveSettings';
import { useI18n } from '@/i18n';
import { useSystemUsage } from '@/hooks/useSystemUsage';
import { ensureNotificationPermission, notificationsGranted } from '@/lib/notifications';
import { useApp } from '@/store/useApp';

/** Logo depois do cadastro: ativa os lembretes (que já vêm ligados) e mostra como ligar as moedas pelo tempo bloqueado. */
export default function PrimeirosPassos() {
  const { t } = useI18n();
  const finish = useApp((s) => s.finishFirstSteps);
  const usage = useSystemUsage(1);
  const [notify, setNotify] = useState<'idle' | 'ok' | 'denied'>('idle');

  // Se as notificações já estavam permitidas (outro cadastro neste aparelho, por exemplo), não precisa pedir de novo.
  useEffect(() => {
    let live = true;
    void notificationsGranted().then((granted) => live && granted && setNotify('ok'));
    return () => {
      live = false;
    };
  }, []);

  const allow = async () => setNotify((await ensureNotificationPermission()) ? 'ok' : 'denied');

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingTop: 8, gap: 8 }}>
        <Txt v="display">{t('steps.title')}</Txt>
        <Txt v="body" color="muted">
          {t('steps.body')}
        </Txt>
      </View>

      <Card style={{ gap: 10 }}>
        <Txt v="title">{t('steps.reminders.title')}</Txt>
        <Txt v="small" color="muted">
          {t('steps.reminders.body')}
        </Txt>
        {notify === 'ok' ? (
          <Txt v="small" color="good" accessibilityLiveRegion="polite">
            {t('steps.reminders.ok')}
          </Txt>
        ) : (
          <Button label={t('steps.reminders.cta')} tone="quiet" onPress={() => void allow()} />
        )}
        {notify === 'denied' && (
          <Txt v="small" color="bad" accessibilityLiveRegion="polite">
            {t('set.notifyDenied')}
          </Txt>
        )}
      </Card>

      {usage.available && (
        <>
          {!usage.permitted && (
            <Card style={{ gap: 8 }}>
              <Txt v="title">{t('steps.coins.title')}</Txt>
              <Txt v="small" color="muted">
                {t('steps.coins.body')}
              </Txt>
              {(['steps.coins.s1', 'steps.coins.s2', 'steps.coins.s3'] as const).map((k) => (
                <Txt key={k} v="small">
                  {t(k)}
                </Txt>
              ))}
            </Card>
          )}
          <PassiveSettings />
        </>
      )}

      <Button label={t('steps.continue')} onPress={finish} />
    </Screen>
  );
}
