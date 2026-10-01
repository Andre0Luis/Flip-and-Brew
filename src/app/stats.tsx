import React from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { useFocusStore } from '@/store/useFocusStore';
import { STOIC_QUOTES } from '@/data/quotes';
import { getDailyUnlockCount, hasUsageStatsPermission, isUsageStatsAvailable } from '../../modules/usage-stats';

function formatTotalTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function StatsScreen() {
  const { accumulatedTime } = useFocusStore();
  const unlocksToday = isUsageStatsAvailable && hasUsageStatsPermission() ? getDailyUnlockCount() : null;

  const totalTimeStr = formatTotalTime(accumulatedTime);
  
  // Antifragility score logic based on user's concept
  let antifragilityLevel = 'Fragile';
  let levelColor = '#EF4444'; // Red
  if (accumulatedTime > 60000 * 60 * 2) {
    antifragilityLevel = 'Antifragile Mind';
    levelColor = '#4ADE80'; // Green
  } else if (accumulatedTime > 60000 * 30) {
    antifragilityLevel = 'Building Resistance';
    levelColor = '#FBBF24'; // Yellow
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.background}>
        <Image source={require('../../assets/cup_4.png')} style={styles.bgImage2} blurRadius={80} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bem-Estar</Text>
          <Text style={styles.subtitle}>Sua jornada de antifragilidade.</Text>
        </View>

        <View style={styles.dashboard}>
          {/* Main Metric */}
          <GlassView style={styles.mainCard}>
            <Text style={styles.cardTitle}>Tempo Focado</Text>
            <Text style={styles.mainValue}>{totalTimeStr}</Text>
            <Text style={styles.cardDesc}>Tempo investido no mundo real.</Text>
          </GlassView>

          {/* Philosophy Section */}
          <View style={styles.philosophyContainer}>
            <Text style={styles.sectionTitle}>Filosofia Estoica</Text>
            <FlatList
              data={STOIC_QUOTES}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              renderItem={({ item }) => (
                <View style={{ width: Dimensions.get('window').width - 48 }}>
                  <GlassView style={styles.philosophyCardCarousel}>
                    <Text style={{
                      fontSize: 16,
                      color: '#E2E8F0',
                      lineHeight: 24,
                      fontStyle: 'italic',
                      marginBottom: 16,
                    }}>
                      "{item.text}"
                    </Text>
                    <Text style={styles.author}>— {item.author}</Text>
                  </GlassView>
                </View>
              )}
            />
          </View>

          {/* Grid Metrics */}
          <View style={styles.grid}>
            <GlassView style={styles.gridCard}>
              <Text style={styles.cardTitle}>Status Mental</Text>
              <Text style={[styles.gridValue, { color: levelColor, fontSize: 16 }]}>
                {antifragilityLevel}
              </Text>
            </GlassView>
          </View>
          
          {/* Desbloqueios — disciplina física */}
          <GlassView style={styles.mainCard}>
            <Text style={styles.cardTitle}>Desbloqueios hoje</Text>
            <Text style={styles.mainValue}>{unlocksToday ?? '—'}</Text>
            <Text style={styles.cardDesc}>
              {unlocksToday === null
                ? 'Autorize o Acesso ao Uso na tela inicial para ver quantas vezes você pegou o celular.'
                : 'Cada vez que você deixa o celular de lado é um exercício de abstenção voluntária.'}
            </Text>
          </GlassView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F1115',
  },
  bgImage2: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 400,
    height: 400,
    opacity: 0.1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A8D93',
    marginTop: 6,
  },
  dashboard: {
    gap: 16,
  },
  mainCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 13,
    color: '#8A8D93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 12,
  },
  mainValue: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#A0AAB5',
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  gridValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  philosophyContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#8A8D93',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  philosophyCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  author: {
    fontSize: 14,
    color: '#8A8D93',
    fontWeight: '600',
    textAlign: 'right',
  },
  carouselContainer: {
    // removed padding to snap correctly
  },
  philosophyCardCarousel: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
  },
});
