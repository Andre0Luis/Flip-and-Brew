import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { useFocusStore } from '@/store/useFocusStore';
import RevenueCatService from '@/services/RevenueCat';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CoinPurchaseModal({ visible, onClose }: Props) {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const buyCoins = useFocusStore(s => s.buyCoins);

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    setIsLoadingOffers(true);
    const currentOffering = await RevenueCatService.getOfferings();
    if (currentOffering && currentOffering.availablePackages) {
      setOfferings(currentOffering.availablePackages);
    } else {
      setOfferings([]); 
    }
    setIsLoadingOffers(false);
  };

  const handlePurchaseIAP = async (pkg: any) => {
    setIsPurchasing(true);
    const purchaseResult = await RevenueCatService.purchasePackage(pkg);
    setIsPurchasing(false);
    
    if (purchaseResult) {
      const coinAmountMatch = pkg.product.identifier.match(/\d+/);
      const coinsToAdd = coinAmountMatch ? parseInt(coinAmountMatch[0], 10) : 1000;
      
      buyCoins(coinsToAdd);
      onClose();
      Alert.alert("Sucesso!", `Você comprou ${coinsToAdd} moedas.`);
    } else {
      Alert.alert("Erro", "A compra foi cancelada ou falhou.");
    }
  };

  const handleWatchAd = () => {
    setIsPurchasing(true);
    // Simula o tempo assistindo a um vídeo
    setTimeout(() => {
      setIsPurchasing(false);
      buyCoins(50);
      onClose();
      Alert.alert("Recompensa!", "Obrigado por assistir! Você ganhou 50 moedas.");
    }, 2000);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comprar Moedas</Text>
            <Text style={styles.modalSubtitle}>Via App Store / Google Play</Text>
          </View>
          
          {isLoadingOffers ? (
            <ActivityIndicator size="large" color="#E5A93C" style={{ marginVertical: 40 }} />
          ) : offerings.length === 0 ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠️ Chaves do RevenueCat Ausentes.</Text>
              <Text style={styles.warningSubText}>Você precisa inserir suas chaves da Apple e Google no arquivo src/services/RevenueCat.ts e criar os produtos na loja.</Text>
            </View>
          ) : (
            <View style={styles.packagesContainer}>
              <TouchableOpacity 
                style={[styles.packageCardWrapper, { borderColor: '#4ADE80' }]} 
                activeOpacity={0.8}
                onPress={handleWatchAd}
                disabled={isPurchasing}
              >
                <View style={styles.packageCardSolid}>
                  <View style={styles.packageLeft}>
                    <Image source={require('../../../assets/coin.png')} style={styles.largeCoin} />
                    <View>
                      <Text style={styles.packageAmount}>50</Text>
                      <Text style={{ color: '#4ADE80', fontSize: 12, fontWeight: '600' }}>Grátis</Text>
                    </View>
                  </View>
                  <View style={[styles.packagePriceBtnSolid, { backgroundColor: '#4ADE80' }]}>
                    <Text style={[styles.packagePriceText, { color: '#000' }]}>Assistir Vídeo</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {offerings.map(pkg => {
                const priceString = pkg.product.priceString;
                const coinMatch = pkg.product.identifier.match(/\d+/);
                const coinsAmount = coinMatch ? coinMatch[0] : 'Pacote';

                return (
                  <TouchableOpacity 
                    key={pkg.identifier} 
                    style={styles.packageCardWrapper} 
                    activeOpacity={0.8}
                    onPress={() => handlePurchaseIAP(pkg)}
                    disabled={isPurchasing}
                  >
                    <View style={styles.packageCardSolid}>
                      <View style={styles.packageLeft}>
                        <Image source={require('../../../assets/coin.png')} style={styles.largeCoin} />
                        <Text style={styles.packageAmount}>{coinsAmount}</Text>
                      </View>
                      <View style={styles.packagePriceBtnSolid}>
                        <Text style={styles.packagePriceText}>{priceString}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.modalCloseBtnWrapper} onPress={onClose}>
            <View style={styles.modalCloseBtnSolid}>
              <Text style={styles.modalCloseText}>Fechar Loja</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { padding: 24, paddingBottom: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: '#0F1115' },
  modalHeader: { marginBottom: 24, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#8A8D93' },
  packagesContainer: { gap: 16, marginBottom: 32 },
  packageCardWrapper: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: '#1C1E24' },
  packageCardSolid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  packageLeft: { flexDirection: 'row', alignItems: 'center' },
  largeCoin: { width: 32, height: 32, marginRight: 12 },
  packageAmount: { fontSize: 20, fontWeight: '800', color: '#E5A93C' },
  packagePriceBtnSolid: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E5A93C' },
  packagePriceText: { color: '#0F1115', fontWeight: '800', fontSize: 13 },
  modalCloseBtnWrapper: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#1C1E24', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalCloseBtnSolid: { padding: 16, alignItems: 'center' },
  modalCloseText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  warningBox: { backgroundColor: 'rgba(255,0,0,0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,0,0,0.3)', marginBottom: 32 },
  warningText: { color: '#FF6B6B', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  warningSubText: { color: '#FFB8B8', fontSize: 14, lineHeight: 20 },
});
