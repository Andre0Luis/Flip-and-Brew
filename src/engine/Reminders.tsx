import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/store/useApp';
import { todayCheckin } from '@/lib/checkin';
import { onDailyReminderTap, syncDailyReminders } from '@/lib/notifications';
import { planReminders } from '@/lib/reminders';

/**
 * Mantém os lembretes diários agendados (frase da manhã e lembrete do check-in) e abre o Início ao tocar neles.
 * Reagenda ao mudar os ajustes, ao fazer o check-in (some o lembrete de hoje) e sempre que o app volta ao primeiro plano.
 * Não desenha nada.
 */
export function Reminders() {
  const router = useRouter();
  const morning = useApp((s) => s.settings.dailyMorning);
  const checkin = useApp((s) => s.settings.dailyCheckin);
  const morningHour = useApp((s) => s.settings.morningHour);
  const checkinHour = useApp((s) => s.settings.checkinHour);
  const lang = useApp((s) => s.settings.language);
  const checkins = useApp((s) => s.checkins);

  useEffect(() => {
    const run = () => {
      const now = Date.now();
      const plan = planReminders({ now, morning, checkin, morningHour, checkinHour, checkedToday: !!todayCheckin(checkins, now) });
      void syncDailyReminders(plan, lang);
    };
    run();
    const sub = AppState.addEventListener('change', (st) => st === 'active' && run());
    return () => sub.remove();
  }, [morning, checkin, morningHour, checkinHour, lang, checkins]);

  useEffect(() => onDailyReminderTap(() => router.dismissTo('/')), [router]);

  return null;
}
