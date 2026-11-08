import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { YoungSerif_400Regular } from '@expo-google-fonts/young-serif';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { BrewEngine } from '@/engine/BrewEngine';
import { CloudSync } from '@/engine/CloudSync';
import { WidgetSync } from '@/engine/WidgetSync';
import { Reminders } from '@/engine/Reminders';
import { useApp } from '@/store/useApp';
import { useAuth } from '@/store/useAuth';
import { getBackend } from '@/lib/cloud';
import { gateScreen } from '@/lib/loginGate';
import { translate } from '@/i18n';
import { light } from '@/theme/tokens';
import { Pressable, Text, View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { c, isDark } = useTheme();
  const onboarded = useApp((s) => s.onboarded);
  const firstStepsDone = useApp((s) => s.firstStepsDone);
  const status = useAuth((s) => s.status);
  // Com o backend próprio ligado o login é obrigatório; com o Firebase (builds da loja de hoje) a conta continua opcional.
  const required = getBackend()?.kind === 'api';
  const screen = gateScreen({ required, onboarded, status, firstStepsDone });
  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = { ...base, colors: { ...base.colors, background: c.bg, card: c.surface, text: c.fg, border: c.line, primary: c.accent } };
  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <BrewEngine />
      <CloudSync />
      <WidgetSync />
      <Reminders />
      {screen === 'loading' ? (
        // Espera o login guardado ser lido, para quem já entrou não ver a tela de entrar por um instante.
        <View style={{ flex: 1, backgroundColor: c.bg }} />
      ) : (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
          {/* Uma tela por vez: introdução, entrar (login obrigatório), primeiros passos e, por fim, o app. */}
          <Stack.Protected guard={screen === 'intro'}>
            <Stack.Screen name="intro" options={{ animation: 'fade' }} />
          </Stack.Protected>
          <Stack.Protected guard={screen === 'login'}>
            <Stack.Screen name="entrar" options={{ animation: 'fade' }} />
          </Stack.Protected>
          <Stack.Protected guard={screen === 'firstSteps'}>
            <Stack.Screen name="primeiros-passos" options={{ animation: 'fade' }} />
          </Stack.Protected>
          <Stack.Protected guard={screen === 'app'}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="brew" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="resultado" options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen name="artigo/[id]" />
            <Stack.Screen name="frase/[id]" />
            <Stack.Screen name="ajustes" options={{ presentation: 'modal' }} />
            <Stack.Screen name="moedas" options={{ presentation: 'modal' }} />
            <Stack.Screen name="conta" />
            <Stack.Screen name="perfil" />
            <Stack.Screen name="criador" />
            <Stack.Screen name="pessoa/[handle]" />
          </Stack.Protected>
          {/* Ficam por último e sem trava: a primeira rota registrada vira a tela inicial. A política de privacidade precisa abrir antes do cadastro, e o link do e-mail de recuperação de senha também. */}
          <Stack.Screen name="privacidade" />
          <Stack.Screen name="nova-senha" />
        </Stack>
      )}
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    YoungSerif_400Regular,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}

/** Tela de erro do roteador. Fica fora do ThemeProvider, então usa a paleta clara e o idioma salvo direto do estado. */
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const lang = useApp.getState().settings.language;
  return (
    <View style={{ flex: 1, backgroundColor: light.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
      <Text style={{ fontFamily: 'YoungSerif_400Regular', fontSize: 28, color: light.fg, textAlign: 'center' }}>{translate(lang, 'error.title')}</Text>
      <Text style={{ fontFamily: 'Figtree_400Regular', fontSize: 15, color: light.muted, textAlign: 'center' }}>{translate(lang, 'error.body')}</Text>
      {/* Mensagem técnica, pequena, para a pessoa poder copiar e relatar o erro. */}
      <Text selectable style={{ fontFamily: 'DMMono_400Regular', fontSize: 11, color: light.muted, textAlign: 'center' }}>
        {String(error?.message ?? error).slice(0, 400)}
      </Text>
      <Pressable accessibilityRole="button" onPress={retry} style={{ backgroundColor: light.accent, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 28 }}>
        <Text style={{ fontFamily: 'Figtree_600SemiBold', fontSize: 16, color: light.accentFg }}>{translate(lang, 'error.retry')}</Text>
      </Pressable>
    </View>
  );
}
