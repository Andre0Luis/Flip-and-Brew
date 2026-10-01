import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, Pressable, Dimensions, AppState, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { GlassView } from 'expo-glass-effect';
import Svg, { Defs, LinearGradient, Stop, Rect, Ellipse } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { useFocusStore } from '@/store/useFocusStore';
import { useTheme } from '@/hooks/use-theme';
import { PlantRenderer } from '@/components/art/PlantRenderer';
import { Pot, type PotVariant } from '@/components/art/Pot';
import { Steam } from '@/components/art/Steam';
import { BrewerSvg } from '@/components/art/BrewerSvg';
import { CupSvg } from '@/components/art/CupSvg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DebugTimeWheel } from '@/components/ui/DebugTimeWheel';
import { CoinPurchaseModal } from '@/components/ui/CoinPurchaseModal';
import { hasUsageStatsPermission, requestUsageStatsPermission, getDailyUnlockCount, isUsageStatsAvailable } from '../../modules/usage-stats';
import { BREWER_IMAGES, CUP_IMAGES } from '@/constants/assets';
import { WindowView } from '@/components/ui/WindowView';

const { width, height } = Dimensions.get('window');

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const POT_SIZE = Math.min(width * 0.35, 140);
const PLANT_SIZE = POT_SIZE * 1.6;

const STOIC_QUOTES = [
  "\"A riqueza consiste não em ter grandes posses, mas em ter poucas necessidades.\" — Epicteto",
  "\"Você tem poder sobre a sua mente, não sobre os eventos externos. Perceba isso e você encontrará força.\" — Marco Aurélio",
  "\"Sofremos mais na imaginação do que na realidade.\" — Sêneca",
  "\"Não é o que acontece com você, mas como você reage a isso que importa.\" — Epicteto",
  "\"Não gaste mais tempo discutindo sobre o que um bom homem deve ser. Seja um.\" — Marco Aurélio",
  "\"A verdadeira felicidade é desfrutar o presente, sem dependência ansiosa do futuro.\" — Sêneca",
  "\"O que impede a ação favorece a ação. O que fica no caminho torna-se o caminho.\" — Marco Aurélio"
];

export default function HomeScreen() {
  const {
    isFocusing,
    startTime,
    accumulatedTime,
    plantStage,
    health,
    selectedPot,
    selectedCup,
    selectedBrewer,
    coins,
    flipOpens,
    flipCloses,
    syncBackgroundTime,
    syncDailyFlips,
    harvestCoffee,
    waterPlant,
    selectedSeed,
    checkDailyLogin,
  } = useFocusStore();
  const theme = useTheme();
  const [displayTime, setDisplayTime] = useState(accumulatedTime);
  const [isCoinModalVisible, setCoinModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [dailyQuote, setDailyQuote] = useState(STOIC_QUOTES[0]);

  useEffect(() => {
    // Escolhe uma frase aleatória
    setDailyQuote(STOIC_QUOTES[Math.floor(Math.random() * STOIC_QUOTES.length)]);

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        syncBackgroundTime();
        if (checkDailyLogin()) {
          Alert.alert('Bem-vindo de volta!', 'Você ganhou 25 moedas de Login Diário! 💰');
        }
        
        if (Platform.OS === 'android') {
          if (hasUsageStatsPermission()) {
            setHasPermission(true);
            syncDailyFlips(getDailyUnlockCount());
          } else {
            setHasPermission(false);
          }
        }
      }
    };

    handleAppStateChange('active');
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Animações
  const sway = useSharedValue(0);
  const growth = useSharedValue(1);
  const coinPulse = useSharedValue(1);
  const steamY = useSharedValue(0);
  const steamOpacity = useSharedValue(0);
  const prevCoins = useRef(coins);

  // Balanço orgânico da planta — pivô na base do vaso
  useEffect(() => {
    const amplitude = isFocusing ? 2.4 : 1.4;
    const duration = isFocusing ? 2200 : 3200;
    sway.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(amplitude, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [isFocusing]);

  // "Brota" um pop quando o estágio da planta muda
  useEffect(() => {
    growth.value = withSequence(
      withTiming(1.12, { duration: 200, easing: Easing.out(Easing.ease) }),
      withSpring(1, { damping: 6, stiffness: 120 }),
    );
  }, [plantStage]);

  // Vapor só durante o foco (sinal de "cultivando")
  useEffect(() => {
    if (isFocusing) {
      steamY.value = withRepeat(withTiming(-22, { duration: 2800, easing: Easing.linear }), -1, false);
      steamOpacity.value = withRepeat(
        withSequence(withTiming(0.8, { duration: 1400 }), withTiming(0, { duration: 1400 })),
        -1,
        false,
      );
    } else {
      steamOpacity.value = withTiming(0, { duration: 400 });
    }
  }, [isFocusing]);

  // Pulso ao ganhar moedas
  useEffect(() => {
    if (coins > prevCoins.current) {
      coinPulse.value = withSequence(withTiming(1.18, { duration: 150 }), withSpring(1));
    }
    prevCoins.current = coins;
  }, [coins]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isFocusing && startTime) {
      interval = setInterval(() => setDisplayTime(accumulatedTime + (Date.now() - startTime)), 1000);
    } else {
      setDisplayTime(accumulatedTime);
    }
    return () => clearInterval(interval);
  }, [isFocusing, startTime, accumulatedTime]);

  const plantStyle = useAnimatedStyle(() => ({
    transformOrigin: 'bottom center',
    transform: [{ rotate: `${sway.value}deg` }, { scale: growth.value }],
  }));
  const coinStyle = useAnimatedStyle(() => ({ transform: [{ scale: coinPulse.value }] }));
  const steamStyle = useAnimatedStyle(() => ({
    opacity: steamOpacity.value,
    transform: [{ translateY: steamY.value }],
  }));

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Fundo: gradiente quente + spotlight atrás da planta */}
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.bgGradientTop} />
            <Stop offset="1" stopColor={theme.bgGradientBottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#bg)" />
        <Ellipse cx={width / 2} cy={height * 0.4} rx={width * 0.45} ry={width * 0.45} fill={theme.accent} opacity={0.08} />
      </Svg>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Estufa</Text>
          <Animated.View style={coinStyle}>
            <Pressable onPress={() => setCoinModalVisible(true)}>
              <GlassView style={[styles.coinBadge, { borderColor: theme.accent, backgroundColor: theme.surfaceGlass }]}>
                <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
                <Text style={[styles.coinText, { color: theme.accent }]}>{coins}</Text>
              </GlassView>
            </Pressable>
          </Animated.View>
        </View>

        {/* HERO: prateleiras (estufa) */}
        <View style={styles.heroArea}>
          {/* Prateleira Superior (Vaso e Planta) */}
          <View style={styles.topShelf}>
            <View style={styles.heroStack}>
              <WindowView />

              <Animated.View style={[styles.steam, steamStyle]} pointerEvents="none">
                <Steam size={POT_SIZE * 0.32} />
              </Animated.View>

              <View style={styles.potWrap}>
                <Pot variant={selectedPot as PotVariant} size={POT_SIZE} />
              </View>

              <Animated.View style={[styles.plantWrap, plantStyle]}>
                <Pressable onPress={() => {
                  if (plantStage === 'harvestable') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    if (selectedSeed === 'coffee') {
                      harvestCoffee();
                    } else {
                      waterPlant();
                    }
                  } else if (plantStage === 'wilting') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    waterPlant();
                  }
                }}>
                  <PlantRenderer seed={selectedSeed} stage={plantStage} health={health} size={PLANT_SIZE} />
                </Pressable>
              </Animated.View>
            </View>
            <View style={styles.shelfBoard} />
            <View style={styles.shelfShadow} />
          </View>

          {/* Prateleira Inferior (Cafeteira e Xícara) */}
          <View style={styles.bottomShelf}>
            <View style={styles.bottomShelfItems}>
              {selectedBrewer && (
                <View style={styles.brewerImage}>
                  <BrewerSvg variant={selectedBrewer} size={100} />
                </View>
              )}
              {selectedCup && (
                <View style={styles.cupImage}>
                  <CupSvg variant={selectedCup} size={70} />
                </View>
              )}
            </View>
            <View style={styles.shelfBoard} />
            <View style={styles.shelfShadow} />
          </View>
        </View>

        {/* Timer + ação */}
        <View style={styles.controls}>
          {!hasPermission && isUsageStatsAvailable && Platform.OS === 'android' && (
            <Pressable 
              onPress={() => requestUsageStatsPermission()}
              style={[styles.permissionBanner, { backgroundColor: theme.surfaceGlass, borderColor: theme.border }]}
            >
              <Text style={[styles.permissionText, { color: theme.textPrimary }]}>
                Permita o Acesso ao Uso para contarmos seus flips diários nativamente. Toque aqui para autorizar.
              </Text>
            </Pressable>
          )}
          <View style={styles.quoteContainer}>
            <Text style={[styles.quoteText, { color: theme.textSecondary }]}>{dailyQuote}</Text>
          </View>

          <GlassView style={[styles.timerGlass, { borderColor: theme.border, backgroundColor: theme.surfaceGlass }]}>
            <Text style={[styles.timerText, { color: theme.textPrimary }]}>{formatTime(displayTime)}</Text>
            <Text style={[styles.timerSub, { color: theme.textSecondary }]}>
              Tempo Cultivado
            </Text>
          </GlassView>
        </View>
      </SafeAreaView>

      {/* Debug Tool */}
      <DebugTimeWheel />

      {/* Coin Store Modal */}
      <CoinPurchaseModal visible={isCoinModalVisible} onClose={() => setCoinModalVisible(false)} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: 0.5 },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  coinIcon: { width: 20, height: 20, marginRight: 8 },
  coinText: { fontWeight: 'bold', fontSize: 16 },

  heroArea: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  topShelf: { alignItems: 'center', marginBottom: -80, zIndex: 2 },
  bottomShelf: { alignItems: 'center', width: '100%', zIndex: 1 },
  bottomShelfItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: -8, // make items sit exactly on the board
  },
  shelfBoard: {
    width: width * 0.85,
    height: 12,
    backgroundColor: '#2A2D35',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3A3D45',
  },
  shelfShadow: {
    width: width * 0.75,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroStack: {
    width: POT_SIZE * 1.6,
    height: PLANT_SIZE * 1.25,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  potWrap: { position: 'absolute', bottom: 0, alignItems: 'center' },
  plantWrap: { position: 'absolute', bottom: POT_SIZE * 0.5, alignItems: 'center' },
  steam: { position: 'absolute', bottom: POT_SIZE * 0.55, zIndex: -1 },
  brewerImage: { width: 170, height: 220, opacity: 0.9, justifyContent: 'flex-end', alignItems: 'center', transform: [{ translateY: -2 }] },
  cupImage: { width: 120, height: 120, justifyContent: 'flex-end', alignItems: 'center', transform: [{ translateY: 12 }] },

  controls: { paddingBottom: 24, gap: 14, zIndex: 10 },
  permissionBanner: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  permissionText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
  quoteContainer: {
    paddingHorizontal: 24,
    paddingVertical: 4,
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  quoteText: {
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timerGlass: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 32,
    borderWidth: 1,
  },
  timerText: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerSub: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
});
