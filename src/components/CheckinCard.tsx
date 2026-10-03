import React from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Art } from '@/art/Art';
import { Card, Txt } from './ui';
import { ENERGY_LEVELS, todayCheckin } from '@/lib/checkin';
import { useNow } from '@/hooks/useNow';
import { useApp } from '@/store/useApp';
import { useI18n } from '@/i18n';

/** Check-in diário: a energia de hoje em xícaras de café, de uma (pouca) a cinco (cheia). */
export function CheckinCard() {
  const { t } = useI18n();
  const checkins = useApp((s) => s.checkins);
  const setCheckin = useApp((s) => s.setCheckin);
  const now = useNow(60_000);
  const today = todayCheckin(checkins, now);
  const level = today?.energy ?? 0;

  return (
    <Card style={{ gap: 10 }}>
      <Txt v="title" style={{ fontSize: 15 }}>
        {today ? t('checkin.done', { label: t(`energy.${level}` as 'energy.1') }) : t('checkin.title')}
      </Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {ENERGY_LEVELS.map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={t('checkin.a11y', { n, label: t(`energy.${n}` as 'energy.1') })}
            accessibilityState={{ selected: n === level }}
            hitSlop={6}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setCheckin(n);
            }}
          >
            {/* Xícaras cheias até o nível escolhido; as demais ficam vazias. */}
            <Art id="tiny" size={56} fill={n <= level ? 1 : 0} />
          </Pressable>
        ))}
      </View>
      <Txt v="small" color="muted">
        {today ? t('checkin.change') : t('checkin.hint')}
      </Txt>
    </Card>
  );
}
