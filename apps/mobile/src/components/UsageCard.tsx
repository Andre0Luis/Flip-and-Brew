import React from 'react';
import { View } from 'react-native';
import { Button, Card, Txt } from './ui';
import { WeekBars } from './Charts';
import { useI18n } from '@/i18n';
import { useSystemUsage } from '@/hooks/useSystemUsage';
import { lockedMs, screenBars, summarizeUsage } from '@/lib/usage';
import { minutesLabel } from '@/lib/format';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
      <Txt v="label" color="muted" numberOfLines={2}>
        {label}
      </Txt>
      <Txt v="num" style={{ fontSize: 20 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Txt>
    </View>
  );
}

/** Uso do sistema. No iPhone só há o tempo de tela estimado, sem desbloqueios nem bloqueios. Antes da autorização, explica e pede. */
export function UsageCard() {
  const { t } = useI18n();
  const usage = useSystemUsage(7);
  if (!usage.available) return null;

  if (!usage.permitted) {
    return (
      <Card style={{ gap: 10 }}>
        <Txt v="title">{t(usage.ios ? 'wb.usagePermTitle.ios' : 'wb.usagePermTitle')}</Txt>
        <Txt v="small" color="muted">
          {t(usage.ios ? 'wb.usagePermBody.ios' : 'wb.usagePermBody')}
        </Txt>
        <Button label={t(usage.ios ? 'wb.usagePermCta.ios' : 'wb.usagePermCta')} tone="quiet" onPress={() => void usage.request()} />
      </Card>
    );
  }

  const s = summarizeUsage(usage.days);
  return (
    <Card style={{ gap: 12 }}>
      <Txt v="label" color="muted">
        {t('wb.usageTitle')}
      </Txt>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {usage.countsUnlocks && <Stat label={t('wb.usageLocks')} value={String(s.today?.locks ?? 0)} />}
        <Stat label={t('wb.usageLocked')} value={minutesLabel(s.today ? lockedMs(s.today) / 60_000 : 0)} />
        {usage.countsUnlocks ? (
          <Stat label={t('wb.usageLocksAvg')} value={s.fullDays ? String(Math.round(s.avgLocks)) : '—'} />
        ) : (
          <Stat label={t('wb.usageScreen')} value={minutesLabel((s.today?.screenMs ?? 0) / 60_000)} />
        )}
      </View>
      <Txt v="small" color="muted">
        {t('wb.usageLockedNote')}
      </Txt>
      {usage.countsUnlocks && (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Stat label={t('wb.usageToday')} value={String(s.today?.unlocks ?? 0)} />
          <Stat label={t('wb.usageScreen')} value={minutesLabel((s.today?.screenMs ?? 0) / 60_000)} />
          <Stat label={t('wb.usageAvg')} value={s.fullDays ? String(Math.round(s.avgUnlocks)) : '—'} />
        </View>
      )}
      <Txt v="label" color="muted">
        {t('wb.usageChart')}
      </Txt>
      <WeekBars days={screenBars(usage.days)} a11y={t('wb.usageChartA11y')} />
      <Txt v="small" color="muted">
        {t(usage.ios ? 'wb.usageNote.ios' : 'wb.usageNote')}
      </Txt>
    </Card>
  );
}
