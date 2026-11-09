import React from 'react';
import { Switch, View } from 'react-native';
import { Button, Card, Txt } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useSystemUsage } from '@/hooks/useSystemUsage';
import { minutesLabel } from '@/lib/format';
import { PASSIVE_MAX_COINS_PER_DAY, PASSIVE_MIN_PER_COIN, SLEEP_LIMITS, eligibleMin, normalizeSleep, passiveCoins } from '@/lib/passive';
import { todayStats } from '@/lib/stats';
import { summarizeUsage } from '@/lib/usage';
import { useApp } from '@/store/useApp';
import { useTheme } from '@/theme/ThemeProvider';

/** Ajustes das moedas pelo tempo bloqueado. Precisa do acesso ao uso (Android) ou do Tempo de Uso (iPhone). */
export function PassiveSettings() {
  const { t } = useI18n();
  const { c } = useTheme();
  const usage = useSystemUsage(1);
  const on = useApp((s) => s.settings.passiveCoins);
  const sleep = normalizeSleep(useApp((s) => s.settings.sleepMin));
  const set = useApp((s) => s.setSettings);
  const sessions = useApp((s) => s.sessions);
  if (!usage.available) return null;

  const today = summarizeUsage(usage.days).today;
  const estimate = today ? passiveCoins(eligibleMin(today, sleep, todayStats(sessions).minutes)) : 0;
  const { min, max, step } = SLEEP_LIMITS;
  const btn = { paddingVertical: 8, paddingHorizontal: 16, minWidth: 48 };

  return (
    <Card style={{ gap: 12 }}>
      <Txt v="title">{t('passive.title')}</Txt>
      <Txt v="small" color="muted">
        {t('passive.hint', { n: PASSIVE_MIN_PER_COIN, max: PASSIVE_MAX_COINS_PER_DAY })}
      </Txt>
      {!usage.permitted ? (
        <>
          <Txt v="small" color="muted">
            {t(usage.ios ? 'passive.need.ios' : 'passive.need')}
          </Txt>
          <Button label={t(usage.ios ? 'wb.usagePermCta.ios' : 'wb.usagePermCta')} tone="quiet" onPress={() => void usage.request()} />
        </>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Txt v="title" style={{ fontSize: 15, flex: 1 }}>
              {t('passive.toggle')}
            </Txt>
            <Switch value={on} onValueChange={(v) => set({ passiveCoins: v })} trackColor={{ true: c.accent, false: c.line }} thumbColor={c.surface} accessibilityLabel={t('passive.toggle')} />
          </View>
          {on && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Txt v="body" style={{ flex: 1 }}>
                  {t('passive.sleep')}
                </Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Button label="−" tone="quiet" disabled={sleep <= min} accessibilityLabel={t('passive.less')} onPress={() => set({ sleepMin: sleep - step })} style={btn} />
                  <Txt v="num" style={{ minWidth: 64, textAlign: 'center', fontSize: 18 }}>
                    {minutesLabel(sleep)}
                  </Txt>
                  <Button label="+" tone="quiet" disabled={sleep >= max} accessibilityLabel={t('passive.more')} onPress={() => set({ sleepMin: sleep + step })} style={btn} />
                </View>
              </View>
              <Txt v="small" color="muted">
                {t('passive.sleepHint')}
              </Txt>
              <Txt v="small" color="accent">
                {t('passive.today', { coins: estimate })}
              </Txt>
            </>
          )}
        </>
      )}
    </Card>
  );
}
