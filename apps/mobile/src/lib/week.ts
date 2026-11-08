// Totais da semana para o ranking: segunda 00:00 (hora local) até agora. Função pura, testada em Node.

const DAY = 86_400_000;

/** Segunda-feira 00:00, no horário do aparelho, da semana de `ms`. */
export function weekStart(ms: number): number {
  const d = new Date(ms);
  const day = (d.getDay() + 6) % 7; // segunda = 0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day).getTime();
}

/** Semana ISO 8601 ("2026-W45") pelo calendário do aparelho. O servidor aceita a de ontem e a de amanhã, por causa do fuso. */
export function isoWeekOf(ms: number): string {
  const d = new Date(ms);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const start = Date.UTC(t.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((t.getTime() - start) / DAY + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

type S = { startedAt: number; elapsedMs: number; status: string };

/** Minutos offline (todos os copos, cheios ou não) e copos terminados desde segunda. */
export function weekTotals(sessions: S[], now: number): { week: string; offlineMinutes: number; cups: number } {
  const start = weekStart(now);
  const list = sessions.filter((s) => s.startedAt >= start && s.startedAt <= now);
  const minutes = Math.round(list.reduce((a, s) => a + Math.max(0, s.elapsedMs), 0) / 60_000);
  return { week: isoWeekOf(now), offlineMinutes: Math.min(7 * 24 * 60, minutes), cups: Math.min(1000, list.filter((s) => s.status === 'done').length) };
}
