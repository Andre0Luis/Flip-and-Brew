import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { translate, type Lang } from '@/i18n';

// Notificação local, silenciosa, avisando que o copo encheu. Só existe no aparelho e só quando a pessoa liga em Ajustes.
const CHANNEL = 'brew-done';
const ID = 'brew-done';

function mod() {
  // No Expo Go as notificações foram removidas (SDK 53+) e carregar a biblioteca só gera erro.
  if (Platform.OS === 'web' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as typeof import('expo-notifications');
  } catch {
    return null;
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const N = mod();
  if (!N) return false;
  try {
    const cur = await N.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    return (await N.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

export async function scheduleBrewDone(at: number, lang: Lang): Promise<void> {
  const N = mod();
  if (!N || at <= Date.now()) return;
  try {
    if (!(await N.getPermissionsAsync()).granted) return;
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync(CHANNEL, {
        name: translate(lang, 'notify.channel'),
        importance: N.AndroidImportance.LOW, // sem som e sem vibração
        sound: null,
        vibrationPattern: null,
        enableVibrate: false,
      });
    }
    await N.cancelScheduledNotificationAsync(ID).catch(() => {});
    await N.scheduleNotificationAsync({
      identifier: ID,
      content: { title: translate(lang, 'notify.title'), body: translate(lang, 'notify.body'), sound: false },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: new Date(at), channelId: CHANNEL },
    });
  } catch {
    // sem notificação o copo continua igual
  }
}

export async function cancelBrewDone(): Promise<void> {
  const N = mod();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(ID);
  } catch {
    // nada agendado
  }
}
