import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { FillingCup } from '@/components/BrewViz';
import { Button, Card, Chip, Screen, Txt } from '@/components/ui';
import { useCalibrate } from '@/engine/useCalibrate';
import { LANGS, dictionaries, useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';
import { useTheme } from '@/theme/ThemeProvider';

const STEPS = 3;

/**
 * Primeira abertura, em segundos e em três passos: a promessa, a ação central (aprender fazendo) e a autonomia.
 * Nenhuma tela bloqueia: dá para pular em qualquer ponto. O resto (moedas, tropeços) aparece como dica na primeira vez.
 */
export default function Intro() {
  const { c } = useTheme();
  const { t, lang } = useI18n();
  const setSettings = useApp((s) => s.setSettings);
  const setOnboarded = useApp((s) => s.setOnboarded);
  const [step, setStep] = useState(0);
  const [fill, setFill] = useState(0.15);
  const cal = useCalibrate();
  const calibrated = useApp((s) => s.settings.faceUpSign !== 0);

  // O copo enche e esvazia devagar, só para mostrar a ideia; no passo 2 ele acompanha a calibração.
  useEffect(() => {
    if (step === 2) return;
    const id = setInterval(() => setFill((f) => (f >= 0.95 ? 0.15 : f + 0.2)), 1600);
    return () => clearInterval(id);
  }, [step]);

  const finish = () => setOnboarded(true);
  const last = step === STEPS - 1;

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
        {step === 1 && <FillingCup progress={calibrated ? 1 : cal.busy ? 0.6 : fill} size={190} />}

        {step === 0 && (
          <>
            <Txt v="display" style={{ textAlign: 'center' }}>
              {t('intro.t0')}
            </Txt>
            <Txt v="body" color="muted" style={{ textAlign: 'center', maxWidth: 340 }}>
              {t('intro.b0')}
            </Txt>
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
          </>
        )}

        {step === 1 && (
          <>
            <Txt v="display" style={{ textAlign: 'center' }}>
              {t('intro.t1')}
            </Txt>
            <Txt v="body" color="muted" style={{ textAlign: 'center', maxWidth: 340 }}>
              {t('intro.b1')}
            </Txt>
            {cal.available ? (
              <View style={{ gap: 8, alignSelf: 'stretch' }}>
                <Button label={cal.busy ? t('calib.busy') : t('calib.cta')} tone="dark" disabled={cal.busy} onPress={cal.run} />
                {cal.message && (
                  <Txt v="small" color="accent" style={{ textAlign: 'center' }} accessibilityLiveRegion="polite">
                    {cal.message}
                  </Txt>
                )}
              </View>
            ) : (
              <Txt v="small" color="muted" style={{ textAlign: 'center', maxWidth: 340 }}>
                {t('intro.noSensor')}
              </Txt>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Txt v="display" style={{ textAlign: 'center' }}>
              {t('intro.t2')}
            </Txt>
            <Card style={{ gap: 10, alignSelf: 'stretch' }}>
              {(['intro.l1', 'intro.l2', 'intro.l3'] as const).map((k) => (
                <View key={k} style={{ flexDirection: 'row', gap: 10 }}>
                  <Txt v="body" color="accent">
                    •
                  </Txt>
                  <Txt v="body" style={{ flex: 1 }}>
                    {t(k)}
                  </Txt>
                </View>
              ))}
            </Card>
          </>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === step ? c.fg : c.line }} />
        ))}
      </View>

      <Button label={last ? t('intro.start') : step === 1 && !calibrated && cal.available ? t('intro.later') : t('intro.next')} onPress={last ? finish : () => setStep((s) => s + 1)} />
    </Screen>
  );
}
