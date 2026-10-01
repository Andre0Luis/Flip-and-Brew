import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { useFocusStore } from '@/store/useFocusStore';
import RevenueCatService from '@/services/RevenueCat';
import { CoinPurchaseModal } from '@/components/ui/CoinPurchaseModal';
import { BrewerSvg } from '@/components/art/BrewerSvg';
import { CupSvg } from '@/components/art/CupSvg';
import { Pot } from '@/components/art/Pot';

const SHOP_ITEMS = {
  pots: [
    { id: 'clay', name: 'Vaso de Argila', price: 0 },
    { id: 'glass', name: 'Vaso de Vidro', price: 15 },
    { id: 'ceramic', name: 'Vaso de Cerâmica', price: 30 },
    { id: 'wood', name: 'Vaso de Madeira', price: 40 },
    { id: 'concrete', name: 'Vaso de Concreto', price: 50 },
    { id: 'marble', name: 'Vaso de Mármore', price: 75 },
    { id: 'basket', name: 'Cesto de Vime', price: 80 },
    { id: 'geometric', name: 'Vaso Geométrico', price: 100 },
    { id: 'gold', name: 'Vaso de Ouro', price: 500 },
    { id: 'neon', name: 'Vaso Neon', price: 1000 },
  ],
  brewers: [
    { id: 'v60', name: 'V60 Pour Over', price: 0 },
    { id: 'french_press', name: 'Prensa Francesa', price: 20 },
    { id: 'aeropress', name: 'Aeropress', price: 40 },
    { id: 'moka', name: 'Moka Italiana', price: 60 },
    { id: 'chemex', name: 'Chemex', price: 80 },
    { id: 'espresso', name: 'Máquina Espresso', price: 100 },
    { id: 'clever_dripper', name: 'Clever Dripper', price: 120 },
    { id: 'cold_drip', name: 'Torre Cold Drip', price: 150 },
    { id: 'percolator', name: 'Percolador Clássico', price: 200 },
    { id: 'syphon', name: 'Cafeteira Sifão', price: 300 },
  ],
  cups: [
    { id: 'cup_1', name: 'Caneca Clássica', price: 0 },
    { id: 'cup_2', name: 'Xícara Espresso', price: 10 },
    { id: 'cup_3', name: 'Caneca Alta', price: 25 },
    { id: 'cup_4', name: 'Copo Latte', price: 40 },
    { id: 'cup_5', name: 'Copo To-Go', price: 60 },
    { id: 'cup_6', name: 'Caneca Enamel', price: 80 },
    { id: 'cup_7', name: 'Xícara Demitasse', price: 100 },
    { id: 'cup_8', name: 'Tumbler Térmico', price: 120 },
    { id: 'cup_9', name: 'Mason Jar', price: 150 },
    { id: 'cup_10', name: 'Finjan Turca', price: 200 },
  ]
};

export default function ShopScreen() {
  const { coins, unlockedBrewers, unlockedPots, unlockedCups, buyItem, buyCoins } = useFocusStore();
  const [isCoinModalVisible, setCoinModalVisible] = useState(false);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (isCoinModalVisible) {
      loadOfferings();
    }
  }, [isCoinModalVisible]);

  const loadOfferings = async () => {
    setIsLoadingOffers(true);
    const currentOffering = await RevenueCatService.getOfferings();
    if (currentOffering && currentOffering.availablePackages) {
      setOfferings(currentOffering.availablePackages);
    } else {
      setOfferings([]); // Will show fallback/warning
    }
    setIsLoadingOffers(false);
  };

  const handleBuy = (type: 'brewer'|'pot'|'cup', id: string, price: number, name: string) => {
    if (coins < price) {
      Alert.alert("Saldo Insuficiente", `Você precisa de ${price} moedas para comprar ${name}.`);
      return;
    }
    
    Alert.alert(
      "Confirmar Compra",
      `Deseja gastar ${price} moedas em ${name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Comprar", onPress: () => {
            buyItem(type, id, price);
          } 
        }
      ]
    );
  };

  const handlePurchaseIAP = async (pkg: any) => {
    setIsPurchasing(true);
    const purchaseResult = await RevenueCatService.purchasePackage(pkg);
    setIsPurchasing(false);
    
    if (purchaseResult) {
      // In a real app, you would read the purchased entitlement or extract the amount from the product identifier.
      // E.g. if product identifier is "flipandbrew_25_coins"
      const coinAmountMatch = pkg.product.identifier.match(/\d+/);
      const coinsToAdd = coinAmountMatch ? parseInt(coinAmountMatch[0], 10) : 1000;
      
      buyCoins(coinsToAdd);
      setCoinModalVisible(false);
      Alert.alert("Sucesso!", `Você comprou ${coinsToAdd} moedas.`);
    } else {
      Alert.alert("Erro", "A compra foi cancelada ou falhou.");
    }
  };

  const renderItemCard = (type: 'brewer'|'pot'|'cup', item: any) => {
    const isUnlocked = type === 'brewer' ? unlockedBrewers.includes(item.id) 
                     : type === 'pot' ? unlockedPots.includes(item.id) 
                     : unlockedCups.includes(item.id);

    return (
      <TouchableOpacity 
        key={item.id} 
        activeOpacity={isUnlocked ? 1 : 0.8}
        onPress={() => {
          if (!isUnlocked) {
            handleBuy(type, item.id, item.price, item.name);
          }
        }}
      >
        <GlassView style={styles.itemCard}>
          <View style={styles.itemImageContainer}>
            {type === 'brewer' && <BrewerSvg variant={item.id} size={50} />}
            {type === 'cup' && <CupSvg variant={item.id} size={40} />}
            {type === 'pot' && <Pot variant={item.id as any} size={50} />}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.desc && <Text style={styles.itemDesc}>{item.desc}</Text>}
            {isUnlocked ? (
              <Text style={styles.statusText}>Adquirido</Text>
            ) : (
              <View style={[styles.priceTag, item.desc ? { marginTop: 12 } : undefined]}>
                <Image source={require('../../assets/coin.png')} style={styles.smallCoin} />
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
            )}
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.background}>
        <Image source={require('../../assets/coin.png')} style={styles.bgImage1} blurRadius={40} />
        <Image source={require('../../assets/v60_maker.png')} style={styles.bgImage2} blurRadius={60} />
      </View>
      
      <View style={styles.economyHeader}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => setCoinModalVisible(true)}>
          <GlassView style={styles.coinBadge}>
            <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
            <Text style={styles.coinText}>{coins} +</Text>
          </GlassView>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>A Lojinha</Text>
          <Text style={styles.subtitle}>Gaste seu tempo investido aqui.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vasos</Text>
          {SHOP_ITEMS.pots.map(item => renderItemCard('pot', item))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cafeteiras</Text>
          {SHOP_ITEMS.brewers.map(item => renderItemCard('brewer', item))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xícaras</Text>
          {SHOP_ITEMS.cups.map(item => renderItemCard('cup', item))}
        </View>
      </ScrollView>

      <CoinPurchaseModal visible={isCoinModalVisible} onClose={() => setCoinModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F1115' },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0F1115' },
  bgImage1: { position: 'absolute', top: 50, right: -50, width: 250, height: 250, opacity: 0.15 },
  bgImage2: { position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, opacity: 0.1 },
  economyHeader: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  coinBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E5A93C', backgroundColor: 'rgba(20, 20, 20, 0.8)' },
  coinIcon: { width: 20, height: 20, marginRight: 8 },
  coinText: { color: '#E5A93C', fontWeight: 'bold', fontSize: 16 },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 100 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { fontSize: 15, color: '#8A8D93', marginTop: 6 },
  section: { marginBottom: 32, gap: 12 },
  sectionTitle: { color: '#8A8D93', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, marginLeft: 4 },
  itemCard: { flexDirection: 'row', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.03)', overflow: 'hidden', alignItems: 'center' },
  itemCardSelected: { borderColor: '#E5A93C', backgroundColor: 'rgba(229, 169, 60, 0.1)' },
  itemImageContainer: { width: 64, height: 64, marginRight: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemInfo: { flex: 1 },
  itemName: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  itemDesc: { color: '#A0AAB5', fontSize: 14, lineHeight: 20 },
  statusText: { color: '#E5A93C', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
  priceTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  smallCoin: { width: 14, height: 14, marginRight: 6 },
  priceText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { padding: 24, paddingBottom: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { marginBottom: 24, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#8A8D93' },
  packagesContainer: { gap: 16, marginBottom: 32 },
  packageCardWrapper: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  packageCardGlass: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  packageLeft: { flexDirection: 'row', alignItems: 'center' },
  largeCoin: { width: 32, height: 32, marginRight: 12 },
  packageAmount: { fontSize: 20, fontWeight: '800', color: '#E5A93C' },
  packagePriceBtnGlass: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, overflow: 'hidden' },
  packagePriceText: { color: '#0F1115', fontWeight: '800', fontSize: 16 },
  modalCloseBtnWrapper: { borderRadius: 20, overflow: 'hidden' },
  modalCloseBtnGlass: { padding: 16, alignItems: 'center' },
  modalCloseText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  warningBox: { backgroundColor: 'rgba(255,0,0,0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,0,0,0.3)', marginBottom: 32 },
  warningText: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  warningSubText: { color: '#FFB8B8', fontSize: 14, lineHeight: 20 },
});
