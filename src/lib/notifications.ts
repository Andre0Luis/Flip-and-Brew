import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { translate, type Lang } from '@/i18n';
import { quoteOfDay } from '@/data/quotes';
import { REMINDER_PREFIX, type ReminderPlan } from './reminders';

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

const DAILY_CHANNEL = 'daily-reminders';

/**
 * Reagenda os lembretes diários: apaga os antigos e agenda o plano de novo. Um aviso por dia, porque cada manhã leva a frase do dia.
 * Sem permissão ou com o plano vazio, só apaga.
 */
export async function syncDailyReminders(plan: ReminderPlan[], lang: Lang): Promise<void> {
  const N = mod();
  if (!N) return;
  try {
    const old = await N.getAllScheduledNotificationsAsync();
    await Promise.all(
      old.filter((n) => n.identifier.startsWith(REMINDER_PREFIX)).map((n) => N.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
    );
    if (!plan.length || !(await N.getPermissionsAsync()).granted) return;
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync(DAILY_CHANNEL, {
        name: translate(lang, 'daily.channel'),
        importance: N.AndroidImportance.DEFAULT,
        sound: null, // aparece na barra, sem som e sem vibração
        vibrationPattern: null,
        enableVibrate: false,
      });
    }
    for (const r of plan) {
      const q = quoteOfDay(lang, new Date(r.at));
      const content =
        r.kind === 'morning'
          ? { title: translate(lang, 'daily.morningTitle'), body: `“${q.text}” ${q.author}` }
          : { title: translate(lang, 'daily.checkinTitle'), body: translate(lang, 'daily.checkinBody') };
      await N.scheduleNotificationAsync({
        identifier: r.id,
        content: { ...content, sound: false, data: { daily: r.kind } },
        trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: new Date(r.at), channelId: DAILY_CHANNEL },
      });
    }
  } catch {
    // sem lembrete o app segue igual
  }
}

/** Chama `cb` quando a pessoa toca num lembrete diário com o app aberto ou em segundo plano. Devolve a função para parar. */
export function onDailyReminderTap(cb: () => void): () => void {
  const N = mod();
  if (!N) return () => {};
  const sub = N.addNotificationResponseReceivedListener((r) => {
    if (r.notification.request.content.data?.daily) cb();
  });
  return () => sub.remove();
}
