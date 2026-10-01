import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useArtColors } from '@/hooks/use-theme';

/**
 * Vapor em SVG — três fios ondulados. A animação (subida/opacidade)
 * é feita pelo componente pai via Reanimated, envolvendo este SVG.
 */
export interface SteamProps {
  size?: number;
}

export function Steam({ size = 60 }: SteamProps) {
  const c = useArtColors();
  const w = size;
  const h = size * (90 / 60);

  return (
    <Svg width={w} height={h} viewBox="0 0 60 90">
      <Path
        d="M20,88 C12,72 28,64 20,48 C12,32 28,24 20,8"
        stroke={c.steam}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M40,88 C48,70 32,62 40,46 C48,30 32,22 40,6"
        stroke={c.steam}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M30,86 C24,70 36,60 30,44 C24,28 36,18 30,2"
        stroke={c.steam}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
    </Svg>
  );
}

export default Steam;
