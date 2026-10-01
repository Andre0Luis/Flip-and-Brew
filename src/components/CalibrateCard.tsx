import React from 'react';
import { Button, Card, Txt } from './ui';
import { useApp } from '@/store/useApp';
import { useCalibrate } from '@/engine/useCalibrate';

/** Aparece no Início até o sensor ser calibrado, porque o sentido do eixo z muda de aparelho para aparelho. */
export function CalibrateCard() {
  const calibrated = useApp((s) => s.settings.faceUpSign !== 0);
  const autoStart = useApp((s) => s.settings.autoStart);
  const { run, busy, message, available } = useCalibrate();
  if (calibrated || !autoStart || !available) return null;
  return (
    <Card style={{ gap: 10 }}>
      <Txt v="title" style={{ fontSize: 15 }}>
        Calibre o sensor para virar o celular
      </Txt>
      <Txt v="small" color="muted">
        Leva cinco segundos. Até lá, o copo só termina ao encher, ao reabrir o app ou pelo botão.
      </Txt>
      {message && (
        <Txt v="small" color="accent" accessibilityLiveRegion="polite">
          {message}
        </Txt>
      )}
      <Button label={busy ? 'Calibrando…' : 'Calibrar agora'} tone="quiet" disabled={busy} onPress={run} />
    </Card>
  );
}
