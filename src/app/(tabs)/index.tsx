import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, View, type LayoutChangeEvent } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Art } from '@/art/Art';
import { BrewerCarousel } from '@/components/BrewerCarousel';
import { CalibrateCard } from '@/components/CalibrateCard';
import { earnBonus } from '@/lib/earnings';
import { useTestTools } from '@/lib/admin';
import { CheckinCard } from '@/components/CheckinCard';
import { useSystemUsage } from '@/hooks/useSystemUsage';
import { summarizeUsage } from '@/lib/usage';
import { Icon } from '@/components/Icon';
import { Button, Card, CoinBadge, Screen, Txt } from '@/components/ui';
import { getQuotes, quoteOfDay } from '@/data/quotes';
import { brewers, byId, itemText } from '@/data/catalog';
import { formatDateLong, useI18n } from '@/i18n';
import { useApp } from '@/store/useApp';
import { streak, todayStats } from '@/lib/stats';
import { minutesLabel } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

export default function Inicio() {
  const router = useRouter();
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const { coins, owned, brewerId, cupId, packId, sessions, active, settings } = useApp();
  const equip = useApp((s) => s.equip);
  const start = useApp((s) => s.start);

  useFocusEffect(
    useCallback(() => {
      useApp.getState().setHomeFocused(true);
      return () => useApp.getState().setHomeFocused(false);
    }, []),
  );

  // A frase do dia vem primeiro e as outras seguem no carrossel.
  const quotes = useMemo(() => {
    const first = quoteOfDay(lang);
    return [first, ...getQuotes(lang).filter((q) => q.id !== first.id).slice(0, 4)];
  }, [lang]);
  const [w, setW] = useState(0);
  const [page, setPage] = useState(0);
  // Todas as frases ganham a altura da mais alta, para o carrossel não deixar vazio embaixo.
  const [cardH, setCardH] = useState(150);
  const list = useRef<FlatList>(null);

  const today = todayStats(sessions);
  const usage = useSystemUsage(1);
  const unlocksToday = usage.permitted ? summarizeUsage(usage.days).today?.unlocks : undefined;
  const days = streak(sessions);
  const brewer = byId(brewerId);
  const ownedBrewers = brewers().filter((b) => owned.includes(b.id));
  const testTools = useTestTools();
  const minutes = settings.quickBrew && testTools ? 1 : brewer?.brewMinutes ?? 45;

  const combo = earnBonus(brewerId, cupId, packId);
  // A bancada usa a largura da tela: xícara e pacote maiores nos lados, cafeteira no centro.
  const [stageW, setStageW] = useState(0);
  const side = Math.round(Math.min(116, Math.max(84, (stageW || 340) * 0.31)));
  const center = Math.round(Math.min(200, Math.max(150, (stageW || 340) - 2 * side + 36)));

  const begin = () => {
    if (active || start()) router.push('/brew');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
        <CoinBadge coins={coins} onPress={() => router.push('/guia')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Txt v="small" color="muted">
            {t('home.streak')} <Txt v="small" style={{ fontFamily: fonts.bodyBold }}>{days} {t('unit.day', { n: days })}</Txt>
          </Txt>
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.settingsA11y')} onPress={() => router.push('/ajustes')} hitSlop={10}>
            <Icon name="gear" color={c.muted} />
          </Pressable>
        </View>
      </View>

      <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && (
          <FlatList
            ref={list}
            data={quotes}
            horizontal
            pagingEnabled
            style={{ flexGrow: 0 }}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(q) => q.id}
            getItemLayout={(_, i) => ({ length: w, offset: w * i, index: i })}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / w))}
            renderItem={({ item, index }) => (
              <Pressable accessibilityRole="button" accessibilityLabel={t('home.readContext', { text: item.text })} onPress={() => router.push({ pathname: '/frase/[id]', params: { id: item.id } })} onLayout={(e) => {
                  // Lê a altura antes: dentro do atualizador o evento já foi liberado e nativeEvent vem nulo.
                  const h = Math.ceil(e.nativeEvent.layout.height);
                  setCardH((prev) => Math.max(prev, h));
                }} style={{ width: w }}>
                <Card inverse style={{ gap: 12, minHeight: cardH, justifyContent: 'space-between' }}>
                  <Txt v="label" color="bg" style={{ opacity: 0.7 }}>
                    {index === 0 ? t('home.quoteOfDay', { date: formatDateLong(lang, new Date()) }) : t('home.moreToday')}
                  </Txt>
                  <Txt v="quote" color="bg">
                    {item.text}
                  </Txt>
                  <Txt v="label" color="bg" style={{ opacity: 0.7 }}>
                    {item.author} · {item.source}
                  </Txt>
                </Card>
              </Pressable>
            )}
          />
        )}
        <View style={{ flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: 10 }}>
          {quotes.map((q, i) => (
            <View key={q.id} style={{ width: i === page ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? c.fg : c.line }} />
          ))}
        </View>
      </View>

      <View style={{ alignItems: 'center', paddingVertical: 4 }}>
        {/* Bancada: a xícara de um lado, a cafeteira no centro e o pacote de café do outro. Tocar leva à Coleção. */}
        <View onLayout={(e) => setStageW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', alignSelf: 'stretch' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.cupA11y', { name: itemText(lang, cupId).name })} onPress={() => router.push('/colecao')} hitSlop={8} style={{ width: side, marginRight: -10 }}>
            <Art id={cupId} size={side} fill={1} />
          </Pressable>
          <BrewerCarousel ids={ownedBrewers.map((b) => b.id)} current={brewerId} size={center} onChange={equip} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.packA11y', { name: itemText(lang, packId).name })} onPress={() => router.push('/colecao')} hitSlop={8} style={{ width: side, marginLeft: -10 }}>
            <Art id={packId} size={side} />
          </Pressable>
        </View>
        <Txt v="small" color="muted">
          {t('home.brewerInfo', { name: itemText(lang, brewerId).name, min: minutes })}
        </Txt>
        {combo.total > 0 && (
          <Txt v="label" color="accent">
            {t('home.combo', { n: combo.total })}
          </Txt>
        )}
      </View>

      <Txt v="small" color="muted" style={{ textAlign: 'center' }}>
        {t('home.todayPrefix')} <Txt v="small" style={{ fontFamily: fonts.bodyBold }}>{minutesLabel(today.minutes)} {t('home.offlineSuffix')}</Txt> · {today.cups} {t('unit.cup', { n: today.cups })}{unlocksToday !== undefined ? ` · ${unlocksToday} ${t('unit.unlock', { n: unlocksToday })}` : ''}
      </Txt>


      <View style={{ gap: 8 }}>
        <Button label={active ? t('home.continueBrew') : t('home.start')} onPress={begin} />
        {settings.autoStart && !active && (
          <Txt v="small" color="muted" style={{ textAlign: 'center' }}>
            {t('home.flipHint')}
          </Txt>
        )}
      </View>

      <CheckinCard />

      <CalibrateCard />
    </Screen>
  );
}
