import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Art, Coin } from '@/art/Art';
import { Button, Card, Chip, Screen, Txt } from '@/components/ui';
import { useApp } from '@/store/useApp';
import { byId } from '@/data/catalog';
import { streak, TRIGGERS } from '@/lib/stats';
import { minutesLabel } from '@/lib/format';
import { QUALITY_LABEL } from '@/lib/brew';
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

const MOODS = ['Mal', 'Meh', 'Ok', 'Bem', 'Ótimo'];

export default function Resultado() {
  const router = useRouter();
  const { c, r, f } = useTheme();
  const sessions = useApp((s) => s.sessions);
  const lastId = useApp((s) => s.lastResultId);
  const setResult = useApp((s) => s.setResult);
  const session = sessions.find((s) => s.id === lastId);
  const coins = useCountUp(session?.coins ?? 0);

  useEffect(() => {
    if (!session) router.dismissTo('/');
  }, [session, router]);

  if (!session) return <Screen scroll={false}><View /></Screen>;

  const done = session.status === 'done';
  const days = streak(sessions);
  const cup = byId(session.cupId);

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ alignItems: 'center', gap: 10, paddingTop: 16 }}>
        <Txt v="label" color={done ? 'good' : 'muted'}>
          {done ? 'Copo pronto' : 'Você parou cedo'}
        </Txt>
        <Art id={session.cupId} size={170} />
        <Txt v="display" style={{ textAlign: 'center' }}>
          {done ? 'Hora de saborear.' : 'O que foi feito conta.'}
        </Txt>
        <Txt v="body" color="muted" style={{ textAlign: 'center' }}>
          {minutesLabel(session.elapsedMs / 60_000)} offline · {QUALITY_LABEL[session.quality]} · {cup?.name}
        </Txt>
      </View>

      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Coin size={30} />
          <Txt v="numBig" style={{ fontSize: 32 }} accessibilityLabel={`Mais ${session.coins} moedas`}>
            +{coins}
          </Txt>
        </View>
        <Txt v="small" color="muted">
          sequência {days} {days === 1 ? 'dia' : 'dias'}
        </Txt>
      </Card>

      {!done && (
        <View style={{ gap: 10 }}>
          <Txt v="title">O que te tirou daqui?</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TRIGGERS.map((t) => (
              <Chip key={t} label={t} on={session.trigger === t} onPress={() => setResult(session.id, { trigger: t })} />
            ))}
          </View>
          <Txt v="small" color="muted">
            Parar cedo também ensina. Anotar o motivo mostra onde reforçar.
          </Txt>
        </View>
      )}

      <View style={{ gap: 10 }}>
        <Txt v="title">Como você se sente agora?</Txt>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {MOODS.map((label, i) => {
            const on = session.mood === i + 1;
            return (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={`${label}, ${i + 1} de 5`}
                accessibilityState={{ selected: on }}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setResult(session.id, { mood: i + 1 });
                }}
                style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: r.md, backgroundColor: on ? c.accent : c.surface, borderWidth: 1, borderColor: on ? c.accent : c.line }}
              >
                <Txt v="num" style={{ color: on ? c.accentFg : c.fg }}>
                  {i + 1}
                </Txt>
                <Txt v="small" style={{ fontSize: 11, color: on ? c.accentFg : c.muted, fontFamily: f.bodyMedium }}>
                  {label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button label="Concluir" onPress={() => router.dismissTo('/')} />
    </Screen>
  );
}
