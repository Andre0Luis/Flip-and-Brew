import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { Coin } from '@/art/Art';
import { formatNumber, useI18n } from '@/i18n';

type Variant = 'hero' | 'display' | 'quote' | 'title' | 'body' | 'small' | 'label' | 'num' | 'numBig';
type ColorKey = 'fg' | 'muted' | 'accent' | 'good' | 'bad' | 'bg' | 'accentFg';

export function Txt({ v = 'body', color = 'fg', style, ...rest }: TextProps & { v?: Variant; color?: ColorKey }) {
  const { c, f } = useTheme();
  const base = {
    hero: { fontFamily: f.display, fontSize: 48, lineHeight: 52 },
    display: { fontFamily: f.display, fontSize: 30, lineHeight: 34 },
    quote: { fontFamily: f.display, fontSize: 22, lineHeight: 29 },
    title: { fontFamily: f.bodySemi, fontSize: 17, lineHeight: 23 },
    body: { fontFamily: f.body, fontSize: 15, lineHeight: 22 },
    small: { fontFamily: f.body, fontSize: 13, lineHeight: 18 },
    label: { fontFamily: f.monoMedium, fontSize: 11, lineHeight: 14, letterSpacing: 1.3, textTransform: 'uppercase' as const },
    num: { fontFamily: f.monoMedium, fontSize: 18, lineHeight: 22, fontVariant: ['tabular-nums' as const] },
    numBig: { fontFamily: f.monoMedium, fontSize: 40, lineHeight: 44, fontVariant: ['tabular-nums' as const] },
  }[v];
  return <Text {...rest} style={[base, { color: c[color] }, style]} />;
}

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  pad = true,
  bottomPad = 24,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom')[];
  pad?: boolean;
  bottomPad?: number;
}) {
  const { c } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[{ paddingBottom: bottomPad, gap: 16 }, pad && { paddingHorizontal: 20 }]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, pad && { paddingHorizontal: 20 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style, inverse }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; inverse?: boolean }) {
  const { c, r } = useTheme();
  return (
    <View
      style={[
        { borderRadius: r.lg, padding: 16 },
        inverse ? { backgroundColor: c.fg } : { backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.line },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  tone = 'accent',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: 'accent' | 'dark' | 'quiet' | 'quietOnDark';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { c, f, r } = useTheme();
  const bg = tone === 'accent' ? c.accent : tone === 'dark' ? c.fg : 'transparent';
  // quietOnDark: para cartões invertidos (fundo c.fg), onde o texto precisa ser c.bg
  const fg = tone === 'accent' ? c.accentFg : tone === 'dark' ? c.bg : tone === 'quietOnDark' ? c.bg : c.fg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: r.pill,
          paddingVertical: 15,
          paddingHorizontal: 24,
          alignItems: 'center',
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
        tone === 'quiet' && { borderWidth: 1, borderColor: c.line },
        tone === 'quietOnDark' && { borderWidth: 1, borderColor: c.bg, opacity: disabled ? 0.45 : pressed ? 0.7 : 0.9 },
        style,
      ]}
    >
      <Text style={{ color: fg, fontFamily: f.bodySemi, fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { c, f, r } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.soft, borderRadius: r.pill, padding: 3, gap: 3 }} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.value);
            }}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: r.pill, backgroundColor: on ? c.surface : 'transparent' }}
          >
            <Text style={{ fontFamily: f.bodySemi, fontSize: 13, color: on ? c.fg : c.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  const { c, f, r } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={{ paddingHorizontal: 13, paddingVertical: 8, borderRadius: r.pill, borderWidth: 1, borderColor: on ? c.fg : c.line, backgroundColor: on ? c.fg : 'transparent' }}
    >
      <Text style={{ fontFamily: f.bodySemi, fontSize: 13, color: on ? c.bg : c.muted }}>{label}</Text>
    </Pressable>
  );
}

export function CoinBadge({ coins, onPress }: { coins: number; onPress?: () => void }) {
  const { c, r } = useTheme();
  const { lang, t } = useI18n();
  return (
    <Pressable
      accessibilityLabel={t('common.coinsA11y', { n: coins })}
      onPress={onPress}
      disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: r.pill, paddingVertical: 5, paddingLeft: 6, paddingRight: 12 }}
    >
      <Coin size={22} />
      <Txt v="num" style={{ fontSize: 15 }}>
        {formatNumber(lang, coins)}
      </Txt>
    </Pressable>
  );
}

export function Bar({ pct, color = 'accent', height = 6 }: { pct: number; color?: 'accent' | 'cupFill'; height?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: c.soft, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${Math.max(0, Math.min(1, pct)) * 100}%`, backgroundColor: c[color], borderRadius: height / 2 }} />
    </View>
  );
}

export function Header({ title, right, left }: { title: string; right?: React.ReactNode; left?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, minHeight: 52 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
        {left}
        <Txt v="display" style={{ flexShrink: 1 }}>
          {title}
        </Txt>
      </View>
      {right}
    </View>
  );
}

export function Insight({ children, tag }: { children: React.ReactNode; tag: string }) {
  const { c } = useTheme();
  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: c.accent, paddingLeft: 12, gap: 6 }}>
      <Txt v="quote" style={{ fontSize: 17, lineHeight: 24 }}>
        {children}
      </Txt>
      <Txt v="label" color="muted">
        {tag}
      </Txt>
    </View>
  );
}
