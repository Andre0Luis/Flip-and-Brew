import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GLASS = 'M34 18H86L81 102Q80.5 107 76 107H44Q39.5 107 39 102Z';
const TOP = 22;
const BOTTOM = 106;

/** Copo de vidro que enche conforme `progress` (0 a 1), com vapor. */
export function FillingCup({ progress, size = 160, steam = true }: { progress: number; size?: number; steam?: boolean }) {
  const p = useSharedValue(progress);
  useEffect(() => {
    p.value = withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, p]);
  const level = useAnimatedProps(() => {
    const h = (BOTTOM - TOP) * p.value;
    return { y: BOTTOM - h, height: h + 2 };
  });
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <ClipPath id="glassClip">
            <Path d={GLASS} />
          </ClipPath>
          <LinearGradient id="fcCof" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0" stopColor="#7A4527" />
            <Stop offset="0.5" stopColor="#4B2815" />
            <Stop offset="1" stopColor="#2C170C" />
          </LinearGradient>
          <LinearGradient id="fcGlass" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.7} />
            <Stop offset="0.3" stopColor="#FFFFFF" stopOpacity={0.15} />
            <Stop offset="0.8" stopColor="#FFFFFF" stopOpacity={0.1} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.5} />
          </LinearGradient>
          <LinearGradient id="fcShadow" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0" stopColor="#2B1A12" stopOpacity={0} />
            <Stop offset="0.5" stopColor="#2B1A12" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#2B1A12" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Ellipse cx={60} cy={110} rx={32} ry={5} fill="url(#fcShadow)" />
        <Path d={GLASS} fill="#FFFFFF" fillOpacity={0.1} />
        <AnimatedRect x={30} width={60} fill="url(#fcCof)" clipPath="url(#glassClip)" animatedProps={level} />
        <Path d={GLASS} fill="url(#fcGlass)" stroke="#A89886" strokeWidth={1.4} />
        <Ellipse cx={60} cy={18} rx={26} ry={3.6} fill="none" stroke="#A89886" strokeWidth={1.4} />
        <Path d="M42 28L45 96" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      </Svg>
      {steam && <Steam size={size} />}
    </View>
  );
}

function Wisp({ left, delay, size }: { left: number; delay: number; size: number }) {
  const { c } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    const id = setTimeout(() => {
      t.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }), -1, false);
    }, delay);
    return () => clearTimeout(id);
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.5 ? t.value * 1.4 : (1 - t.value) * 1.4,
    transform: [{ translateY: -t.value * size * 0.16 }, { scaleX: 1 + t.value * 0.4 }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -size * 0.1, left, width: 4, height: size * 0.16, borderRadius: 2, backgroundColor: c.muted }, style]} />
  );
}

export function Steam({ size }: { size: number }) {
  return (
    <>
      <Wisp left={size * 0.4} delay={0} size={size} />
      <Wisp left={size * 0.5} delay={900} size={size} />
      <Wisp left={size * 0.6} delay={1800} size={size} />
    </>
  );
}

/** Anel de progresso. */
export function Ring({ progress, size = 230, stroke = 10, children }: { progress: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const { c } = useTheme();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = useSharedValue(progress);
  useEffect(() => {
    p.value = withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - p.value) }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.soft} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={c.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          animatedProps={props}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      {children}
    </View>
  );
}
