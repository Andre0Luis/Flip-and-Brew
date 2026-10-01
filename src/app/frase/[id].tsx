import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Block, Bullets, Callout, QuoteBlock, Reading } from '@/components/Reading';
import { Button, Txt } from '@/components/ui';
import { getQuotes, quoteById } from '@/data/quotes';
import { ARTICLE_BASE, articleById } from '@/data/articles';
import { useI18n } from '@/i18n';

export default function Frase() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lang, t } = useI18n();
  const q = quoteById(lang, String(id));
  if (!q) {
    return (
      <Reading eyebrow={t('quote.eyebrow')}>
        <Txt v="body">{t('quote.notFound')}</Txt>
        <Button label={t('common.back')} onPress={() => router.replace('/')} />
      </Reading>
    );
  }
  const articleBase = ARTICLE_BASE.find((a) => a.quoteId === q.id);
  const article = articleBase ? articleById(lang, articleBase.id) : undefined;
  const quotes = getQuotes(lang);
  const next = quotes[(quotes.findIndex((x) => x.id === q.id) + 1) % quotes.length];

  return (
    <Reading eyebrow={t('quote.eyebrow')}>
      <QuoteBlock text={q.text} by={`${q.author} · ${q.source}`} />
      <Block label={t('quote.context')}>
        <Txt v="body">{q.context}</Txt>
      </Block>
      <Block label={t('article.tryToday')}>
        <Bullets items={q.tryToday} />
      </Block>
      <Callout label={t('quote.freeTranslation')}>{t('quote.freeTranslationNote')}</Callout>
      {article && <Button tone="dark" label={t('quote.readArticle', { title: article.title })} onPress={() => router.push({ pathname: '/artigo/[id]', params: { id: article.id } })} />}
      <Button tone="quiet" label={t('quote.next')} onPress={() => router.replace({ pathname: '/frase/[id]', params: { id: next.id } })} />
    </Reading>
  );
}
