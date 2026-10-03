import React, { useEffect, useRef } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Art } from '@/art/Art';
import { LiveBrewer } from './BrewViz';
import { Icon } from './Icon';
import { itemText } from '@/data/catalog';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Cafeteiras que a pessoa tem, em carrossel: arrastar para o lado troca a que está em uso.
 * As setinhas mostram que dá para mudar e também funcionam como botões; os pontos mostram a posição.
 */
export function BrewerCarousel({ ids, current, size, onChange }: { ids: string[]; current: string; size: number; onChange: (id: string) => void }) {
  const { c } = useTheme();
  const { lang, t } = useI18n();
  const list = useRef<FlatList<string>>(null);
  const index = Math.max(0, ids.indexOf(current));
  const many = ids.length > 1;

  // Quando a cafeteira muda por fora (comprar, Coleção), o carrossel acompanha.
  useEffect(() => {
    list.current?.scrollToIndex({ index, animated: false });
  }, [index, size]);

  const go = (to: number) => {
    const next = Math.min(ids.length - 1, Math.max(0, to));
    if (next === index) return;
    Haptics.selectionAsync().catch(() => {});
    list.current?.scrollToIndex({ index: next, animated: true });
    onChange(ids[next]);
  };

  return (
    <View style={{ width: size, alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <FlatList
          ref={list}
          data={ids}
          horizontal
          pagingEnabled
          scrollEnabled={many}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(id) => id}
          getItemLayout={(_, i) => ({ length: size, offset: size * i, index: i })}
          initialScrollIndex={index}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / size);
            if (ids[i] && ids[i] !== current) {
              Haptics.selectionAsync().catch(() => {});
              onChange(ids[i]);
            }
          }}
          style={{ width: size, height: size }}
          renderItem={({ item }) => (
            <View style={{ width: size, height: size }} accessibilityLabel={itemText(lang, item).name}>
              {item === current ? <LiveBrewer id={item} size={size} /> : <Art id={item} size={size} />}
            </View>
          )}
        />
        {many && index > 0 && (
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.brewerPrev')} onPress={() => go(index - 1)} hitSlop={10} style={{ position: 'absolute', left: -6, top: size * 0.4, padding: 4, backgroundColor: `${c.surface}CC`, borderRadius: 999 }}>
            <Icon name="back" color={c.fg} />
          </Pressable>
        )}
        {many && index < ids.length - 1 && (
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.brewerNext')} onPress={() => go(index + 1)} hitSlop={10} style={{ position: 'absolute', right: -6, top: size * 0.4, padding: 4, backgroundColor: `${c.surface}CC`, borderRadius: 999, transform: [{ scaleX: -1 }] }}>
            <Icon name="back" color={c.fg} />
          </Pressable>
        )}
      </View>
      {many && (
        <View style={{ flexDirection: 'row', gap: 5, marginTop: 4, maxWidth: size, flexWrap: 'wrap', justifyContent: 'center' }} accessibilityElementsHidden>
          {ids.length <= 12 ? (
            ids.map((id, i) => <View key={id} style={{ width: i === index ? 14 : 5, height: 5, borderRadius: 3, backgroundColor: i === index ? c.fg : c.line }} />)
          ) : (
            <View style={{ height: 5 }} />
          )}
        </View>
      )}
    </View>
  );
}
