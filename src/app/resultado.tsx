import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Art, Coin } from '@/art/Art';
import { Button, Card, Chip, Screen, Txt } from '@/components/ui';
import { useApp } from '@/store/useApp';
import { itemText } from '@/data/catalog';
import { useI18n } from '@/i18n';
import { streak, TRIGGERS } from '@/lib/stats';
import { minutesLabel } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [target, ms]);
  return v;
}

const MOODS = [1, 2, 3, 4, 5] as const;

export default function Resultado() {
  const router = useRouter();
  const { c, r, f } = useTheme();
  const { lang, t } = useI18n();
  const sessions = useApp((s) => s.sessions);
  const lastId = useApp((s) => s.lastResultId);
  const setResult = useApp((s) => s.setResult);
  const seenTips = useApp((s) => s.seenTips);
  const markTip = useApp((s) => s.markTip);
  const session = sessions.find((s) => s.id === lastId);
  const coins = useCountUp(session?.coins ?? 0);

  // Voltar equivale a Concluir.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.dismissTo('/');
      return true;
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!session) router.dismissTo('/');
  }, [session, router]);

  if (!session) return <Screen scroll={false}><View /></Screen>;

  const done = session.status === 'done';
  const days = streak(sessions);
  const cupName = itemText(lang, session.cupId).name;
  const tipKey = done ? 'coins' : 'early';
  const showTip = !seenTips.includes(tipKey);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', gap: 10, paddingTop: 16 }}>
        <Txt v="label" color={done ? 'good' : 'muted'}>
          {done ? t('result.done') : t('result.early')}
        </Txt>
        <Art id={session.cupId} size={170} />
        <Txt v="display" style={{ textAlign: 'center' }}>
          {done ? t('result.doneTitle') : t('result.earlyTitle')}
        </Txt>
        <Txt v="body" color="muted" style={{ textAlign: 'center' }}>
          {t('result.line', { time: minutesLabel(session.elapsedMs / 60_000), quality: t(`quality.${session.quality}`), cup: cupName })}
        </Txt>
      </View>

      {showTip && (
        <Card style={{ gap: 10, backgroundColor: c.soft }}>
          <Txt v="small">{t(done ? 'tip.coins' : 'tip.early')}</Txt>
          <Button label={t('tip.dismiss')} tone="quiet" onPress={() => markTip(tipKey)} style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16 }} />
        </Card>
      )}

      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Coin size={30} />
          <Txt v="numBig" style={{ fontSize: 32 }} accessibilityLabel={t('result.plusA11y', { n: session.coins })}>
            +{coins}
          </Txt>
        </View>
        <Txt v="small" color="muted">
          {t('result.streak', { n: days, unit: t('unit.day', { n: days }) })}
        </Txt>
      </Card>

      {!done && (
        <View style={{ gap: 10 }}>
          <Txt v="title">{t('result.whatTook')}</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TRIGGERS.map((k) => (
              <Chip key={k} label={t(`trigger.${k}`)} on={session.trigger === k} onPress={() => setResult(session.id, { trigger: k })} />
            ))}
          </View>
          <Txt v="small" color="muted">
            {t('result.earlyNote')}
          </Txt>
        </View>
      )}

      <View style={{ gap: 10 }}>
        <Txt v="title">{t('result.how')}</Txt>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {MOODS.map((n) => {
            const label = t(`mood.${n}`);
            const on = session.mood === n;
            return (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={t('mood.a11y', { label, n })}
                accessibilityState={{ selected: on }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setResult(session.id, { mood: n });
                }}
                style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: r.md, backgroundColor: on ? c.accent : c.surface, borderWidth: 1, borderColor: on ? c.accent : c.line }}
              >
                <Txt v="num" style={{ color: on ? c.accentFg : c.fg }}>
                  {n}
                </Txt>
                <Txt v="small" style={{ fontSize: 11, color: on ? c.accentFg : c.muted, fontFamily: f.bodyMedium }}>
                  {label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button label={t('result.finish')} onPress={() => router.dismissTo('/')} />
    </Screen>
  );
}
