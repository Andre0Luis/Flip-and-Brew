import React from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Coin } from '@/art/Art';
import { Bar, Button, Card, Txt } from './ui';
import { useNow } from '@/hooks/useNow';
import { ALL_BONUS, allClaimed, bonusClaimed, missionsFor, type Mission } from '@/lib/missions';
import { useApp } from '@/store/useApp';
import { useI18n } from '@/i18n';

/** Missões diárias: três por dia, com progresso calculado dos dados do app. As moedas entram quando a pessoa resgata. */
export function MissionsCard() {
  const { t } = useI18n();
  const now = useNow(30_000);
  const sessions = useApp((s) => s.sessions);
  const checkins = useApp((s) => s.checkins);
  const practicesDone = useApp((s) => s.practicesDone);
  const goalMin = useApp((s) => s.settings.goalMin);
  const claimed = useApp((s) => s.missionsClaimed);
  const claim = useApp((s) => s.claimMission);

  const ms = missionsFor({ sessions, checkins, practicesDone, goalMin, claimed }, now);
  const label = (m: Mission) => t(`mission.${m.id}` as 'mission.checkin', { n: m.target });
  const everyClaimed = allClaimed(ms);
  const bonusDone = bonusClaimed(claimed, now);
  const onClaim = (id: string) => {
    if (claim(id, now) > 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <Card style={{ gap: 14 }}>
      <Txt v="label" color="muted">
        {t('mission.title')}
      </Txt>
      {ms.map((m) => (
        <View key={m.id} style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt v="small" style={m.claimed ? { textDecorationLine: 'line-through', opacity: 0.6 } : undefined}>
                {label(m)}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Coin size={14} />
                <Txt v="label" color="muted">
                  {t('mission.reward', { n: m.reward })}
                </Txt>
                {m.target > 1 && !m.claimed && (
                  <Txt v="label" color="muted">
                    · {t('mission.progress', { a: m.progress, b: m.target })}
                  </Txt>
                )}
              </View>
            </View>
            {m.claimed ? (
              <Txt v="label" color="good">
                {t('mission.claimed')}
              </Txt>
            ) : (
              <Button label={t('mission.claim')} tone={m.done ? 'dark' : 'quiet'} disabled={!m.done} onPress={() => onClaim(m.id)} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />
            )}
          </View>
          {!m.claimed && m.target > 1 && <Bar pct={m.progress / m.target} height={5} />}
        </View>
      ))}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Txt v="small" color="muted" style={{ flex: 1 }}>
            {t('mission.bonus', { n: ALL_BONUS })}
          </Txt>
          {bonusDone ? (
            <Txt v="label" color="good">
              {t('mission.claimed')}
            </Txt>
          ) : (
            <Button label={t('mission.bonusClaim')} tone={everyClaimed ? 'dark' : 'quiet'} disabled={!everyClaimed} onPress={() => onClaim('all')} style={{ paddingVertical: 8, paddingHorizontal: 14 }} />
          )}
        </View>
      </View>
      <Txt v="small" color="muted">
        {t('mission.hint')}
      </Txt>
    </Card>
  );
}
