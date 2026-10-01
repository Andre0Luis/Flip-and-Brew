import React from 'react';
import Svg, { G, Path, Ellipse, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { useArtColors } from '@/hooks/use-theme';

export type PotVariant = 'clay' | 'glass' | 'ceramic' | 'wood' | 'concrete' | 'marble' | 'neon' | 'gold' | 'geometric' | 'basket';

export interface PotProps {
  variant?: PotVariant;
  size?: number;
}

export function Pot({ variant = 'clay', size = 200 }: PotProps) {
  const c = useArtColors();
  const w = size;
  const h = size * (150 / 200);

  const getPalette = () => {
    switch(variant) {
      case 'glass': return { body: '#81D4FA', bodyLight: '#E1F5FE', rim: '#81D4FA', opacity: 0.6 };
      case 'ceramic': return { body: '#FAFAFA', bodyLight: '#FFFFFF', rim: '#FAFAFA', opacity: 1 };
      case 'wood': return { body: '#5D4037', bodyLight: '#8D6E63', rim: '#4E342E', opacity: 1 };
      case 'concrete': return { body: '#9E9E9E', bodyLight: '#BDBDBD', rim: '#757575', opacity: 1 };
      case 'marble': return { body: '#EEEEEE', bodyLight: '#FFFFFF', rim: '#E0E0E0', opacity: 1 };
      case 'neon': return { body: '#D500F9', bodyLight: '#FF4081', rim: '#00E5FF', opacity: 0.9 };
      case 'gold': return { body: '#FBC02D', bodyLight: '#FFF59D', rim: '#F57F17', opacity: 1 };
      case 'geometric': return { body: '#37474F', bodyLight: '#546E7A', rim: '#263238', opacity: 1 };
      case 'basket': return { body: '#FFB300', bodyLight: '#FFE082', rim: '#FF8F00', opacity: 1 };
      case 'clay':
      default: return { body: c.potClay, bodyLight: c.potClayLight, rim: c.potClayLight, opacity: 1 };
    }
  };

  const palette = getPalette();

  const renderShape = () => {
    if (variant === 'geometric') {
      return (
        <G>
          <Polygon points="30,44 170,44 140,140 60,140" fill={`url(#potBody-${variant})`} stroke={c.outline} strokeWidth={2} strokeLinejoin="round" />
          <Polygon points="30,44 100,140 170,44" fill="none" stroke={palette.bodyLight} strokeWidth={1} opacity={0.5} />
          <Polygon points="70,44 100,140 130,44" fill="none" stroke={palette.bodyLight} strokeWidth={1} opacity={0.5} />
          <Polygon points="30,44 170,44 100,90" fill="none" stroke={palette.bodyLight} strokeWidth={1} opacity={0.5} />
        </G>
      );
    }
    if (variant === 'basket') {
      return (
        <G>
          <Path d="M44,46 L58,140 Q60,148 70,148 L130,148 Q140,148 142,140 L156,46 Z" fill={`url(#potBody-${variant})`} stroke={c.outline} strokeWidth={2} strokeLinejoin="round" />
          {/* Wicker texture lines */}
          {Array.from({length: 6}).map((_, i) => (
            <Path key={`h-${i}`} d={`M${46 + i*2},${60 + i*15} L${154 - i*2},${60 + i*15}`} stroke="#FF8F00" strokeWidth="2" fill="none" />
          ))}
          {Array.from({length: 8}).map((_, i) => (
            <Path key={`v-${i}`} d={`M${55 + i*13},46 L${70 + i*8},148`} stroke="#FF8F00" strokeWidth="2" fill="none" />
          ))}
        </G>
      );
    }
    return (
      <Path
        d="M44,46 L58,140 Q60,148 70,148 L130,148 Q140,148 142,140 L156,46 Z"
        fill={`url(#potBody-${variant})`}
        stroke={c.outline}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    );
  };

  return (
    <Svg width={w} height={h} viewBox="0 0 200 150">
      <Defs>
        <LinearGradient id={`potBody-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={palette.bodyLight} stopOpacity={palette.opacity} />
          <Stop offset="0.5" stopColor={palette.body} stopOpacity={palette.opacity} />
          <Stop offset="1" stopColor={c.trunkShade} stopOpacity={palette.opacity * (variant === 'neon' ? 1 : 0.6)} />
        </LinearGradient>
      </Defs>

      {renderShape()}

      {/* Marble veins */}
      {variant === 'marble' && (
        <G opacity={0.4}>
          <Path d="M60,60 Q80,70 70,100 T90,130" stroke="#9E9E9E" strokeWidth="2" fill="none" />
          <Path d="M120,50 Q100,80 130,110 T140,140" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
        </G>
      )}

      {/* Rim (borda superior) */}
      <Ellipse cx={100} cy={44} rx={variant === 'geometric' ? 70 : 58} ry={13} fill={palette.rim} fillOpacity={palette.opacity} stroke={c.outline} strokeWidth={2} />

      {/* Terra dentro do vaso */}
      <Ellipse cx={100} cy={44} rx={variant === 'geometric' ? 60 : 48} ry={9} fill={c.soil} />
      <Ellipse cx={92} cy={42} rx={10} ry={3} fill={c.soilLight} opacity={0.6} />

      {/* Brilho lateral */}
      {variant !== 'glass' && variant !== 'geometric' && variant !== 'basket' && (
        <Path d="M62,56 L72,132" stroke={palette.bodyLight} strokeWidth={4} strokeLinecap="round" opacity={0.35} fill="none" />
      )}
    </Svg>
  );
}

export default Pot;
