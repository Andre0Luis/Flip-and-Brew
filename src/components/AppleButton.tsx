import React from 'react';
import { Platform, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Botão oficial "Entrar com a Apple" (a Apple exige o botão dela ou um igual em estilo). Só existe no iOS.
 * O texto vem do sistema e já acompanha o idioma do aparelho.
 */
export function AppleButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const { isDark } = useTheme();
  if (Platform.OS !== 'ios') return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Apple = require('expo-apple-authentication') as typeof import('expo-apple-authentication');
  return (
    <View style={{ opacity: disabled ? 0.5 : 1 }} pointerEvents={disabled ? 'none' : 'auto'}>
      <Apple.AppleAuthenticationButton
        buttonType={Apple.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={isDark ? Apple.AppleAuthenticationButtonStyle.WHITE : Apple.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={999}
        style={{ width: '100%', height: 50 }}
        onPress={onPress}
      />
    </View>
  );
}
