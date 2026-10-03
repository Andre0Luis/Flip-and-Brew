import { AppState, Platform } from 'react-native';
import { appStorage } from '@/store/storage';
import { useApp } from '@/store/useApp';
import { buildWidgetData, WIDGET_DATA_KEY, withLiveBrew, type WidgetData } from './widgetData';

export const ANDROID_WIDGETS = ['FlipQuote', 'FlipBrew', 'FlipStreak', 'FlipGoal', 'FlipMissions'] as const;

/** Passos do copo para o iOS desenhar o progresso sozinho, sem o app aberto: um a cada 5 minutos, até o fim. */
function brewTimeline(data: WidgetData, now: number) {
  const b = data.brew;
  if (!b.active) return [{ date: new Date(now), props: data }];
  const end = b.startedAt + b.targetMs;
  const entries = [] as { date: Date; props: WidgetData }[];
  for (let t = now; t < end && entries.length < 40; t += 5 * 60_000) entries.push({ date: new Date(t), props: withLiveBrew(data, t) });
  entries.push({ date: new Date(end), props: withLiveBrew(data, end) });
  return entries;
}

/** Grava o retrato do app e pede aos widgets (Android e iOS) que se redesenhem. Falhas são ignoradas: widget é um complemento. */
export async function syncWidgets(now = Date.now()): Promise<void> {
  const st = useApp.getState();
  const data = buildWidgetData(
    {
      sessions: st.sessions,
      checkins: st.checkins,
      practicesDone: st.practicesDone,
      missionsClaimed: st.missionsClaimed,
      coins: st.coins,
      goalMin: st.settings.goalMin,
      active: st.active,
      language: st.settings.language,
    },
    now,
  );
  try {
    appStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data));
  } catch {
    // sem armazenamento, o widget fica com o último retrato
  }
  try {
    if (Platform.OS === 'android') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { requestWidgetUpdate } = require('react-native-android-widget') as typeof import('react-native-android-widget');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { WIDGETS } = require('@/widgets/android/widgets') as typeof import('@/widgets/android/widgets');
      for (const name of ANDROID_WIDGETS) {
        const Widget = WIDGETS[name];
        await requestWidgetUpdate({ widgetName: name, renderWidget: () => <Widget data={withLiveBrew(data)} /> });
      }
    } else if (Platform.OS === 'ios') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const w = require('@/widgets/ios/widgets') as typeof import('@/widgets/ios/widgets');
      w.FlipQuote.updateSnapshot(data);
      w.FlipStreak.updateSnapshot(data);
      w.FlipGoal.updateSnapshot(data);
      w.FlipMissions.updateSnapshot(data);
      w.FlipBrew.updateTimeline(brewTimeline(data, now));
    }
  } catch {
    // Expo Go e web não têm o módulo nativo dos widgets
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;
/** Agenda uma atualização curta depois, para juntar várias mudanças seguidas do estado em uma só. */
export function scheduleWidgetSync(delayMs = 3000) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void syncWidgets(), delayMs);
}

/** Liga a atualização automática: ao abrir, a cada mudança do estado e ao voltar para o primeiro plano. */
export function startWidgetSync(): () => void {
  if (Platform.OS === 'web') return () => {};
  scheduleWidgetSync(1500);
  const unsub = useApp.subscribe(() => scheduleWidgetSync());
  const app = AppState.addEventListener('change', (s) => s === 'active' && scheduleWidgetSync(500));
  return () => {
    unsub();
    app.remove();
    if (timer) clearTimeout(timer);
  };
}
