import React from 'react';
import { Pressable, View } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Icon, type IconName } from '@/components/Icon';
import { Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n, type Key } from '@/i18n';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const ITEMS: Record<string, { label: Key; icon: IconName }> = {
  index: { label: 'tab.home', icon: 'home' },
  guia: { label: 'tab.guide', icon: 'bag' },
  'bem-estar': { label: 'tab.wellbeing', icon: 'heart' },
  aprender: { label: 'tab.learn', icon: 'book' },
  colecao: { label: 'tab.collection', icon: 'shelf' },
  comunidade: { label: 'tab.community', icon: 'people' },
};

function TabBar({ state, navigation }: TabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8) }}>
      {state.routes.map((route, i) => {
        const item = ITEMS[route.name];
        if (!item) return null;
        const focused = state.index === i;
        const color = focused ? c.fg : c.muted;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={t(item.label)}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) {
                Haptics.selectionAsync().catch(() => {});
                navigation.navigate(route.name);
              }
            }}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 }}
          >
            <Icon name={item.icon} color={color} />
            <Txt v="small" style={{ fontSize: 11, lineHeight: 14, color }}>
              {t(item.label)}
            </Txt>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? c.accent : 'transparent' }} />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="guia" />
      <Tabs.Screen name="bem-estar" />
      <Tabs.Screen name="aprender" />
      <Tabs.Screen name="colecao" />
      <Tabs.Screen name="comunidade" />
    </Tabs>
  );
}
