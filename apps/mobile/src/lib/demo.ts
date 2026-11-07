import { brewers } from '@/data/catalog';
import { outcomeOf } from '@/lib/brew';
import type { Checkin, Session } from '@/store/types';
import { dayKey, minutesByDay, TRIGGERS } from '@/lib/stats';

// Gerador determinístico, para o resultado ser sempre o mesmo.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Histórico de exemplo (quatro semanas por padrão). Os dados são fictícios e servem para ver as telas preenchidas. */
export function makeDemoSessions(now = Date.now(), days = 28): Session[] {
  const rand = rng(42);
  const bs = brewers().filter((b) => ['v60', 'press', 'moka'].includes(b.id));
  const out: Session[] = [];
  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  for (let back = days - 1; back >= 0; back--) {
    if (back % 11 === 9) continue; // um dia perdido a cada 11, para o calendário e a leitura antifrágil
    const day = base.getTime() - back * 86_400_000;
    const slots = [7.5, 12.3, 18.2, 21.4].filter(() => rand() > 0.35);
    if (!slots.length) slots.push(18);
    for (const hour of slots) {
      const startedAt = day + hour * 3_600_000 + Math.floor(rand() * 20 * 60_000);
      if (startedAt > now - 60_000) continue;
      const b = bs[Math.floor(rand() * bs.length)];
      const target = (b.brewMinutes ?? 45) * 60_000;
      const early = rand() < 0.22;
      const end = early ? startedAt + target * (0.3 + rand() * 0.6) : startedAt + target;
      const o = outcomeOf(startedAt, target, Math.min(end, now));
      const session: Session = {
        id: `demo-${startedAt}`,
        brewerId: b.id,
        cupId: 'cup',
        startedAt,
        targetMs: target,
        elapsedMs: o.elapsedMs,
        status: o.status,
        coins: o.coins,
        quality: o.quality,
        mood: Math.min(5, Math.max(2, Math.round(3 + (o.status === 'done' ? 1 : 0) + (rand() - 0.5) * 2))),
      };
      if (o.status === 'interrupted') session.trigger = TRIGGERS[Math.floor(rand() * 3 + (hour < 9 ? 0 : 1)) % TRIGGERS.length];
      out.push(session);
    }
  }
  return out;
}

/** Check-ins de exemplo: mais tempo offline no dia, mais xícaras de energia (com um pouco de variação). */
export function makeDemoCheckins(now = Date.now(), days = 28, sessions = makeDemoSessions(now, days)): Checkin[] {
  const rand = rng(7);
  const by = minutesByDay(sessions);
  const out: Checkin[] = [];
  for (let back = days - 1; back >= 0; back--) {
    if (back % 5 === 3) continue; // alguns dias sem resposta
    const t = now - back * 86_400_000;
    const energy = Math.min(5, Math.max(1, Math.round(1.8 + Math.min(by[dayKey(t)] ?? 0, 180) / 60 + (rand() - 0.5) * 1.6)));
    out.push({ day: dayKey(t), energy, at: t });
  }
  return out;
}
