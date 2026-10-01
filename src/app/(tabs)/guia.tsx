import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Art, Coin } from '@/art/Art';
import { Icon } from '@/components/Icon';
import { Bar, Button, Card, CoinBadge, Header, Screen, Segmented, Txt } from '@/components/ui';
import { brewers, cups, type CatalogItem } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { streak } from '@/lib/stats';
import { number } from '@/lib/format';
import { buyCoinPack, loadCoinPacks, purchasesConfigured, type CoinPack } from '@/lib/purchases';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

type Tab = 'brewer' | 'cup';

export default function Guia() {
  const { c, r } = useTheme();
  const { coins, owned, brewerId, cupId, sessions } = useApp();
  const buy = useApp((s) => s.buy);
  const equip = useApp((s) => s.equip);
  const addCoins = useApp((s) => s.addCoins);
  const [tab, setTab] = useState<Tab>('brewer');
  const [pending, setPending] = useState<CatalogItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [packs, setPacks] = useState<CoinPack[]>([]);
  const days = streak(sessions);

  useEffect(() => {
    if (purchasesConfigured) loadCoinPacks().then(setPacks);
  }, []);

  const items = tab === 'brewer' ? brewers() : cups();
  const equipped = tab === 'brewer' ? brewerId : cupId;

  const onItem = (item: CatalogItem) => {
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
      setMessage(`${pending.name} está na sua prateleira e já em uso.`);
    } else if (res === 'poor') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setMessage(`Faltam ${number(pending.price - coins)} moedas para ${pending.name}.`);
    }
    setPending(null);
  };

  return (
    <Screen>
      <Header title="Guia" right={<CoinBadge coins={coins} />} />
      <Segmented<Tab>
        value={tab}
        onChange={(t) => {
          setTab(t);
          setPending(null);
        }}
        options={[
          { value: 'brewer', label: 'Cafeteiras' },
          { value: 'cup', label: 'Xícaras' },
        ]}
      />

      {pending && (
        <Card inverse style={{ gap: 10 }}>
          <Txt v="title" color="bg">
            Comprar {pending.name}?
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Coin size={22} />
            <Txt v="num" color="bg">
              {number(pending.price)}
            </Txt>
            <Txt v="small" color="bg" style={{ opacity: 0.7 }}>
              você tem {number(coins)}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label="Comprar" onPress={confirm} style={{ flex: 1 }} />
            <Button label="Cancelar" tone="quietOnDark" onPress={() => setPending(null)} style={{ flex: 1 }} />
          </View>
        </Card>
      )}
      {message && (
        <Txt v="small" color="accent" accessibilityLiveRegion="polite" style={{ fontFamily: fonts.bodySemi }}>
          {message}
        </Txt>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {items.map((item) => {
          const has = owned.includes(item.id);
          const inUse = has && equipped === item.id;
          const locked = !!item.streakUnlock && !has;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}. ${inUse ? 'Em uso' : has ? 'Sua, toque para usar' : locked ? `Libera com ${item.streakUnlock} dias de sequência` : `${item.price} moedas`}`}
              onPress={() => onItem(item)}
              style={{ width: '47.5%', flexGrow: 1, backgroundColor: c.surface, borderRadius: r.lg, borderWidth: inUse ? 2 : 1, borderColor: inUse ? c.accent : c.line, padding: 10, gap: 8 }}
            >
              <View style={{ backgroundColor: c.soft, borderRadius: r.md, alignItems: 'center', paddingVertical: 6, opacity: locked ? 0.55 : 1 }}>
                <Art id={item.id} size={96} />
              </View>
              <Txt v="title" style={{ fontSize: 15, lineHeight: 20 }} numberOfLines={1}>
                {item.name}
              </Txt>
              <Txt v="small" color="muted" numberOfLines={2} style={{ minHeight: 36 }}>
                {item.blurb}
              </Txt>
              {locked ? (
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name="lock" size={14} color={c.muted} />
                    <Txt v="label" color="muted">
                      {days}/{item.streakUnlock} dias
                    </Txt>
                  </View>
                  <Bar pct={days / (item.streakUnlock ?? 1)} />
                </View>
              ) : inUse ? (
                <Txt v="label" color="accent">
                  Em uso
                </Txt>
              ) : has ? (
                <Txt v="label" color="muted">
                  Sua · usar
                </Txt>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Coin size={18} />
                  <Txt v="num" style={{ fontSize: 15 }}>
                    {number(item.price)}
                  </Txt>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Card style={{ gap: 8 }}>
        <Txt v="title">Moedas</Txt>
        {purchasesConfigured ? (
          packs.length ? (
            <View style={{ gap: 8 }}>
              {packs.map((p) => (
                <Button
                  key={p.id}
                  tone="quiet"
                  label={`${number(p.coins)} moedas · ${p.price}`}
                  onPress={async () => {
                    const got = await buyCoinPack(p);
                    if (got) {
                      addCoins(got);
                      setMessage(`${number(got)} moedas adicionadas.`);
                    } else setMessage('A compra foi cancelada ou não foi concluída.');
                  }}
                />
              ))}
            </View>
          ) : (
            <Txt v="small" color="muted">
              Não foi possível carregar os pacotes agora. Tente de novo mais tarde.
            </Txt>
          )
        ) : (
          <Txt v="small" color="muted">
            Você ganha moedas ficando offline: uma por minuto, mais um bônus de 20% quando o copo enche. A compra de moedas ainda não está ativa nesta versão.
          </Txt>
        )}
      </Card>
    </Screen>
  );
}
