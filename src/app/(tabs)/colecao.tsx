import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Art } from '@/art/Art';
import { Button, Card, Header, Screen, Segmented, Txt } from '@/components/ui';
import { CATALOG, brewers, byId, cups, localize, packs, type CatalogItem } from '@/data/catalog';
import { ARTICLE_COUNT } from '@/data/articles';
import { recentMissions } from '@/lib/missions';
import { formatDateShort, useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';
import { streak } from '@/lib/stats';
import { minutesLabel } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

type Tab = 'cup' | 'brewer' | 'beans' | 'feitos';

function Shelf({ items, owned, selected, onSelect }: { items: (CatalogItem & { name: string })[]; owned: string[]; selected: string; onSelect: (id: string) => void }) {
  const { c, r } = useTheme();
  const { t } = useI18n();
  const rows: (CatalogItem & { name: string })[][] = [];
  for (let i = 0; i < items.length; i += 3) rows.push(items.slice(i, i + 3));
  return (
    <View style={{ gap: 14 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8, borderBottomWidth: 6, borderBottomColor: c.accent, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, paddingHorizontal: 6 }}>
          {row.map((it) => {
            const has = owned.includes(it.id);
            const sel = selected === it.id;
            return (
              <Pressable
                key={it.id}
                accessibilityRole="button"
                accessibilityLabel={`${it.name}. ${has ? t('col.a11yOn') : t('col.a11yOff')}`}
                onPress={() => onSelect(it.id)}
                style={{ flex: 1, alignItems: 'center', borderRadius: r.md, backgroundColor: sel ? c.soft : 'transparent', paddingTop: 4 }}
              >
                <View style={{ opacity: has ? 1 : 0.18 }}>
                  <Art id={it.id} size={92} />
                </View>
              </Pressable>
            );
          })}
          {row.length < 3 && Array.from({ length: 3 - row.length }, (_, k) => <View key={k} style={{ flex: 1 }} />)}
        </View>
      ))}
    </View>
  );
}

export default function Colecao() {
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const { owned, brewerId, cupId, packId, sessions, articlesRead, practicesDone, missionsDone, missionBonusDays, missionsClaimed } = useApp();
  const equip = useApp((s) => s.equip);
  const params = useLocalSearchParams<{ tab?: string; t?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'beans' || params.tab === 'brewer' ? params.tab : 'cup');
  const [sel, setSel] = useState<{ cup: string; brewer: string; beans: string }>({ cup: cupId, brewer: brewerId, beans: packId });

  // Vindo do Início (tocar na xícara ou no pacote), abre na aba certa com o item em uso selecionado.
  // Ajusta o estado durante a renderização quando o pedido muda, em vez de usar um efeito.
  const wanted = params.tab === 'cup' || params.tab === 'beans' || params.tab === 'brewer' ? params.tab : null;
  const request = `${params.tab ?? ''}:${params.t ?? ''}`;
  const [seenRequest, setSeenRequest] = useState(request);
  if (seenRequest !== request) {
    setSeenRequest(request);
    if (wanted) {
      setTab(wanted);
      setSel({ cup: cupId, brewer: brewerId, beans: packId });
    }
  }

  const total = CATALOG.length;
  const have = owned.filter((id) => byId(id)).length;
  const finished = sessions.filter((s) => s.status === 'done').length;

  const detailBase = tab === 'feitos' ? undefined : byId(sel[tab]);
  const detail = detailBase ? localize(lang, detailBase) : undefined;
  const equipped = detail && (detail.kind === 'cup' ? cupId : detail.kind === 'beans' ? packId : brewerId) === detail.id;
  const hasDetail = detail && owned.includes(detail.id);

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

  return (
    <Screen>
      <Header title={t('col.title')} right={<Txt v="label" color="muted">{t('col.count', { a: have, b: total })}</Txt>} />
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'cup', label: t('col.tabShelf') },
          { value: 'brewer', label: t('col.tabBrewers') },
          { value: 'beans', label: t('col.tabPacks') },
          { value: 'feitos', label: t('col.tabAchievements') },
        ]}
      />

      {tab === 'feitos' ? (
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
          {recentMissions(missionsClaimed).length ? (
            recentMissions(missionsClaimed).map((m) => (
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
      ) : (
        <>
          <Shelf
            items={(tab === 'cup' ? cups() : tab === 'beans' ? packs() : brewers()).map((i) => localize(lang, i))}
            owned={owned}
            selected={sel[tab]}
            onSelect={(id) => {
              Haptics.selectionAsync().catch(() => {});
              setSel((s) => ({ ...s, [tab]: id }));
            }}
          />
          {detail && (
            <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <Art id={detail.id} size={72} />
              <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
                <Txt v="title">{detail.name}</Txt>
                <Txt v="small" color="muted">
                  {hasDetail ? detail.blurb : detail.streakUnlock ? t('col.unlockStreak', { n: detail.streakUnlock }) : t('col.availableGuide', { n: detail.price })}
                </Txt>
                {hasDetail && (
                  <Button label={equipped ? t('col.inUse') : t('col.use')} disabled={!!equipped} tone="dark" onPress={() => equip(detail.id)} style={{ paddingVertical: 9, marginTop: 6 }} />
                )}
              </View>
            </Card>
          )}
          <Txt v="small" color="muted">
            {t('col.footer', { n: finished })}
          </Txt>
        </>
      )}
    </Screen>
  );
}
