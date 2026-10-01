/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { ArtColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function resolveScheme(scheme: ReturnType<typeof useColorScheme>): 'light' | 'dark' {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const scheme = useColorScheme();
  return Colors[resolveScheme(scheme)];
}

/** Paleta de arte (SVGs) conforme o esquema de cor atual. */
export function useArtColors() {
  const scheme = useColorScheme();
  return ArtColors[resolveScheme(scheme)];
}

/** 'light' | 'dark' resolvido (útil p/ gradientes e lógica condicional). */
export function useScheme(): 'light' | 'dark' {
  return resolveScheme(useColorScheme());
}
