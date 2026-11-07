import React from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Block, Bullets, Callout, QuoteBlock, Reading } from '@/components/Reading';
import { Button, Card, Txt } from '@/components/ui';
import { articleById } from '@/data/articles';
import { quoteById } from '@/data/quotes';
import { useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';
import { Icon } from '@/components/Icon';
import { useTheme } from '@/theme/ThemeProvider';

export default function Artigo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const read = useApp((s) => s.articlesRead.includes(String(id)));
  const markRead = useApp((s) => s.markRead);
  const a = articleById(lang, String(id));

  if (!a) {
    return (
      <Reading eyebrow={t('learn.title')}>
        <Txt v="body">{t('article.notFound')}</Txt>
        <Button label={t('common.back')} onPress={() => router.replace('/aprender')} />
      </Reading>
    );
  }
  const q = a.quoteId ? quoteById(lang, a.quoteId) : undefined;

  return (
    <Reading eyebrow={t('article.eyebrow', { cat: t(`cat.${a.category}`), n: a.minutes })}>
      <Txt v="display">{a.title}</Txt>
      {q && <QuoteBlock text={q.text} by={`${q.author} · ${q.source}`} />}
      <Block label={t('article.oneLine')}>
        <Txt v="body">{a.oneLine}</Txt>
      </Block>
      {a.body.map((p, i) => (
        <Txt key={i} v="body">
          {p}
        </Txt>
      ))}
      <Callout label={t('article.inApp')}>{a.inApp}</Callout>
      <Block label={t('article.tryToday')}>
        <Bullets items={a.tryToday} />
      </Block>
      <Block label={t('article.continue')}>
        <View style={{ gap: 8 }}>
          {a.related.map((rid) => {
            const r = articleById(lang, rid);
            if (!r) return null;
            return (
              <Pressable key={rid} accessibilityRole="button" onPress={() => router.replace({ pathname: '/artigo/[id]', params: { id: rid } })}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Txt v="title" style={{ fontSize: 15 }}>
                      {r.title}
                    </Txt>
                    <Txt v="small" color="muted">
                      {t('article.eyebrow', { cat: t(`cat.${r.category}`), n: r.minutes })}
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
        label={read ? t('article.read') : t('article.markRead')}
        disabled={read}
        onPress={() => {
          if (markRead(a.id)) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }}
      />
    </Reading>
  );
}
