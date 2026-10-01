import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { LinearGradient, Rect, Defs, Stop, Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

/**
 * Retorna as cores do céu e da montanha baseadas na hora do dia
 */
function getThemeByHour(hour: number) {
  if (hour >= 5 && hour < 8) {
    // Amanhecer
    return {
      skyTop: '#1E3C72',
      skyBottom: '#FF758C',
      mountain: '#2C3E50',
      sun: '#FFE082',
      stars: false,
    };
  } else if (hour >= 8 && hour < 17) {
    // Dia
    return {
      skyTop: '#4CA1AF',
      skyBottom: '#C4E0E5',
      mountain: '#455A64',
      sun: '#FFF176',
      stars: false,
    };
  } else if (hour >= 17 && hour < 19) {
    // Entardecer
    return {
      skyTop: '#4A00E0',
      skyBottom: '#8E2DE2',
      mountain: '#1A237E',
      sun: '#FF7043',
      stars: false,
    };
  } else {
    // Noite
    return {
      skyTop: '#0F2027',
      skyBottom: '#203A43',
      mountain: '#000000',
      sun: '#E0E0E0', // Moon
      stars: true,
    };
  }
}

export function WindowView() {
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const theme = getThemeByHour(hour);
  const winWidth = width * 0.7;
  const winHeight = winWidth * 1.2;

  // Gerar estrelinhas fixas
  const stars = React.useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      x: Math.random() * winWidth,
      y: Math.random() * (winHeight * 0.6),
      r: Math.random() * 1.5 + 0.5,
    }));
  }, [winWidth, winHeight]);

  return (
    <View style={[styles.windowFrame, { width: winWidth, height: winHeight }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.skyTop} />
            <Stop offset="1" stopColor={theme.skyBottom} />
          </LinearGradient>
        </Defs>

        {/* Céu */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#skyGrad)" />

        {/* Estrelas */}
        {theme.stars && stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFF" opacity={0.6 + Math.random() * 0.4} />
        ))}

        {/* Sol / Lua */}
        <Circle cx={winWidth * 0.75} cy={winHeight * 0.3} r={winWidth * 0.15} fill={theme.sun} opacity={0.9} />

        {/* Montanhas */}
        <Path
          d={`M0,${winHeight} L0,${winHeight * 0.7} L${winWidth * 0.4},${winHeight * 0.5} L${winWidth * 0.7},${winHeight * 0.65} L${winWidth},${winHeight * 0.45} L${winWidth},${winHeight} Z`}
          fill={theme.mountain}
        />
        <Path
          d={`M0,${winHeight} L0,${winHeight * 0.8} L${winWidth * 0.25},${winHeight * 0.65} L${winWidth * 0.6},${winHeight * 0.8} L${winWidth},${winHeight * 0.6} L${winWidth},${winHeight} Z`}
          fill={theme.mountain}
          opacity={0.6}
        />
      </Svg>

      {/* Vidro e reflexo */}
      <View style={styles.glassReflection} />
      {/* Grades da Janela */}
      <View style={styles.mullionVertical} />
      <View style={styles.mullionHorizontal} />
    </View>
  );
}

const styles = StyleSheet.create({
  windowFrame: {
    position: 'absolute',
    bottom: 0, // Alinhado ao topo da prateleira
    backgroundColor: '#888',
    borderRadius: 200, // Topo arredondado como um arco
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 6,
    borderColor: '#4E342E', // Madeira escura
    overflow: 'hidden',
    zIndex: -10, // Muito atrás da planta
  },
  glassReflection: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ skewX: '-20deg' }],
    left: '20%',
    width: '30%',
  },
  mullionVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#4E342E',
    marginLeft: -2,
  },
  mullionHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#4E342E',
    marginTop: -2,
  },
});
