import React, { useEffect, useRef } from 'react';
import { BackHandler, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { FillingCup, Ring } from '@/components/BrewViz';
import { Button, Insight, Screen, Txt } from '@/components/ui';
import { Coin } from '@/art/Art';
import { itemText } from '@/data/catalog';
import { getQuotes } from '@/data/quotes';
import { useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';
import { useNow } from '@/hooks/useNow';
import { clock, minutesLabel } from '@/lib/format';
import { coinsFor, qualityOf, type Quality } from '@/lib/brew';
import { useTheme } from '@/theme/ThemeProvider';

const GRADES: Quality[] = ['ralo', 'equilibrado', 'encorpado'];

export default function Brew() {
  const router = useRouter();
  const { c, r, f } = useTheme();
  const { lang, t } = useI18n();
  const active = useApp((s) => s.active);
  const now = useNow(1000);

  // Se a tela abrir sem copo (link antigo, app reaberto), volta ao Início. Quando o copo termina com a tela aberta,
  // quem navega é o motor da extração; redirecionar aqui atropelaria a tela de resultado.
  // O botão voltar do Android não sai do copo sem querer: para parar, há o botão "Terminar agora".
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  const hadActive = useRef(!!active);
  useEffect(() => {
    if (!active && !hadActive.current) router.dismissTo('/');
  }, [active, router]);

  if (!active) return <Screen scroll={false}><View /></Screen>;

  const elapsed = Math.max(0, Math.min(now - active.startedAt, active.targetMs));
  const progress = elapsed / active.targetMs;
  const quality = qualityOf(progress);
  const quotes = getQuotes(lang);
  const quote = quotes[Math.floor(active.startedAt / 600_000) % quotes.length];

  const stop = () => {
    const id = useApp.getState().finish(Date.now());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (id) router.replace('/resultado');
    else router.dismissTo('/');
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', gap: 20, paddingTop: 12 }}>
        <Txt v="label" color="muted">
          {t('brew.extracting', { name: itemText(lang, active.brewerId).name })}
        </Txt>

        <Ring progress={progress} size={250}>
          <FillingCup progress={progress} size={150} />
        </Ring>

        <View style={{ alignItems: 'center', gap: 6 }}>
          <Txt v="numBig" accessibilityLabel={t('brew.timeA11y', { time: clock(elapsed) })}>
            {clock(elapsed)}
          </Txt>
          <Txt v="label" color="muted">
            {t('brew.ofFull', { time: minutesLabel(active.targetMs / 60_000) })}
          </Txt>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          {GRADES.map((g) => {
            const on = g === quality;
            return (
              <View key={g} style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: r.pill, backgroundColor: on ? c.accent : c.soft }}>
                <Txt v="label" style={{ color: on ? c.accentFg : c.muted, fontFamily: f.monoMedium }}>
                  {t(`quality.${g}`)}
                </Txt>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Coin size={20} />
          <Txt v="small" color="muted">
            {t('brew.ifStop', { n: coinsFor(elapsed, active.targetMs) })}
          </Txt>
        </View>

        <Txt v="body" color="muted" style={{ textAlign: 'center', maxWidth: 320 }}>
          {t('brew.hint')}
        </Txt>
      </View>

      <Insight tag={`${quote.author} · ${quote.source}`}>{quote.text}</Insight>

      <Button label={t('brew.stop')} tone="quiet" onPress={stop} />
    </Screen>
  );
}
