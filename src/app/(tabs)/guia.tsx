import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Art, Coin } from '@/art/Art';
import { Icon } from '@/components/Icon';
import { Bar, Button, Card, CoinBadge, Header, Screen, Segmented, Txt } from '@/components/ui';
import { brewers, COLLECTIONS, cups, localize, packs as coffeePacks, type LocalizedItem } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { streak } from '@/lib/stats';
import { formatNumber, useI18n } from '@/i18n';
import { discountFor, priceOf } from '@/lib/pricing';
import { buyCoinPack, loadCoinPacks, purchasesConfigured, type CoinPack } from '@/lib/purchases';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

type Tab = 'brewer' | 'cup' | 'beans';

export default function Guia() {
  const { c, r } = useTheme();
  const { lang, t } = useI18n();
  const num = (n: number) => formatNumber(lang, n);
  const { coins, owned, brewerId, cupId, packId, sessions, checkins, settings } = useApp();
  const buy = useApp((s) => s.buy);
  const equip = useApp((s) => s.equip);
  const addCoins = useApp((s) => s.addCoins);
  const [tab, setTab] = useState<Tab>('brewer');
  const [pending, setPending] = useState<LocalizedItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [packs, setPacks] = useState<CoinPack[]>([]);
  const days = streak(sessions);
  const disc = discountFor({ checkins, sessions, goalMin: settings.goalMin });
  const priceNow = (item: LocalizedItem) => priceOf(item, disc.percent);

  useEffect(() => {
    if (purchasesConfigured) loadCoinPacks().then(setPacks);
  }, []);

  const items = (tab === 'brewer' ? brewers() : tab === 'beans' ? coffeePacks() : cups()).map((i) => localize(lang, i));
  const equipped = tab === 'brewer' ? brewerId : tab === 'beans' ? packId : cupId;

  const onItem = (item: LocalizedItem) => {
    setMessage(null);
    if (owned.includes(item.id)) {
      equip(item.id);
      Haptics.selectionAsync().catch(() => {});
      setPending(null);
    } else if (!item.streakUnlock) setPending(item);
  };

  const confirm = () => {
    if (!pending) return;
    const res = buy(pending.id);
    if (res === 'ok') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      equip(pending.id);
      setMessage(t('guide.bought', { name: pending.name }));
    } else if (res === 'poor') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setMessage(t('guide.missing', { n: num(priceNow(pending) - coins), name: pending.name }));
    }
    setPending(null);
  };

  const renderGrid = (list: LocalizedItem[]) => (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {list.map((item) => {
          const has = owned.includes(item.id);
          const inUse = has && equipped === item.id;
          const locked = !!item.streakUnlock && !has;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}. ${inUse ? t('guide.a11yInUse') : has ? t('guide.a11yOwned') : locked ? t('guide.a11yLocked', { n: item.streakUnlock ?? 0 }) : t('guide.a11yPrice', { n: num(priceNow(item)) })}`}
              onPress={() => onItem(item)}
              style={{ width: '47.5%', backgroundColor: c.surface, borderRadius: r.lg, borderWidth: inUse ? 2 : 1, borderColor: inUse ? c.accent : c.line, padding: 10, gap: 8 }}
            >
              <View style={{ backgroundColor: c.soft, borderRadius: r.md, alignItems: 'center', paddingVertical: 6, opacity: locked ? 0.55 : 1 }}>
                <Art id={item.id} size={96} />
              </View>
              <Txt v="title" style={{ fontSize: 15, lineHeight: 20 }} numberOfLines={1}>
                {item.name}
              </Txt>
              <Txt v="small" color="muted" numberOfLines={3} style={{ minHeight: 54 }}>
                {item.blurb}
              </Txt>
              {!!item.earn && (
                <Txt v="label" color="accent">
                  {t('guide.earn', { n: item.earn })}
                </Txt>
              )}
              {locked ? (
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name="lock" size={14} color={c.muted} />
                    <Txt v="label" color="muted">
                      {t('guide.streakProgress', { d: days, n: item.streakUnlock ?? 0 })}
                    </Txt>
                  </View>
                  <Bar pct={days / (item.streakUnlock ?? 1)} />
                </View>
              ) : inUse ? (
                <Txt v="label" color="accent">
                  {t('guide.inUse')}
                </Txt>
              ) : has ? (
                <Txt v="label" color="muted">
                  {t('guide.ownedUse')}
                </Txt>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Coin size={18} />
                  <Txt v="num" style={{ fontSize: 15 }}>
                    {num(priceNow(item))}
                  </Txt>
                  {priceNow(item) < item.price && (
                    <>
                      <Txt v="small" color="muted" style={{ textDecorationLine: 'line-through' }}>
                        {num(item.price)}
                      </Txt>
                      <Txt v="label" color="accent">
                        {t('guide.discountOff', { n: disc.percent })}
                      </Txt>
                    </>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
  );

  return (
    <Screen>
      <Header title={t('guide.title')} right={<CoinBadge coins={coins} />} />
      <Segmented<Tab>
        value={tab}
        onChange={(t) => {
          setTab(t);
          setPending(null);
        }}
        options={[
          { value: 'brewer', label: t('guide.brewers') },
          { value: 'cup', label: t('guide.cups') },
          { value: 'beans', label: t('guide.packs') },
        ]}
      />

      {pending && (
        <Card inverse style={{ gap: 10 }}>
          <Txt v="title" color="bg">
            {t('guide.buyQ', { name: pending.name })}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Coin size={22} />
            <Txt v="num" color="bg">
              {num(priceNow(pending))}
            </Txt>
            {priceNow(pending) < pending.price && (
              <Txt v="small" color="bg" style={{ opacity: 0.7, textDecorationLine: 'line-through' }}>
                {num(pending.price)}
              </Txt>
            )}
            <Txt v="small" color="bg" style={{ opacity: 0.7 }}>
              {t('guide.haveCoins', { n: num(coins) })}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label={t('guide.buy')} onPress={confirm} style={{ flex: 1 }} />
            <Button label={t('guide.cancel')} tone="quietOnDark" onPress={() => setPending(null)} style={{ flex: 1 }} />
          </View>
        </Card>
      )}
      {message && (
        <Txt v="small" color="accent" accessibilityLiveRegion="polite" style={{ fontFamily: fonts.bodySemi }}>
          {message}
        </Txt>
      )}

      {tab === 'brewer' && (
        <Card style={{ gap: 6 }}>
          <Txt v="title" style={{ fontSize: 15 }}>
            {t('guide.discountTitle', { pct: disc.percent })}
          </Txt>
          <Txt v="small" color="muted">
            {t('guide.discountBody', { a: disc.fromCheckins, d: disc.streak, b: disc.fromOffline, share: Math.round(disc.share * 100) })}
          </Txt>
          <Txt v="small" color="muted">
            {t('guide.discountHint')}
          </Txt>
        </Card>
      )}

      {renderGrid(items.filter((i) => !i.collection))}

      {tab === 'beans' && (
        <Txt v="small" color="muted">
          {t('guide.packsNote')}
        </Txt>
      )}

      {COLLECTIONS.map((col) =>
        items.some((i) => i.collection === col) ? (
          <View key={col} style={{ gap: 10 }}>
            <View style={{ gap: 2 }}>
              <Txt v="title">{t(`guide.${col}Title` as 'guide.stoicTitle')}</Txt>
              <Txt v="small" color="muted">
                {t(`guide.${col}Body` as 'guide.stoicBody')}
              </Txt>
            </View>
            {renderGrid(items.filter((i) => i.collection === col))}
          </View>
        ) : null,
      )}

      <Card style={{ gap: 8 }}>
        <Txt v="title">{t('guide.coinsTitle')}</Txt>
        {purchasesConfigured ? (
          packs.length ? (
            <View style={{ gap: 8 }}>
              {packs.map((p) => (
                <Button
                  key={p.id}
                  tone="quiet"
                  label={t('guide.packLine', { n: num(p.coins), price: p.price })}
                  onPress={async () => {
                    const got = await buyCoinPack(p);
                    if (got) {
                      addCoins(got);
                      setMessage(t('guide.packAdded', { n: num(got) }));
                    } else setMessage(t('guide.packCancel'));
                  }}
                />
              ))}
            </View>
          ) : (
            <Txt v="small" color="muted">
              {t('guide.packsFail')}
            </Txt>
          )
        ) : (
          <Txt v="small" color="muted">
            {t('guide.coinsInfo')}
          </Txt>
        )}
      </Card>
    </Screen>
  );
}
