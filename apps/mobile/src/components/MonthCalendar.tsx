import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card, Txt } from './ui';
import { Icon } from './Icon';
import { dictionaries, formatDateLong, useI18n, weekdayInitial } from '@/i18n';
import { monthGrid, monthSummary, shiftMonth, type MonthCell } from '@/lib/month';
import { minutesLabel } from '@/lib/format';
import { useApp } from '@/store/useApp';
import { useNow } from '@/hooks/useNow';
import { useTheme } from '@/theme/ThemeProvider';

// Quanto da cor de destaque cada nível de energia (1 a 5) usa.
const ALPHA = ['', '3A', '66', '8F', 'BF', 'FF'];

/** Calendário do mês: a cor mostra a energia do check-in, o ponto marca a meta offline batida. */
export function MonthCalendar() {
  const { c, f } = useTheme();
  const { lang, t } = useI18n();
  const checkins = useApp((s) => s.checkins);
  const sessions = useApp((s) => s.sessions);
  const goal = useApp((s) => s.settings.goalMin);
  const now = useNow(60_000);
  const today = new Date(now);
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<MonthCell | null>(null);

  const weeks = monthGrid(view.year, view.month, checkins, sessions, goal, now);
  const sum = monthSummary(weeks);
  const isCurrent = view.year === today.getFullYear() && view.month === today.getMonth();
  const monthName = dictionaries[lang]['date.months'].split(',')[view.month];
  const move = (delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setSelected(null);
    setView((v) => shiftMonth(v.year, v.month, delta));
  };
  const label = (n: number) => t(`energy.${n}` as 'energy.1');

  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('wb.monthPrev')} onPress={() => move(-1)} hitSlop={12} style={{ padding: 6 }}>
          <Icon name="back" color={c.fg} />
        </Pressable>
        <Txt v="title" style={{ textTransform: 'capitalize' }}>
          {monthName} {view.year}
        </Txt>
        <Pressable accessibilityRole="button" accessibilityLabel={t('wb.monthNext')} onPress={() => move(1)} disabled={isCurrent} hitSlop={12} style={{ padding: 6, opacity: isCurrent ? 0.25 : 1, transform: [{ scaleX: -1 }] }}>
          <Icon name="back" color={c.fg} />
        </Pressable>
      </View>

      <Txt v="small" color="muted">
        {sum.answered ? t('wb.monthSummary', { n: sum.answered, avg: (Math.round(sum.avgEnergy * 10) / 10).toString().replace('.', t('number.locale') === 'en-US' ? '.' : ',') }) : t('wb.monthSummaryEmpty')}
        {sum.days ? ` · ${t('wb.monthGoalDays', { a: sum.goalDays, b: sum.days })}` : ''}
      </Txt>

      <View style={{ gap: 4 }} accessibilityLabel={t('wb.calendarA11y')}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <View key={d} style={{ flex: 1, alignItems: 'center' }}>
              <Txt v="small" color="muted" style={{ fontFamily: f.monoMedium, fontSize: 10, lineHeight: 13 }}>
                {weekdayInitial(lang, d)}
              </Txt>
            </View>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} style={{ flexDirection: 'row', gap: 4 }}>
            {week.map((cell) => {
              const level = cell.energy ?? 0;
              const bg = !cell.inMonth ? 'transparent' : level ? `${c.accent}${ALPHA[level]}` : c.soft;
              const dark = level >= 4;
              const on = selected?.key === cell.key;
              return (
                <Pressable
                  key={cell.key}
                  disabled={!cell.inMonth || cell.future}
                  accessibilityRole="button"
                  accessibilityLabel={`${formatDateLong(lang, new Date(cell.ts))}. ${cell.energy ? t('wb.monthDayEnergy', { label: label(cell.energy) }) : t('wb.monthDayNone')}`}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelected(on ? null : cell);
                  }}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: bg,
                    opacity: cell.inMonth ? (cell.future ? 0.4 : 1) : 0,
                    borderWidth: cell.isToday || on ? 2 : 0,
                    borderColor: c.fg,
                  }}
                >
                  <Txt v="small" style={{ fontSize: 12, lineHeight: 15, color: dark ? c.accentFg : c.fg, fontFamily: f.monoMedium }}>
                    {cell.day}
                  </Txt>
                  {cell.goalMet && cell.inMonth && <View style={{ position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 3, backgroundColor: dark ? c.accentFg : c.good }} />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {selected ? (
        <View style={{ gap: 2 }} accessibilityLiveRegion="polite">
          <Txt v="title" style={{ fontSize: 15 }}>
            {formatDateLong(lang, new Date(selected.ts))}
          </Txt>
          <Txt v="small" color="muted">
            {selected.energy ? t('wb.monthDayEnergy', { label: label(selected.energy) }) : t('wb.monthDayNone')} · {t('wb.monthDayOffline', { time: minutesLabel(selected.minutes) })}
          </Txt>
        </View>
      ) : (
        <Txt v="small" color="muted">
          {t('wb.monthLegend')}
        </Txt>
      )}
    </Card>
  );
}
