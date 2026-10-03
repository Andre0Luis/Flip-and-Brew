import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Bar, Card, Header, Insight, Screen, Segmented, Txt } from '@/components/ui';
import { HourBars, WeekBars } from '@/components/Charts';
import { Ring } from '@/components/BrewViz';
import { GoalPicker } from '@/components/GoalPicker';
import { MissionsCard } from '@/components/MissionsCard';
import { MonthCalendar } from '@/components/MonthCalendar';
import { UsageCard } from '@/components/UsageCard';
import { useApp } from '@/store/useApp';
import {
  afterMissInsight, balanceScore, dayKey, fullCupsAverage, hourly, lastDays, longestSession, moodSummary, streak, triggerCounts, weekTotals,
} from '@/lib/stats';
import { Art } from '@/art/Art';
import { checkinHistory, energySummary } from '@/lib/checkin';
import { bestEnergyWeekday, bestWeekday, completionRate, criticalHour, favoriteCombo, longestStreak, weekdayAverages } from '@/lib/patterns';
import { itemText } from '@/data/catalog';
import { minutesLabel } from '@/lib/format';
import { dictionaries, formatDateShort, useI18n, weekdayInitial } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { useNow } from '@/hooks/useNow';
import { fonts } from '@/theme/tokens';
import type { Key } from '@/i18n';

type Tab = 'resumo' | 'padroes';

function Kpi({ label, value, note, good }: { label: string; value: string; note?: string; good?: boolean }) {
  return (
    <Card style={{ flex: 1, padding: 12, gap: 4, minWidth: 0 }}>
      <Txt v="label" color="muted" numberOfLines={2}>
        {label}
      </Txt>
      <Txt v="num" style={{ fontSize: 20 }}>
        {value}
      </Txt>
      {note ? (
        <Txt v="small" color={good ? 'good' : 'muted'} style={{ fontSize: 11, lineHeight: 15 }}>
          {note}
        </Txt>
      ) : null}
    </Card>
  );
}

function Meter({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Txt v="small" color="muted" style={{ flexShrink: 1 }}>
          {label}
        </Txt>
        <Txt v="small" style={{ fontFamily: fonts.bodyBold }}>
          {value}
        </Txt>
      </View>
      <Bar pct={pct} />
    </View>
  );
}

/** Título de cartão com um valor à direita. O título quebra de linha em vez de empurrar o valor para fora da tela. */
function TitleRow({ title, right }: { title: string; right?: string | null }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <Txt v="label" color="muted" style={{ flex: 1, flexShrink: 1 }}>
        {title}
      </Txt>
      {right ? (
        <Txt v="label" color="muted" style={{ flexShrink: 0 }}>
          {right}
        </Txt>
      ) : null}
    </View>
  );
}

export default function BemEstar() {
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const dec = (n: number) => n.toFixed(1).replace('.', t('number.locale') === 'en-US' ? '.' : ',');
  const { sessions, settings } = useApp();
  const now = useNow(60_000);
  const loadDemo = useApp((s) => s.loadDemo);
  const [tab, setTab] = useState<Tab>('resumo');
  const goal = settings.goalMin;

  const empty = sessions.length === 0;
  const score = balanceScore(sessions, goal);
  const wk = weekTotals(sessions);
  const week = lastDays(sessions, 7);
  const fullAvg = fullCupsAverage(sessions, 30, now);
  const days = streak(sessions);
  const best = longestSession(sessions, now - 7 * 86_400_000);
  const miss = afterMissInsight(sessions);
  const trig = triggerCounts(sessions);
  const mood = moodSummary(sessions, goal);
  const checkins = useApp((s) => s.checkins);
  const energy = energySummary(checkins, sessions, goal);
  const removeCheckin = useApp((s) => s.removeCheckin);
  const history = checkinHistory(checkins);
  const wdAvg = weekdayAverages(sessions, 8, now);
  const wdBest = bestWeekday(wdAvg);
  const comp = completionRate(sessions, 30, now);
  const combo = favoriteCombo(sessions);
  const longest = longestStreak(sessions);
  const critical = criticalHour(sessions);
  const energyDay = bestEnergyWeekday(checkins);
  const weekdayName = (i: number) => dictionaries[lang]['date.weekdays'].split(',')[i];
  const hrs = hourly(sessions);

  return (
    <Screen>
      <Header title={t('wb.title')} right={<Txt v="label" color="muted">{t('wb.goalHeader', { time: minutesLabel(goal) })}</Txt>} />
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'resumo', label: t('wb.tabSummary') },
          { value: 'padroes', label: t('wb.tabPatterns') },
        ]}
      />

      {(tab === 'resumo' || empty) && <MissionsCard />}

      {(tab === 'resumo' || empty) && <GoalPicker hint />}

      {empty ? (
        <Card style={{ gap: 12 }}>
          <Txt v="title">{t('wb.emptyTitle')}</Txt>
          <Txt v="body" color="muted">
            {t('wb.emptyBody')}
          </Txt>
          <Button label={t('wb.demo')} tone="quiet" onPress={loadDemo} />
          <Txt v="small" color="muted">
            {t('wb.demoNote')}
          </Txt>
        </Card>
      ) : tab === 'resumo' ? (
        <>
          <Card style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            {score ? (
              <>
                <Ring progress={score.value / 100} size={96} stroke={9}>
                  <Txt v="num" style={{ fontSize: 26, lineHeight: 30 }} accessibilityLabel={t('wb.scoreA11y', { n: score.value })}>
                    {score.value}
                  </Txt>
                </Ring>
                <View style={{ flex: 1, gap: 10, minWidth: 0 }}>
                  <Meter label={t('wb.meterGoal')} value={`${Math.round(score.goalPct * 100)}%`} pct={score.goalPct} />
                  <Meter label={t('wb.meterDone')} value={`${Math.round(score.completionPct * 100)}%`} pct={score.completionPct} />
                  <Meter label={t('wb.meterStreak')} value={`${days} ${t('unit.day', { n: days })}`} pct={score.streakPct} />
                </View>
              </>
            ) : (
              <Txt v="body" color="muted">
                {t('wb.noWeek')}
              </Txt>
            )}
          </Card>
          <Txt v="small" color="muted" style={{ marginTop: -6 }}>
            {t('wb.scoreNote')}
          </Txt>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Kpi label={t('wb.kpiOffline')} value={minutesLabel(wk.minutes)} note={t('wb.vsPrev', { sign: wk.deltaMinutes >= 0 ? '+' : '−', time: minutesLabel(Math.abs(wk.deltaMinutes)) })} good={wk.deltaMinutes >= 0} />
            <Kpi label={t('wb.kpiBest')} value={best ? minutesLabel(best.elapsedMs / 60_000) : '—'} note={best ? formatDateShort(lang, best.startedAt) : undefined} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Kpi label={t('wb.kpiCups')} value={String(wk.cups)} note={t('wb.ofStarted', { n: wk.sessions })} />
            <Kpi label={t('wb.kpiInterrupted')} value={String(wk.interrupted)} note={t('wb.pickedEarly')} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Kpi label={t('wb.kpiFullAvg')} value={dec(fullAvg.perDay)} note={t('wb.fullAvgNote', { n: fullAvg.span, a: dec(fullAvg.perActiveDay) })} good={fullAvg.perDay >= 1} />
          </View>

          <UsageCard />

          <Card style={{ gap: 8 }}>
            <Txt v="label" color="muted">
              {t('wb.chartWeek')}
            </Txt>
            <WeekBars days={week} />
          </Card>

          <MonthCalendar />

          {miss ? (
            miss.percent >= 0 ? (
              <Insight tag={t('wb.tagAntifragile')}>{t('wb.insightMore', { n: miss.percent })}</Insight>
            ) : (
              <Insight tag={t('wb.tagAntifragile')}>{t('wb.insightLess', { n: Math.abs(miss.percent) })}</Insight>
            )
          ) : (
            <Insight tag={t('wb.tagAntifragile')}>{t('wb.insightDefault')}</Insight>
          )}
        </>
      ) : (
        <>
          <Card style={{ gap: 12 }}>
            <Txt v="label" color="muted">
              {t('wb.styleTitle')}
            </Txt>
            {wdBest === null && !comp.started ? (
              <Txt v="small" color="muted">
                {t('wb.styleEmpty')}
              </Txt>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 64 }} accessibilityLabel={t('wb.styleWeekdayA11y')}>
                  {wdAvg.map((m, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                      <View style={{ width: '100%', height: Math.max(3, (m / Math.max(...wdAvg, 1)) * 40), borderRadius: 3, backgroundColor: i === wdBest ? c.accent : c.cupFill, opacity: i === wdBest ? 1 : 0.55 }} />
                      <Txt v="small" color="muted" style={{ fontSize: 10, lineHeight: 12 }}>
                        {weekdayInitial(lang, i)}
                      </Txt>
                    </View>
                  ))}
                </View>
                {[
                  wdBest !== null ? [t('wb.styleBestDay'), weekdayName(wdBest)] : null,
                  comp.started ? [t('wb.styleCompletion'), `${Math.round(comp.rate * 100)}%`, t('wb.styleCompletionNote', { a: comp.done, b: comp.started })] : null,
                  combo ? [t('wb.styleCombo'), `${itemText(lang, combo.brewerId).name} + ${itemText(lang, combo.cupId).name}`, t('wb.styleComboNote', { n: combo.count })] : null,
                  longest ? [t('wb.styleLongest'), `${longest} ${t('unit.day', { n: longest })}`] : null,
                  critical !== null ? [t('wb.styleCritical'), `${critical}h`, t('wb.styleCriticalNote')] : null,
                  energyDay !== null ? [t('wb.styleEnergyDay'), weekdayName(energyDay)] : null,
                ]
                  .filter((r): r is string[] => !!r)
                  .map(([label, value, note]) => (
                    <View key={label} style={{ gap: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <Txt v="small" color="muted" style={{ flex: 1 }}>
                          {label}
                        </Txt>
                        <Txt v="title" style={{ fontSize: 15, flexShrink: 1, textAlign: 'right', textTransform: 'capitalize' }}>
                          {value}
                        </Txt>
                      </View>
                      {note ? (
                        <Txt v="small" color="muted" style={{ fontSize: 12 }}>
                          {note}
                        </Txt>
                      ) : null}
                    </View>
                  ))}
              </>
            )}
          </Card>

          <Card style={{ gap: 8 }}>
            <Txt v="label" color="muted">
              {t('wb.hourTitle')}
            </Txt>
            <HourBars hours={hrs} />
            {hrs.some((h) => h > 0) && (
              <Txt v="small" color="muted">
                {t('wb.strongest', { list: [...hrs.map((m, h) => ({ m, h }))].sort((a, b) => b.m - a.m).slice(0, 3).map((x) => x.h).sort((a, b) => a - b).map((h) => `${h}h`).join(', ') })}
              </Txt>
            )}
          </Card>

          <Card style={{ gap: 10 }}>
            <Txt v="label" color="muted">
              {t('wb.triggersTitle')}
            </Txt>
            {trig.length ? (
              <>
                {trig.map((tr) => (
                  <View key={tr.trigger} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Txt v="small" style={{ width: 96 }} numberOfLines={2}>
                      {t(`trigger.${tr.trigger}` as Key)}
                    </Txt>
                    <View style={{ flex: 1 }}>
                      <Bar pct={tr.count / trig[0].count} color="cupFill" height={8} />
                    </View>
                    <Txt v="small" color="muted" style={{ width: 28, textAlign: 'right' }}>
                      {tr.count}×
                    </Txt>
                  </View>
                ))}
                <Txt v="small" color="muted">
                  {t(
                    trig[0].trigger === 'notification'
                      ? 'wb.trigNote.notification'
                      : trig[0].trigger === 'boredom'
                        ? 'wb.trigNote.boredom'
                        : trig[0].trigger === 'work'
                          ? 'wb.trigNote.work'
                          : 'wb.trigNote.other',
                  )}
                </Txt>
              </>
            ) : (
              <Txt v="small" color="muted">
                {t('wb.trigEmpty')}
              </Txt>
            )}
          </Card>

          <Card style={{ gap: 10 }}>
            <TitleRow title={t('wb.moodTitle')} right={mood ? t('wb.moodAvg', { n: dec(mood.average) }) : null} />
            {mood ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 52 }}>
                  {mood.ratings.map((m, i) => (
                    <View key={i} style={{ flex: 1, height: m * 10, borderRadius: 3, backgroundColor: m >= 5 ? c.accent : c.cupFill, opacity: m >= 5 ? 1 : 0.55 }} />
                  ))}
                </View>
                {mood.high !== null && mood.low !== null && (
                  <Txt v="small" color="muted">
                    {t('wb.moodCompare', { time: minutesLabel(Math.min(goal, 120)), a: dec(mood.high), b: dec(mood.low) })}
                  </Txt>
                )}
              </>
            ) : (
              <Txt v="small" color="muted">
                {t('wb.moodEmpty')}
              </Txt>
            )}
          </Card>

          <Card style={{ gap: 10 }}>
            <TitleRow title={t('wb.energyTitle')} right={energy ? t('wb.energyAvg', { n: dec(energy.average) }) : null} />
            {energy ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 52 }}>
                  {energy.week.map((e, i) => (
                    <View key={i} style={{ flex: 1, height: e === null ? 4 : e * 10, borderRadius: 3, backgroundColor: e !== null && e >= 5 ? c.accent : e === null ? c.line : c.cupFill, opacity: e !== null && e >= 5 ? 1 : 0.55 }} />
                  ))}
                </View>
                {energy.high !== null && energy.low !== null && (
                  <Txt v="small" color="muted">
                    {t('wb.energyCompare', { time: minutesLabel(Math.min(goal, 120)), a: dec(energy.high), b: dec(energy.low) })}
                  </Txt>
                )}
              </>
            ) : (
              <Txt v="small" color="muted">
                {t('wb.energyEmpty')}
              </Txt>
            )}
          </Card>

          <Card style={{ gap: 10 }}>
            <Txt v="label" color="muted">
              {t('wb.energyHistory')}
            </Txt>
            {history.length ? (
              history.map((h) => (
                <View key={h.day} style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 8, rowGap: 4 }}>
                  <Txt v="small" style={{ width: 56 }} numberOfLines={1}>
                    {formatDateShort(lang, h.at)}
                  </Txt>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Art key={n} id="tiny" size={24} fill={n <= h.energy ? 1 : 0} />
                    ))}
                  </View>
                  {h.day === dayKey(now) ? (
                    <Button label={t('wb.energyRedo')} tone="quiet" onPress={() => removeCheckin(h.day)} style={{ paddingVertical: 6, paddingHorizontal: 12 }} />
                  ) : (
                    <Txt v="small" color="muted" style={{ flexShrink: 1 }}>
                      {t(`energy.${h.energy}` as 'energy.1')}
                    </Txt>
                  )}
                </View>
              ))
            ) : (
              <Txt v="small" color="muted">
                {t('wb.energyHistoryEmpty')}
              </Txt>
            )}
          </Card>

          <Insight tag={t('wb.tagStoic')}>{t('wb.observe')}</Insight>
        </>
      )}
    </Screen>
  );
}
