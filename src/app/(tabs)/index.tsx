import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, View, type LayoutChangeEvent } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Art } from '@/art/Art';
import { CalibrateCard } from '@/components/CalibrateCard';
import { Icon } from '@/components/Icon';
import { Button, Card, Chip, CoinBadge, Screen, Txt } from '@/components/ui';
import { QUOTES, quoteOfDay } from '@/data/quotes';
import { brewers, byId } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { streak, todayStats } from '@/lib/stats';
import { dateLong, minutesLabel } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

export default function Inicio() {
  const router = useRouter();
  const { c } = useTheme();
  const { coins, owned, brewerId, sessions, active, settings } = useApp();
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
    const first = quoteOfDay();
    return [first, ...QUOTES.filter((q) => q.id !== first.id).slice(0, 4)];
  }, []);
  const [w, setW] = useState(0);
  const [page, setPage] = useState(0);
  // Todas as frases ganham a altura da mais alta, para o carrossel não deixar vazio embaixo.
  const [cardH, setCardH] = useState(150);
  const list = useRef<FlatList>(null);

  const today = todayStats(sessions);
  const days = streak(sessions);
  const brewer = byId(brewerId);
  const ownedBrewers = brewers().filter((b) => owned.includes(b.id));
  const minutes = settings.quickBrew ? 1 : brewer?.brewMinutes ?? 45;

  const begin = () => {
    if (active || start()) router.push('/brew');
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
        <CoinBadge coins={coins} onPress={() => router.push('/guia')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Txt v="small" color="muted">
            sequência <Txt v="small" style={{ fontFamily: fonts.bodyBold }}>{days} {days === 1 ? 'dia' : 'dias'}</Txt>
          </Txt>
          <Pressable accessibilityRole="button" accessibilityLabel="Ajustes" onPress={() => router.push('/ajustes')} hitSlop={10}>
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
              <Pressable accessibilityRole="button" accessibilityLabel={`Ler contexto: ${item.text}`} onPress={() => router.push({ pathname: '/frase/[id]', params: { id: item.id } })} onLayout={(e) => setCardH((h) => Math.max(h, Math.ceil(e.nativeEvent.layout.height)))} style={{ width: w }}>
                <Card inverse style={{ gap: 12, minHeight: cardH, justifyContent: 'space-between' }}>
                  <Txt v="label" color="bg" style={{ opacity: 0.7 }}>
                    {index === 0 ? `Frase do dia · ${dateLong(new Date())}` : 'Mais uma para hoje'}
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
        <Art id={brewerId} size={230} />
        <Txt v="small" color="muted">
          {brewer?.name} · enche em {minutes} min
        </Txt>
      </View>

      <Txt v="small" color="muted" style={{ textAlign: 'center' }}>
        hoje <Txt v="small" style={{ fontFamily: fonts.bodyBold }}>{minutesLabel(today.minutes)} offline</Txt> · {today.cups} {today.cups === 1 ? 'copo' : 'copos'}
      </Txt>

      {ownedBrewers.length > 1 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {ownedBrewers.map((b) => (
            <Chip key={b.id} label={b.name} on={b.id === brewerId} onPress={() => equip(b.id)} />
          ))}
        </View>
      )}

      <View style={{ gap: 8 }}>
        <Button label={active ? 'Voltar ao copo em andamento' : 'Começar a passar'} onPress={begin} />
        {settings.autoStart && !active && (
          <Txt v="small" color="muted" style={{ textAlign: 'center' }}>
            Ou só vire o celular para baixo
          </Txt>
        )}
      </View>

      <CalibrateCard />
    </Screen>
  );
}
