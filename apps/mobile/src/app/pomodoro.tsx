import React, { useEffect, useRef } from 'react';
import { BackHandler, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ring } from '@/components/BrewViz';
import { Button, Screen, Txt } from '@/components/ui';
import { Coin } from '@/art/Art';
import { useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';
import { useNow } from '@/hooks/useNow';
import { clock } from '@/lib/format';
import { earnBonus } from '@/lib/earnings';
import { coinsFor } from '@/lib/brew';
import { breakFor, normalizePomo, pomodorosToday } from '@/lib/pomodoro';
import { useTheme } from '@/theme/ThemeProvider';

/** O foco do Pomodoro: contagem regressiva, a posição no ciclo e o que vem depois. O café tem a tela do copo (`/brew`). */
export default function Pomodoro() {
  const router = useRouter();
  const { c, r, f } = useTheme();
  const { t } = useI18n();
  const active = useApp((s) => s.active);
  const sessions = useApp((s) => s.sessions);
  const pomo = normalizePomo(useApp((s) => s.settings.pomodoro));
  const now = useNow(1000);

  // O voltar do Android não sai do foco sem querer: para parar, há o botão "Encerrar foco".
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Sem foco em andamento (link antigo, app reaberto) volta ao Início. Quando o foco termina com a tela aberta,
  // quem navega é o motor; redirecionar aqui atropelaria a tela de resultado.
  const hadActive = useRef(!!active);
  useEffect(() => {
    if (!active && !hadActive.current) router.dismissTo('/');
    else if (active && !active.pomodoro) router.replace('/brew');
  }, [active, router]);

  if (!active || !active.pomodoro) return <Screen scroll={false}><View /></Screen>;

  const elapsed = Math.max(0, Math.min(now - active.startedAt, active.targetMs));
  const left = active.targetMs - elapsed;
  const doneToday = pomodorosToday(sessions, now);
  // Este foco é o seguinte ao último fechado no ciclo (1 até `cycle`).
  const position = (doneToday % pomo.cycle) + 1;
  const next = breakFor(doneToday + 1, pomo);

  const stop = () => {
    const id = useApp.getState().finish(Date.now());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (id) router.replace('/resultado');
    else router.dismissTo('/');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', gap: 22, paddingTop: 12 }}>
        <Txt v="label" color="accent">
          {t('pomo.screenLabel', { n: position, total: pomo.cycle })}
        </Txt>

        <Ring progress={elapsed / active.targetMs} size={260} stroke={12}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Txt v="numBig" style={{ fontSize: 52 }} accessibilityLabel={t('pomo.left', { time: clock(left) })}>
              {clock(left)}
            </Txt>
            <Txt v="label" color="muted">
              {t('pomo.focusOf', { min: pomo.focusMin })}
            </Txt>
          </View>
        </Ring>

        <View style={{ flexDirection: 'row', gap: 8 }} accessibilityLabel={t('pomo.screenLabel', { n: position, total: pomo.cycle })}>
          {Array.from({ length: pomo.cycle }, (_, i) => {
            const n = i + 1;
            const finished = n < position;
            const current = n === position;
            return <View key={n} style={{ width: current ? 26 : 10, height: 10, borderRadius: r.pill, backgroundColor: finished || current ? c.accent : c.soft, opacity: current ? 1 : finished ? 0.75 : 1 }} />;
          })}
        </View>

        <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: r.pill, backgroundColor: c.soft }}>
          <Txt v="label" style={{ color: c.muted, fontFamily: f.monoMedium }}>
            {t(next.long ? 'pomo.afterLong' : 'pomo.after', { min: next.minutes })}
          </Txt>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Coin size={20} />
          <Txt v="small" color="muted">
            {t('brew.ifStop', { n: coinsFor(elapsed, active.targetMs, earnBonus(active.brewerId, active.cupId, active.packId).total) })}
          </Txt>
        </View>

        <Txt v="body" color="muted" style={{ textAlign: 'center', maxWidth: 320 }}>
          {t('pomo.hintFocus')}
        </Txt>
      </View>

      <Button label={t('pomo.stopFocus')} tone="quiet" onPress={stop} />
    </Screen>
  );
}
