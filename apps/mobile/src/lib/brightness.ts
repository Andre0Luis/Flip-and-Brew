import { Platform } from 'react-native';
import { appStorage } from '@/store/storage';

// Escurece a tela enquanto o copo está em andamento e devolve o brilho depois.
// No Android o brilho muda só na janela do app e volta sozinho; no iPhone muda o do sistema, então o valor anterior
// fica guardado em disco para restaurar mesmo que o app seja fechado no meio do copo.
const KEY = 'flip-and-brew-prev-brightness';
const DIM = 0.01;

function mod() {
  if (Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-brightness') as typeof import('expo-brightness');
  } catch {
    return null;
  }
}

export async function dimScreen(): Promise<void> {
  const B = mod();
  if (!B) return;
  try {
    if (Platform.OS === 'ios' && appStorage.getItem(KEY) === null) {
      appStorage.setItem(KEY, String(await B.getBrightnessAsync()));
    }
    await B.setBrightnessAsync(DIM);
  } catch {
    // sem permissão ou sem módulo: o copo segue normalmente, só sem escurecer
  }
}

export async function restoreScreen(): Promise<void> {
  const B = mod();
  if (!B) return;
  try {
    if (Platform.OS === 'ios') {
      const prev = appStorage.getItem(KEY);
      if (prev === null) return;
      await B.setBrightnessAsync(Math.min(1, Math.max(0.05, Number(prev) || 0.5)));
      appStorage.removeItem(KEY);
    } else {
      await B.restoreSystemBrightnessAsync();
    }
  } catch {
    // ignora
  }
}
