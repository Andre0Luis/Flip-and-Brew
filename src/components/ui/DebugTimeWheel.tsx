import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';
import { useFocusStore } from '@/store/useFocusStore';
import { useTheme } from '@/hooks/use-theme';
import * as Haptics from 'expo-haptics';

export function DebugTimeWheel() {
  const [expanded, setExpanded] = useState(false);
  const addTime = useFocusStore((s) => s.addTime);
  const theme = useTheme();

  const rotation = useSharedValue(0);
  const previousAngle = useSharedValue(0);

  const pendingDegrees = useRef(0);
  const isThrottling = useRef(false);

  const handleAddTime = (degrees: number) => {
    pendingDegrees.current += degrees;
    
    if (!isThrottling.current) {
      isThrottling.current = true;
      setTimeout(() => {
        if (pendingDegrees.current !== 0) {
          addTime(pendingDegrees.current * 120000);
          pendingDegrees.current = 0;
        }
        isThrottling.current = false;
      }, 100);
    }
  };

  const handleReset = () => {
    useFocusStore.setState({
      accumulatedTime: 0,
      plantStage: 'seed_soil',
      coins: 0,
    });
    rotation.value = 0;
  };

  const accumulatedDelta = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart((e) => {
      const angle = Math.atan2(e.y - 120, e.x - 120);
      previousAngle.value = angle;
      accumulatedDelta.value = 0;
    })
    .onUpdate((e) => {
      const angle = Math.atan2(e.y - 120, e.x - 120);
      let delta = angle - previousAngle.value;
      
      if (delta > Math.PI) delta -= 2 * Math.PI;
      else if (delta < -Math.PI) delta += 2 * Math.PI;

      rotation.value += delta;
      accumulatedDelta.value += delta;

      // Only dispatch to JS thread every ~5 degrees to prevent freezing
      if (Math.abs(accumulatedDelta.value) > (5 * Math.PI / 180)) {
        const degrees = accumulatedDelta.value * (180 / Math.PI);
        runOnJS(handleAddTime)(degrees);
        
        if (Math.abs(rotation.value % (Math.PI / 4)) < 0.2) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
        accumulatedDelta.value = 0;
      }

      previousAngle.value = angle;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}rad` }],
    };
  });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  const fabStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  if (!expanded) {
    return (
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.fab, { backgroundColor: theme.surface }, fabStyle]}>
          <Pressable onPress={() => setExpanded(true)} style={StyleSheet.absoluteFill}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <SymbolView name="timer" size={20} tintColor={theme.accent} />
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setExpanded(false)} />
      <View style={[styles.modal, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Acelerar Tempo</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: 'center' }]}>Horário para frente{'\n'}Anti-horário para voltar</Text>
        
        <GestureDetector gesture={pan}>
          <View style={styles.wheelContainer}>
            <Animated.View style={[styles.wheel, { borderColor: theme.accent, backgroundColor: theme.surface }, animatedStyle]}>
              <View style={[styles.knobMarker, { backgroundColor: theme.accent }]} />
              <View style={[styles.knobCenter, { backgroundColor: theme.bg }]} />
            </Animated.View>
          </View>
        </GestureDetector>
        
        <Pressable onPress={handleReset} style={[styles.resetButton, { backgroundColor: theme.surface }]}>
          <SymbolView name="arrow.triangle.2.circlepath" size={16} tintColor={theme.accent} />
          <Text style={[styles.resetText, { color: theme.accent }]}>Resetar Tudo</Text>
        </Pressable>

        <Pressable onPress={() => setExpanded(false)} style={[styles.closeBtn, { backgroundColor: theme.accent }]}>
          <Text style={[styles.closeText, { color: theme.bg }]}>Fechar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modal: {
    width: 320,
    padding: 32,
    borderRadius: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 40,
    fontWeight: '500',
  },
  wheelContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheel: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 12,
    borderStyle: 'dashed',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobMarker: {
    position: 'absolute',
    top: 8,
    left: 104,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  knobCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  resetButton: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  resetText: {
    fontWeight: '700',
    fontSize: 14,
  },
  closeBtn: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  closeText: {
    fontWeight: '800',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
