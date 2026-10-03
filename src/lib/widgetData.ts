import { itemText } from '@/data/catalog';
import { quoteOfDay } from '@/data/quotes';
import { translate, type Lang } from '@/i18n';
import { missionsFor } from './missions';
import { dayKey, streak, todayStats } from './stats';
import type { Checkin, Session } from '@/store/types';

/** Tudo o que os widgets (Android e iOS) mostram, já traduzido: os widgets rodam fora do app e não têm o i18n. */
export type WidgetData = {
  v: 1;
  updatedAt: number;
  lang: Lang;
  quote: { text: string; author: string };
  brew: { active: boolean; name: string; percent: number; remainingMin: number; startedAt: number; targetMs: number };
  streak: number;
  coins: number;
  today: { minutes: number; goal: number; percent: number };
  missions: { done: number; total: number };
  energy: number | null;
  labels: {
    quote: string;
    brew: string;
    idle: string;
    remaining: string;
    streak: string;
    days: string;
    coins: string;
    goal: string;
    missions: string;
    minutes: string;
  };
};

export const WIDGET_DATA_KEY = 'flip-and-brew-widget-data';

export type WidgetSource = {
  sessions: Session[];
  checkins: Checkin[];
  practicesDone: string[];
  missionsClaimed: string[];
  coins: number;
  goalMin: number;
  active: { brewerId: string; startedAt: number; targetMs: number } | null;
  language: Lang;
};

export function buildWidgetData(src: WidgetSource, now = Date.now()): WidgetData {
  const lang = src.language;
  const t = (key: Parameters<typeof translate>[1], params?: Parameters<typeof translate>[2]) => translate(lang, key, params);
  const q = quoteOfDay(lang, new Date(now));
  const today = todayStats(src.sessions, now);
  const days = streak(src.sessions, now);
  const ms = missionsFor({ sessions: src.sessions, checkins: src.checkins, practicesDone: src.practicesDone, goalMin: src.goalMin, claimed: src.missionsClaimed }, now);
  const a = src.active;
  const elapsed = a ? Math.max(0, Math.min(now - a.startedAt, a.targetMs)) : 0;
  const energyToday = src.checkins.find((c) => c.day === dayKey(now));
  return {
    v: 1,
    updatedAt: now,
    lang,
    quote: { text: q.text, author: `${q.author} · ${q.source}` },
    brew: {
      active: !!a,
      name: a ? itemText(lang, a.brewerId).name : '',
      percent: a ? Math.round((elapsed / a.targetMs) * 100) : 0,
      remainingMin: a ? Math.max(0, Math.ceil((a.targetMs - elapsed) / 60_000)) : 0,
      startedAt: a?.startedAt ?? 0,
      targetMs: a?.targetMs ?? 0,
    },
    streak: days,
    coins: src.coins,
    today: { minutes: Math.round(today.minutes), goal: src.goalMin, percent: Math.min(100, Math.round((today.minutes / src.goalMin) * 100)) },
    missions: { done: ms.filter((m) => m.done).length, total: ms.length },
    energy: energyToday?.energy ?? null,
    labels: {
      quote: t('widget.quote'),
      brew: t('widget.brew'),
      idle: t('widget.idle'),
      remaining: t('widget.remaining'),
      streak: t('widget.streak'),
      days: t('widget.days'),
      coins: t('widget.coins'),
      goal: t('widget.goal'),
      missions: t('widget.missions'),
      minutes: t('widget.minutes'),
    },
  };
}

/** Recalcula o progresso do copo para o momento de desenhar, porque o retrato foi gravado há algum tempo. */
export function withLiveBrew(data: WidgetData, now = Date.now()): WidgetData {
  const b = data.brew;
  if (!b.active || !b.targetMs) return data;
  const elapsed = Math.max(0, Math.min(now - b.startedAt, b.targetMs));
  const done = elapsed >= b.targetMs;
  return {
    ...data,
    brew: { ...b, active: !done, percent: done ? 100 : Math.round((elapsed / b.targetMs) * 100), remainingMin: Math.max(0, Math.ceil((b.targetMs - elapsed) / 60_000)) },
  };
}
