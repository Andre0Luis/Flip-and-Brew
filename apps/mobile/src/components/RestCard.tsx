import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button, Card, Txt } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useNow } from '@/hooks/useNow';
import { clock } from '@/lib/format';
import { restLeftMs } from '@/lib/pomodoro';
import { useApp } from '@/store/useApp';

/** Pausa do Pomodoro na tela Início: conta o que falta e, ao acabar, convida para o próximo foco. */
export function RestCard() {
  const router = useRouter();
  const { t } = useI18n();
  const rest = useApp((s) => s.rest);
  const start = useApp((s) => s.start);
  const endRest = useApp((s) => s.endRest);
  const now = useNow(1000);

  const left = rest ? restLeftMs(rest, now) : 0;
  const over = !!rest && left === 0;
  // Vibra uma vez, só se a pausa acabou agora; abrir o app muito depois não vibra.
  const justOver = !!rest && over && now - (rest.startedAt + rest.targetMs) < 5000;
  useEffect(() => {
    if (justOver) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [justOver]);

  if (!rest) return null;

  const next = () => {
    if (start()) router.push('/brew');
  };

  return (
    <Card style={{ gap: 10 }}>
      <Txt v="label" color="accent">
        {t(rest.long ? 'pomo.longBreak' : 'pomo.break')}
      </Txt>
      {over ? (
        <Txt v="body">{t('pomo.over')}</Txt>
      ) : (
        <View style={{ gap: 2 }}>
          <Txt v="numBig" accessibilityLabel={t('pomo.left', { time: clock(left) })}>
            {clock(left)}
          </Txt>
          <Txt v="small" color="muted">
            {t('pomo.left', { time: clock(left) })}
          </Txt>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label={t('pomo.next')} onPress={next} style={{ flex: 1 }} tone={over ? undefined : 'quiet'} />
        <Button label={t('pomo.skip')} tone="quiet" onPress={endRest} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}
