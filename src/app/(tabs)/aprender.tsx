import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button, Card, Chip, CoinBadge, Header, Screen, Txt } from '@/components/ui';
import { ARTICLES, CATEGORIES, practiceOfDay, type Category } from '@/data/articles';
import { useApp } from '@/store/useApp';
import { dayKey } from '@/lib/stats';
import { useTheme } from '@/theme/ThemeProvider';

export default function Aprender() {
  const router = useRouter();
  const { c, r } = useTheme();
  const { coins, practiceAccepted, practicesDone, articlesRead } = useApp();
  const accept = useApp((s) => s.acceptPractice);
  const complete = useApp((s) => s.completePractice);
  const [cat, setCat] = useState<Category | 'Tudo'>('Tudo');

  const practice = practiceOfDay();
  const key = dayKey(Date.now());
  const accepted = practiceAccepted === key;
  const done = practicesDone.includes(key);
  const weekDone = practicesDone.filter((k) => Date.now() - new Date(`${k}T12:00:00`).getTime() < 7 * 86_400_000).length;
  const list = ARTICLES.filter((a) => cat === 'Tudo' || a.category === cat);

  return (
    <Screen>
      <Header title="Aprender" right={<CoinBadge coins={coins} />} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
        {(['Tudo', ...CATEGORIES] as const).map((x) => (
          <Chip key={x} label={x} on={cat === x} onPress={() => setCat(x)} />
        ))}
      </ScrollView>

      <Card inverse style={{ gap: 10 }}>
        <Txt v="label" color="bg" style={{ opacity: 0.7 }}>
          Prática de hoje · {practice.minutes} min
        </Txt>
        <Txt v="quote" color="bg" style={{ fontSize: 20, lineHeight: 27 }}>
          {practice.title}
        </Txt>
        <Txt v="small" color="bg" style={{ opacity: 0.8 }}>
          {practice.text}
        </Txt>
        {done ? (
          <Txt v="label" color="bg" style={{ opacity: 0.9 }}>
            Feito hoje · +{practice.coins} moedas
          </Txt>
        ) : accepted ? (
          <Button label="Concluí" onPress={() => { complete(practice.coins); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }} />
        ) : (
          <Button label={`Aceitar o desafio · +${practice.coins} moedas`} onPress={accept} />
        )}
      </Card>

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt v="title" style={{ fontSize: 15 }}>
            Série: 7 dias de antifragilidade
          </Txt>
          <Txt v="label" color="muted">
            {Math.min(weekDone, 7)} / 7
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < weekDone ? c.accent : c.soft }} />
          ))}
        </View>
        <Txt v="small" color="muted">
          Cada prática concluída nos últimos 7 dias conta um ponto.
        </Txt>
      </Card>

      <View style={{ gap: 10 }}>
        {list.map((a) => {
          const read = articlesRead.includes(a.id);
          return (
            <Pressable key={a.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/artigo/[id]', params: { id: a.id } })}>
              <Card style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Txt v="title" style={{ flex: 1 }}>
                    {a.title}
                  </Txt>
                  <View style={{ backgroundColor: c.soft, borderRadius: r.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
                    <Txt v="label" color="muted" style={{ fontSize: 10 }}>
                      {a.category}
                    </Txt>
                  </View>
                </View>
                <Txt v="small" color="muted">
                  {a.summary}
                </Txt>
                <Txt v="label" color={read ? 'good' : 'muted'}>
                  {a.minutes} min · {read ? 'lido' : 'não lido'}
                </Txt>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
