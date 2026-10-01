/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Flip & Brew — paleta "café artesanal".
 * light = papel kraft / dia; dark = espresso / noite.
 * Tokens semânticos (nunca cores soltas nas telas).
 * As chaves `text`, `background`, `backgroundElement`, `backgroundSelected`,
 * `textSecondary` são mantidas por compatibilidade com themed-text/themed-view.
 */
export const Colors = {
  light: {
    // compat (template)
    text: '#2A1E16',
    background: '#F4ECE0',
    backgroundElement: '#EADFCE',
    backgroundSelected: '#E0D2BB',
    textSecondary: '#8A7866',
    // semânticos café
    bg: '#F4ECE0', // papel kraft claro
    bgGradientTop: '#FBF5EA',
    bgGradientBottom: '#E8DAC4',
    surface: '#FBF6EE',
    surfaceGlass: 'rgba(255, 250, 242, 0.55)',
    textPrimary: '#2A1E16', // espresso quase preto
    accent: '#C77D34', // âmbar / caramelo
    accentSoft: '#E2A765',
    leaf: '#5E8B4C', // verde-folha
    terracotta: '#B5613C',
    seedBrown: '#7A5236',
    cream: '#F2E3CC',
    danger: '#C2452D',
    border: 'rgba(42, 30, 22, 0.12)',
    shelf: '#D8C4A6',
  },
  dark: {
    // compat (template)
    text: '#F3E9DA',
    background: '#1A1310',
    backgroundElement: '#241A14',
    backgroundSelected: '#32241B',
    textSecondary: '#B6A48F',
    // semânticos café
    bg: '#1A1310', // espresso profundo (não preto puro)
    bgGradientTop: '#241913',
    bgGradientBottom: '#120C09',
    surface: '#241A14',
    surfaceGlass: 'rgba(36, 26, 20, 0.55)',
    textPrimary: '#F3E9DA', // creme
    accent: '#E3A24C', // âmbar mais quente p/ noite
    accentSoft: '#C8843A',
    leaf: '#7CA86A', // verde-folha clareado p/ contraste
    terracotta: '#CC744C',
    seedBrown: '#9A6E48',
    cream: '#EAD7B8',
    danger: '#E0664B',
    border: 'rgba(243, 233, 218, 0.14)',
    shelf: '#3A2A1F',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Paleta de ARTE — consumida pelos SVGs (CoffeePlant, Pot, Steam).
 * Separada dos tokens de UI para dar liberdade ao traço artesanal.
 */
export const ArtColors = {
  light: {
    trunk: '#6B4A30',
    trunkShade: '#523619',
    branch: '#7A5638',
    leaf: '#5E8B4C',
    leafLight: '#79A85F',
    leafDark: '#41663A',
    fruitGreen: '#8FA94B',
    fruitRipe: '#C0392B',
    fruitRipeLight: '#D9583F',
    soil: '#4A3526',
    soilLight: '#5E4332',
    potClay: '#B5613C',
    potClayLight: '#CC7A52',
    potGlass: '#BFD8DC',
    potCeramic: '#E7DDCB',
    outline: '#3A281C',
    steam: 'rgba(120, 100, 84, 0.55)',
  },
  dark: {
    trunk: '#8A6442',
    trunkShade: '#5F4126',
    branch: '#9A7350',
    leaf: '#7CA86A',
    leafLight: '#97C281',
    leafDark: '#5A8049',
    fruitGreen: '#A9C25E',
    fruitRipe: '#D9583F',
    fruitRipeLight: '#E87159',
    soil: '#3A2A1F',
    soilLight: '#4E3A2B',
    potClay: '#C0744E',
    potClayLight: '#D88C63',
    potGlass: '#7E9CA2',
    potCeramic: '#C7B79E',
    outline: '#1F1611',
    steam: 'rgba(235, 220, 200, 0.45)',
  },
} as const;

export type ArtPalette = (typeof ArtColors)[keyof typeof ArtColors];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
