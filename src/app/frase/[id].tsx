import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Block, Bullets, Callout, QuoteBlock, Reading } from '@/components/Reading';
import { Button, Txt } from '@/components/ui';
import { QUOTES, quoteById } from '@/data/quotes';
import { ARTICLES } from '@/data/articles';

export default function Frase() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const q = quoteById(String(id));
  if (!q) {
    return (
      <Reading eyebrow="Frase">
        <Txt v="body">Não encontramos esta frase.</Txt>
        <Button label="Voltar" onPress={() => router.replace('/')} />
      </Reading>
    );
  }
  const article = ARTICLES.find((a) => a.quoteId === q.id);
  const next = QUOTES[(QUOTES.findIndex((x) => x.id === q.id) + 1) % QUOTES.length];

  return (
    <Reading eyebrow="Frase do dia">
      <QuoteBlock text={q.text} by={`${q.author} · ${q.source}`} />
      <Block label="Contexto">
        <Txt v="body">{q.context}</Txt>
      </Block>
      <Block label="Tente hoje">
        <Bullets items={q.tryToday} />
      </Block>
      <Callout label="Tradução livre">As frases são traduções livres feitas para o app. Confira a obra original para citar.</Callout>
      {article && <Button tone="dark" label={`Ler: ${article.title}`} onPress={() => router.push({ pathname: '/artigo/[id]', params: { id: article.id } })} />}
      <Button tone="quiet" label="Próxima frase" onPress={() => router.replace({ pathname: '/frase/[id]', params: { id: next.id } })} />
    </Reading>
  );
}
