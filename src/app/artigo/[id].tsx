import React from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Block, Bullets, Callout, QuoteBlock, Reading } from '@/components/Reading';
import { Button, Card, Txt } from '@/components/ui';
import { articleById } from '@/data/articles';
import { quoteById } from '@/data/quotes';
import { useApp } from '@/store/useApp';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/theme/ThemeProvider';

export default function Artigo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { c } = useTheme();
  const read = useApp((s) => s.articlesRead.includes(String(id)));
  const markRead = useApp((s) => s.markRead);
  const a = articleById(String(id));

  if (!a) {
    return (
      <Reading eyebrow="Aprender">
        <Txt v="body">Não encontramos este artigo.</Txt>
        <Button label="Voltar" onPress={() => router.replace('/aprender')} />
      </Reading>
    );
  }
  const q = quoteById(a.quoteId);

  return (
    <Reading eyebrow={`${a.category} · ${a.minutes} min`}>
      <Txt v="display">{a.title}</Txt>
      {q && <QuoteBlock text={q.text} by={`${q.author} · ${q.source}`} />}
      <Block label="Em uma frase">
        <Txt v="body">{a.oneLine}</Txt>
      </Block>
      {a.body.map((p, i) => (
        <Txt key={i} v="body">
          {p}
        </Txt>
      ))}
      <Callout label="No Flip & Brew">{a.inApp}</Callout>
      <Block label="Tente hoje">
        <Bullets items={a.tryToday} />
      </Block>
      <Block label="Continue com">
        <View style={{ gap: 8 }}>
          {a.related.map((rid) => {
            const r = articleById(rid);
            if (!r) return null;
            return (
              <Pressable key={rid} accessibilityRole="button" onPress={() => router.replace({ pathname: '/artigo/[id]', params: { id: rid } })}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Txt v="title" style={{ fontSize: 15 }}>
                      {r.title}
                    </Txt>
                    <Txt v="small" color="muted">
                      {r.category} · {r.minutes} min
                    </Txt>
                  </View>
                  <Icon name="chevron" size={18} color={c.muted} />
                </Card>
              </Pressable>
            );
          })}
        </View>
      </Block>
      <Button
        label={read ? 'Lido' : 'Marcar como lido · +2 moedas'}
        disabled={read}
        onPress={() => {
          if (markRead(a.id)) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }}
      />
    </Reading>
  );
}
