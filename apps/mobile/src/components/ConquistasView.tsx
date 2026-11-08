import React from 'react';
import { View } from 'react-native';
import { Card, Txt } from '@/components/ui';
import { ARTICLE_COUNT } from '@/data/articles';
import { recentMissions } from '@/lib/missions';
import { formatDateShort, useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';
import { streak } from '@/lib/stats';
import { minutesLabel } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

/** Números de uso do app e as últimas missões. Moram no Bem-estar. */
export function ConquistasView() {
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const { sessions, articlesRead, practicesDone, missionsDone, missionBonusDays, missionsClaimed } = useApp();

  const finished = sessions.filter((s) => s.status === 'done').length;
  const totalMin = sessions.reduce((a, s) => a + s.elapsedMs / 60_000, 0);
  const best = Math.max(0, ...sessions.map((s) => s.elapsedMs / 60_000));
  const stats: [string, string][] = [
    [t('col.statCups'), String(finished)],
    [t('col.statTotal'), minutesLabel(totalMin)],
    [t('col.statBest'), best ? minutesLabel(best) : '—'],
    [t('col.statStreak'), `${streak(sessions)} ${t('unit.day', { n: streak(sessions) })}`],
    [t('col.statFull'), String(sessions.filter((s) => s.quality === 'encorpado').length)],
    [t('col.statArticles'), t('col.statArticlesValue', { n: articlesRead.length, total: ARTICLE_COUNT })],
    [t('col.statPractices'), String(practicesDone.length)],
    [t('col.statMissions'), String(missionsDone)],
    [t('col.statMissionDays'), String(missionBonusDays)],
  ];
  const recent = recentMissions(missionsClaimed);

  return (
    <>
      <Card style={{ gap: 0, paddingVertical: 4 }}>
        {stats.map(([k, v], i) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <Txt v="body" color="muted">
              {k}
            </Txt>
            <Txt v="num" style={{ fontSize: 16 }}>
              {v}
            </Txt>
          </View>
        ))}
      </Card>
      <Card style={{ gap: 10 }}>
        <Txt v="label" color="muted">
          {t('col.missionsRecent')}
        </Txt>
        {recent.length ? (
          recent.map((m) => (
            <View key={`${m.day}-${m.id}`} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <Txt v="small" style={{ flex: 1 }}>
                {t(`mission.h.${m.id}` as 'mission.h.checkin')}
              </Txt>
              <Txt v="small" color="muted">
                {formatDateShort(lang, new Date(`${m.day}T12:00:00`).getTime())}
              </Txt>
            </View>
          ))
        ) : (
          <Txt v="small" color="muted">
            {t('col.missionsEmpty')}
          </Txt>
        )}
      </Card>
    </>
  );
}
