import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import RevenueCatService from '@/services/RevenueCat';
import { useFlipCounter } from '@/hooks/use-flip-counter';
import { useEffect } from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useFlipCounter();

  useEffect(() => {
    RevenueCatService.setup();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
