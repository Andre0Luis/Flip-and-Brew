import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Art, Coin } from '@/art/Art';
import { FillingCup } from '@/components/BrewViz';
import { Button, Card, Chip, Screen, Txt } from '@/components/ui';
import { useCalibrate } from '@/engine/useCalibrate';
import { LANGS, dictionaries, useI18n } from '@/i18n';
import { getQuotes } from '@/data/quotes';
import { useApp } from '@/store/useApp';
import { useTheme } from '@/theme/ThemeProvider';

const STEPS = 4;

/** Primeira abertura: a ideia do app em quatro passos curtos, com escolha de idioma e calibração opcional. */
export default function Intro() {
  const { c } = useTheme();
  const { t, lang } = useI18n();
  const setSettings = useApp((s) => s.setSettings);
  const setOnboarded = useApp((s) => s.setOnboarded);
  const [step, setStep] = useState(0);
  const [fill, setFill] = useState(0.15);
  const cal = useCalibrate();

  // O copo da primeira tela enche e esvazia devagar, só para mostrar a ideia.
  useEffect(() => {
    if (step !== 0) return;
    const id = setInterval(() => setFill((f) => (f >= 0.95 ? 0.15 : f + 0.2)), 1600);
    return () => clearInterval(id);
  }, [step]);

  const finish = () => setOnboarded(true);
  const last = step === STEPS - 1;
  const quote = getQuotes(lang).find((q) => q.id === 'nt-vento');

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
        <Txt v="label" color="muted">
          {t('intro.step', { a: step + 1, b: STEPS })}
        </Txt>
        {!last && <Button label={t('intro.skip')} tone="quiet" onPress={finish} style={{ paddingVertical: 8, paddingHorizontal: 16 }} />}
      </View>

      <View style={{ alignItems: 'center', gap: 20, paddingTop: 12 }}>
        {step === 0 && <FillingCup progress={fill} size={190} />}
        {step === 1 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Coin size={64} />
            <Art id="cup" size={130} />
            <Art id="mug" size={110} />
          </View>
        )}
        {step === 2 && quote && (
          <Card inverse style={{ gap: 10, alignSelf: 'stretch' }}>
            <Txt v="quote" color="bg">
              {quote.text}
            </Txt>
            <Txt v="label" color="bg" style={{ opacity: 0.7 }}>
              {quote.author} · {quote.source}
            </Txt>
          </Card>
        )}
        {step === 3 && <Art id="v60" size={190} />}

        <Txt v="display" style={{ textAlign: 'center' }}>
          {t(`intro.t${step}` as 'intro.t0')}
        </Txt>
        <Txt v="body" color="muted" style={{ textAlign: 'center', maxWidth: 340 }}>
          {t(`intro.b${step}` as 'intro.b0')}
        </Txt>

        {step === 0 && (
          <View style={{ gap: 8, alignItems: 'center' }}>
            <Txt v="label" color="muted">
              {t('intro.lang')}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {LANGS.map((l) => (
                <Chip key={l} label={dictionaries[l]['lang.name']} on={lang === l} onPress={() => setSettings({ language: l })} />
              ))}
            </View>
          </View>
        )}

        {step === 3 && cal.available && (
          <View style={{ gap: 8, alignSelf: 'stretch' }}>
            <Button label={cal.busy ? t('calib.busy') : t('calib.cta')} tone="quiet" disabled={cal.busy} onPress={cal.run} />
            {cal.message && (
              <Txt v="small" color="accent" style={{ textAlign: 'center' }} accessibilityLiveRegion="polite">
                {cal.message}
              </Txt>
            )}
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === step ? c.fg : c.line }} />
        ))}
      </View>

      <Button label={last ? t('intro.start') : t('intro.next')} onPress={last ? finish : () => setStep((s) => s + 1)} />
    </Screen>
  );
}
