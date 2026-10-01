import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useApp } from '@/store/useApp';
import { dark, fonts, light, radius, space, type Palette } from './tokens';

type Theme = { c: Palette; isDark: boolean; f: typeof fonts; r: typeof radius; s: typeof space };

const ThemeContext = createContext<Theme>({ c: light, isDark: false, f: fonts, r: radius, s: space });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const mode = useApp((s) => s.settings.themeMode);
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const value = useMemo<Theme>(() => ({ c: isDark ? dark : light, isDark, f: fonts, r: radius, s: space }), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
