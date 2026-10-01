import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useFocusStore } from '@/store/useFocusStore';
import { useTheme } from '@/hooks/use-theme';
import { Pot } from '@/components/art/Pot';
import { BrewerSvg } from '@/components/art/BrewerSvg';
import { CupSvg } from '@/components/art/CupSvg';

type ItemType = 'pot' | 'brewer' | 'cup';
interface CatalogItem {
  id: string;
  name: string;
  price: number;
  image?: any;
}

const CATALOG: Record<ItemType, CatalogItem[]> = {
  pot: [
    { id: 'clay', name: 'Barro', price: 0 },
    { id: 'glass', name: 'Vidro', price: 600 },
    { id: 'ceramic', name: 'Cerâmica', price: 900 },
    { id: 'wood', name: 'Madeira', price: 0 },
    { id: 'concrete', name: 'Concreto', price: 0 },
    { id: 'marble', name: 'Mármore', price: 0 },
    { id: 'basket', name: 'Vime', price: 0 },
    { id: 'geometric', name: 'Geométrico', price: 0 },
    { id: 'gold', name: 'Ouro', price: 0 },
    { id: 'neon', name: 'Neon', price: 0 },
  ],
  brewer: [
    { id: 'v60', name: 'V60', price: 0 },
    { id: 'french_press', name: 'Prensa', price: 0 },
    { id: 'aeropress', name: 'Aeropress', price: 0 },
    { id: 'moka', name: 'Moka', price: 0 },
    { id: 'chemex', name: 'Chemex', price: 0 },
    { id: 'espresso', name: 'Espresso', price: 0 },
    { id: 'clever_dripper', name: 'Clever', price: 0 },
    { id: 'cold_drip', name: 'Cold Drip', price: 0 },
    { id: 'percolator', name: 'Percolador', price: 0 },
    { id: 'syphon', name: 'Sifão', price: 0 },
  ],
  cup: [
    { id: 'cup_1', name: 'Clássica', price: 0 },
    { id: 'cup_2', name: 'Espresso', price: 0 },
    { id: 'cup_3', name: 'Alta', price: 0 },
    { id: 'cup_4', name: 'Latte', price: 0 },
    { id: 'cup_5', name: 'To-Go', price: 0 },
    { id: 'cup_6', name: 'Enamel', price: 0 },
    { id: 'cup_7', name: 'Demitasse', price: 0 },
    { id: 'cup_8', name: 'Térmico', price: 0 },
    { id: 'cup_9', name: 'Mason Jar', price: 0 },
    { id: 'cup_10', name: 'Finjan', price: 0 },
  ],
};

const SECTIONS: { type: ItemType; label: string }[] = [
  { type: 'pot', label: 'Vasos' },
  { type: 'brewer', label: 'Cafeteiras' },
  { type: 'cup', label: 'Xícaras' },
];

export default function CollectionScreen() {
  const theme = useTheme();
  const store = useFocusStore();
  const { coins, unlockedPots, unlockedBrewers, unlockedCups, selectedPot, selectedBrewer, selectedCup, buyItem, selectItem } = store;

  const unlockedFor = (type: ItemType) =>
    type === 'pot' ? unlockedPots : type === 'brewer' ? unlockedBrewers : unlockedCups;
  const selectedFor = (type: ItemType) =>
    type === 'pot' ? selectedPot : type === 'brewer' ? selectedBrewer : selectedCup;

  const onTap = (type: ItemType, item: CatalogItem) => {
    Haptics.selectionAsync();
    selectItem(type, item.id);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Coleção</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {SECTIONS.map(({ type, label }) => {
            const ownedItems = CATALOG[type].filter(item => unlockedFor(type).includes(item.id));
            if (ownedItems.length === 0) return null;
            return (
              <View key={type} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{label}</Text>
                <View style={styles.grid}>
                  {ownedItems.map((item) => {
                    const selected = selectedFor(type) === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => onTap(type, item)}
                        style={[
                          styles.card,
                          { backgroundColor: theme.surface, borderColor: selected ? theme.accent : theme.border },
                          selected && { borderWidth: 2 },
                        ]}
                      >
                        <View style={styles.preview}>
                          {type === 'pot' && <Pot variant={item.id as any} size={72} />}
                          {type === 'brewer' && <BrewerSvg variant={item.id} size={50} />}
                          {type === 'cup' && <CupSvg variant={item.id} size={40} />}
                        </View>
                        <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.itemTag, { color: selected ? theme.accent : theme.textSecondary }]}>
                          {selected ? 'Equipado' : 'Equipar'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 30, fontWeight: '800' },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  coinIcon: { width: 18, height: 18, marginRight: 6 },
  coinText: { fontWeight: 'bold', fontSize: 15 },

  scroll: { paddingBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '31%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  preview: { height: 72, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  previewImg: { width: 56, height: 56 },
  itemName: { fontSize: 13, fontWeight: '700' },
  itemTag: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 3 },
  priceCoin: { width: 12, height: 12 },
});
