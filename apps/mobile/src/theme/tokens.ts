export type Palette = {
  bg: string;
  surface: string;
  soft: string;
  fg: string;
  muted: string;
  line: string;
  accent: string;
  accentFg: string;
  good: string;
  bad: string;
  cupFill: string;
  wall: string;
};

export const light: Palette = {
  bg: '#F6EEE1',
  surface: '#FCF8F1',
  soft: '#EFE3CF',
  fg: '#2B1A12',
  muted: '#7A6455',
  line: '#E3D3BA',
  accent: '#B8782E',
  accentFg: '#FFF8EA',
  good: '#5F7A4B',
  bad: '#A5432F',
  cupFill: '#6B3F22',
  wall: '#D8C3A5',
};

export const dark: Palette = {
  bg: '#1B120D',
  surface: '#271A12',
  soft: '#32231A',
  fg: '#F2E7D5',
  muted: '#AD967F',
  line: '#3D2B1F',
  accent: '#E0B25E',
  accentFg: '#1B120D',
  good: '#8FB076',
  bad: '#D9806A',
  cupFill: '#C48A52',
  wall: '#3A281C',
};

export const fonts = {
  display: 'YoungSerif_400Regular',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
