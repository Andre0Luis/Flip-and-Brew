import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Art } from '@/art/Art';
import { Button, Card, Txt } from './ui';
import { ENERGY_LEVELS, todayCheckin } from '@/lib/checkin';
import { useNow } from '@/hooks/useNow';
import { useApp } from '@/store/useApp';
import { useI18n } from '@/i18n';

/**
 * Check-in diário: a energia de hoje em xícaras de café, de uma (pouca) a cinco (cheia).
 * A pessoa escolhe, confirma e o cartão some do Início até o dia seguinte. O histórico fica no Bem-estar.
 */
export function CheckinCard() {
  const { t } = useI18n();
  const checkins = useApp((s) => s.checkins);
  const setCheckin = useApp((s) => s.setCheckin);
  const now = useNow(60_000);
  const [draft, setDraft] = useState(0);

  if (todayCheckin(checkins, now)) return null;

  const label = (n: number) => t(`energy.${n}` as 'energy.1');

  return (
    <Card style={{ gap: 10 }}>
      <Txt v="title" style={{ fontSize: 15 }}>
        {draft ? t('checkin.confirmQ', { label: label(draft) }) : t('checkin.title')}
      </Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {ENERGY_LEVELS.map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={t('checkin.a11y', { n, label: label(n) })}
            accessibilityState={{ selected: n === draft }}
            hitSlop={6}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setDraft(n);
            }}
          >
            {/* Xícaras cheias até o nível escolhido; as demais ficam vazias. */}
            <Art id="tiny" size={56} fill={n <= draft ? 1 : 0} />
          </Pressable>
        ))}
      </View>
      {draft ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            label={t('checkin.confirm')}
            style={{ flex: 1 }}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              setCheckin(draft);
              setDraft(0);
            }}
          />
          <Button label={t('checkin.redo')} tone="quiet" style={{ flex: 1 }} onPress={() => setDraft(0)} />
        </View>
      ) : (
        <Txt v="small" color="muted">
          {t('checkin.hint')}
        </Txt>
      )}
    </Card>
  );
}
