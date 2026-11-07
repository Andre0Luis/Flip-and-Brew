import React from 'react';
import { View } from 'react-native';
import { Card, Txt } from '@/components/ui';
import { CONTENT } from '@/data/content';
import { useI18n } from '@/i18n';

/** O texto "Por que este app existe": usado na tela do criador (Ajustes) e na introdução. */
export function CreatorStory() {
  const { lang } = useI18n();
  const text = CONTENT[lang].creator;
  return (
    <>
      <Card inverse style={{ paddingVertical: 22 }}>
        <Txt v="quote" color="bg" style={{ textAlign: 'center' }}>
          {text.motto}
        </Txt>
      </Card>
      {text.blocks.map((b) => (
        <View key={b.heading} style={{ gap: 6 }}>
          <Txt v="label" color="accent">
            {b.heading}
          </Txt>
          <Txt v="body">{b.text}</Txt>
        </View>
      ))}
      <View style={{ gap: 2, paddingTop: 6 }}>
        <Txt v="body" color="muted">
          {text.closing}
        </Txt>
        <Txt v="title">{text.signature}</Txt>
      </View>
    </>
  );
}
