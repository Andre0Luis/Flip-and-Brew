import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './Icon';
import { Card, Screen, Txt } from './ui';
import { useTheme } from '@/theme/ThemeProvider';

export function Reading({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  const router = useRouter();
  const { c } = useTheme();
  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="back" color={c.muted} />
          <Txt v="label" color="muted">
            Voltar
          </Txt>
        </Pressable>
        <Txt v="label" color="muted">
          {eyebrow}
        </Txt>
      </View>
      {children}
    </Screen>
  );
}

export function QuoteBlock({ text, by }: { text: string; by: string }) {
  return (
    <Card inverse style={{ gap: 12, padding: 20 }}>
      <Txt v="quote" color="bg" style={{ fontSize: 24, lineHeight: 31 }}>
        {text}
      </Txt>
      <Txt v="label" color="bg" style={{ opacity: 0.7 }}>
        {by}
      </Txt>
    </Card>
  );
}

export function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Txt v="label" color="muted">
        {label}
      </Txt>
      {children}
    </View>
  );
}

export function Callout({ label, children }: { label: string; children: React.ReactNode }) {
  const { c, r } = useTheme();
  return (
    <View style={{ backgroundColor: c.soft, borderRadius: r.md, padding: 14, gap: 4 }}>
      <Txt v="label" color="muted">
        {label}
      </Txt>
      <Txt v="body">{children}</Txt>
    </View>
  );
}

export function Bullets({ items }: { items: string[] }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {items.map((t) => (
        <View key={t} style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c.accent, marginTop: 9 }} />
          <Txt v="body" style={{ flex: 1 }}>
            {t}
          </Txt>
        </View>
      ))}
    </View>
  );
}
