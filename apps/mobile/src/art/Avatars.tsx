import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import type { AvatarId } from '@/lib/avatar';

// Cinco desenhos simples, sem gradiente (então não precisam de ids próprios por instância).
const BROWN = '#6B3F22';
const CREAM = '#FCF8F1';
const GOLD = '#B8782E';
const INK = '#2B1A12';

const BACK: Record<AvatarId, string> = { bean: '#EBD7B6', cup: '#D8E2CD', dripper: '#F1DAC5', press: '#D3DDE6', moka: '#E8D0D0' };

export function AvatarArt({ id, size = 64 }: { id: AvatarId; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={32} fill={BACK[id]} />
      {id === 'bean' && (
        <>
          <Ellipse cx={32} cy={33} rx={13} ry={19} fill={BROWN} transform="rotate(35 32 33)" />
          <Path d="M23 22 C34 29 29 38 41 45" stroke={CREAM} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </>
      )}
      {id === 'cup' && (
        <>
          <Path d="M45 31h3a5 5 0 0 1 0 10h-4" stroke={BROWN} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M18 28h27v8a13.5 13.5 0 0 1-27 0z" fill={CREAM} stroke={BROWN} strokeWidth={2.4} strokeLinejoin="round" />
          <Ellipse cx={31.5} cy={28} rx={13.5} ry={3} fill={BROWN} />
          <Path d="M26 21q-3-4 0-8M33 21q-3-4 0-8" stroke={GOLD} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </>
      )}
      {id === 'dripper' && (
        <>
          <Path d="M15 21h34l-9 14H24z" fill={CREAM} stroke={BROWN} strokeWidth={2.4} strokeLinejoin="round" />
          <Path d="M22 38h20v10a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4z" fill="#8A5A35" />
          <Path d="M32 36v2" stroke={BROWN} strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}
      {id === 'press' && (
        <>
          <Rect x={20} y={23} width={24} height={30} rx={3} fill={CREAM} stroke={BROWN} strokeWidth={2.4} />
          <Rect x={21.2} y={35} width={21.6} height={16.8} rx={2} fill={BROWN} />
          <Path d="M32 15v21" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          <Circle cx={32} cy={13} r={3.4} fill={INK} />
        </>
      )}
      {id === 'moka' && (
        <>
          <Path d="M20 53l4-16h16l4 16z" fill="#9BA4A9" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M24 37l-2-13h20l-2 13z" fill="#C4CBCF" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <Rect x={22} y={18} width={20} height={6} rx={2.4} fill={INK} />
          <Path d="M42 27h6v13h-5" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Svg>
  );
}
