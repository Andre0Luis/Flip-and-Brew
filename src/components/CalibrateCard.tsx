import React from 'react';
import { Button, Card, Txt } from './ui';
import { useApp } from '@/store/useApp';
import { useCalibrate } from '@/engine/useCalibrate';
import { useI18n } from '@/i18n';

/** Aparece no Início até o sensor ser calibrado, porque o sentido do eixo z muda de aparelho para aparelho. */
export function CalibrateCard() {
  const calibrated = useApp((s) => s.settings.faceUpSign !== 0);
  const autoStart = useApp((s) => s.settings.autoStart);
  const { run, busy, message, available } = useCalibrate();
  const { t } = useI18n();
  if (calibrated || !autoStart || !available) return null;
  return (
    <Card style={{ gap: 10 }}>
      <Txt v="title" style={{ fontSize: 15 }}>
        {t('calib.title')}
      </Txt>
      <Txt v="small" color="muted">
        {t('calib.body')}
      </Txt>
      {message && (
        <Txt v="small" color="accent" accessibilityLiveRegion="polite">
          {message}
        </Txt>
      )}
      <Button label={busy ? t('calib.busy') : t('calib.cta')} tone="quiet" disabled={busy} onPress={run} />
    </Card>
  );
}
