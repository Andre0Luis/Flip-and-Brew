import React from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { useFocusStore } from '@/store/useFocusStore';
import { STOIC_QUOTES } from '@/data/quotes';

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
  const { accumulatedTime, plantStage, flipOpens, flipCloses } = useFocusStore();

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
        <Image source={require('../../assets/plant_growing.png')} style={styles.bgImage1} blurRadius={80} />
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
              <Text style={styles.cardTitle}>Estágio da Planta</Text>
              <Text style={styles.gridValue}>{plantStage.toUpperCase()}</Text>
            </GlassView>

            <GlassView style={styles.gridCard}>
              <Text style={styles.cardTitle}>Status Mental</Text>
              <Text style={[styles.gridValue, { color: levelColor, fontSize: 16 }]}>
                {antifragilityLevel}
              </Text>
            </GlassView>
          </View>
          
          {/* Z Flip — disciplina física */}
          <GlassView style={styles.mainCard}>
            <Text style={styles.cardTitle}>Concha do Z Flip</Text>
            <View style={styles.flipStatsRow}>
              <View style={styles.flipStat}>
                <Text style={styles.flipStatValue}>{flipCloses}</Text>
                <Text style={styles.flipStatLabel}>Fechamentos</Text>
              </View>
              <View style={styles.flipDivider} />
              <View style={styles.flipStat}>
                <Text style={styles.flipStatValue}>{flipOpens}</Text>
                <Text style={styles.flipStatLabel}>Aberturas</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>Cada fechamento é um exercício de abstenção voluntária.</Text>
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
  bgImage1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 500,
    height: 500,
    opacity: 0.1,
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
  flipStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flipStat: {
    flex: 1,
    alignItems: 'center',
  },
  flipStatValue: {
    fontSize: 40,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  flipStatLabel: {
    fontSize: 12,
    color: '#8A8D93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  flipDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
