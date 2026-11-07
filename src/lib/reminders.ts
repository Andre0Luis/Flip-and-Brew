// Regras puras dos lembretes diários, sem importar o expo-notifications, para testar em Node.
import { dayKey } from './stats';

export type ReminderKind = 'morning' | 'checkin';
export type ReminderPlan = { id: string; kind: ReminderKind; at: number };

/** Horas permitidas: a frase vem de manhã e o lembrete do check-in, de tarde ou à noite. */
export const REMINDER_HOURS = { morning: { min: 5, max: 11 }, checkin: { min: 12, max: 22 } } as const;
export const DEFAULT_MORNING_HOUR = 8;
export const DEFAULT_CHECKIN_HOUR = 20;
/** Os avisos são agendados um a um (cada manhã tem a sua frase), então valem por quantos dias a pessoa pode ficar sem abrir o app. */
export const REMINDER_DAYS = 14;
export const REMINDER_PREFIX = 'daily-';

export const normalizeHour = (kind: ReminderKind, hour: number) => {
  const { min, max } = REMINDER_HOURS[kind];
  const h = Number.isFinite(hour) ? Math.round(hour) : kind === 'morning' ? DEFAULT_MORNING_HOUR : DEFAULT_CHECKIN_HOUR;
  return Math.min(max, Math.max(min, h));
};

export type ReminderInput = {
  now: number;
  morning: boolean;
  checkin: boolean;
  morningHour: number;
  checkinHour: number;
  /** o check-in de hoje já foi feito: o lembrete de hoje não é agendado */
  checkedToday: boolean;
};

/** Quais avisos agendar a partir de agora. Horários que já passaram ficam de fora. */
export function planReminders(i: ReminderInput): ReminderPlan[] {
  const out: ReminderPlan[] = [];
  const kinds: { kind: ReminderKind; on: boolean; hour: number }[] = [
    { kind: 'morning', on: i.morning, hour: normalizeHour('morning', i.morningHour) },
    { kind: 'checkin', on: i.checkin, hour: normalizeHour('checkin', i.checkinHour) },
  ];
  for (let d = 0; d < REMINDER_DAYS; d++) {
    for (const { kind, on, hour } of kinds) {
      if (!on) continue;
      const date = new Date(i.now);
      date.setDate(date.getDate() + d);
      date.setHours(hour, 0, 0, 0);
      const at = date.getTime();
      if (at <= i.now) continue;
      if (kind === 'checkin' && d === 0 && i.checkedToday) continue;
      out.push({ id: `${REMINDER_PREFIX}${kind}-${dayKey(at)}`, kind, at });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
