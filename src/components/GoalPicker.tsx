import React from 'react';
import { View } from 'react-native';
import { Card, Chip, Txt } from './ui';
import { useApp } from '@/store/useApp';
import { useI18n } from '@/i18n';

/** Metas possíveis de tempo offline por dia, em minutos. */
export const GOALS = [30, 60, 90, 120, 180, 240];

/** Escolha da meta diária de tempo offline. Aparece em Ajustes e no Bem-estar e muda os dois ao mesmo tempo. */
export function GoalPicker({ hint }: { hint?: boolean }) {
  const { t } = useI18n();
  const goal = useApp((s) => s.settings.goalMin);
  const set = useApp((s) => s.setSettings);
  const label = (g: number) => (g < 60 ? `${g} min` : `${(g / 60).toFixed(g % 60 === 0 ? 0 : 1).replace('.', t('number.locale') === 'en-US' ? '.' : ',')} h`);
  return (
    <Card style={{ gap: 12 }}>
      <Txt v="title">{t('set.goal')}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {GOALS.map((g) => (
          <Chip key={g} label={label(g)} on={goal === g} onPress={() => set({ goalMin: g })} />
        ))}
      </View>
      {hint && (
        <Txt v="small" color="muted">
          {t('wb.goalHint')}
        </Txt>
      )}
    </Card>
  );
}
