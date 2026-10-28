import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { translate, type Lang } from '@/i18n';

// Notificação local, silenciosa, avisando que o copo encheu. Só existe no aparelho e só quando a pessoa liga em Ajustes.
const CHANNEL = 'brew-done';
/** Dois avisos silenciosos: copo pronto (ou fim do foco) e fim da pausa do Pomodoro. */
export type NoticeKind = 'brew' | 'break';
const IDS: Record<NoticeKind, string> = { brew: 'brew-done', break: 'break-done' };
const TEXT: Record<NoticeKind, { title: 'notify.title' | 'notify.breakTitle'; body: 'notify.body' | 'notify.breakBody' }> = {
  brew: { title: 'notify.title', body: 'notify.body' },
  break: { title: 'notify.breakTitle', body: 'notify.breakBody' },
};

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

export async function scheduleBrewDone(at: number, lang: Lang, kind: NoticeKind = 'brew'): Promise<void> {
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
    await N.cancelScheduledNotificationAsync(IDS[kind]).catch(() => {});
    await N.scheduleNotificationAsync({
      identifier: IDS[kind],
      content: { title: translate(lang, TEXT[kind].title), body: translate(lang, TEXT[kind].body), sound: false },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: new Date(at), channelId: CHANNEL },
    });
  } catch {
    // sem notificação o copo continua igual
  }
}

export async function cancelBrewDone(kind: NoticeKind = 'brew'): Promise<void> {
  const N = mod();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(IDS[kind]);
  } catch {
    // nada agendado
  }
}
