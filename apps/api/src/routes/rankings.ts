import { and, eq, inArray, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { isoWeek, weekStatsSchema } from '../shared.js';
import type { Env } from '../auth/middleware.js';
import type { Db } from '../db/client.js';
import { friendships, privacySettings, profiles, weeklyStats } from '../db/schema.js';
import { HttpError, jsonBody, parse } from '../lib/errors.js';
import { blockedWith } from '../lib/social.js';

const DAY = 86_400_000;
const TOP = 50;

/**
 * Ranking da semana: quem passou mais tempo offline (desempate pelos copos). Entre amigos sempre;
 * o geral só com quem ligou "aparecer no ranking geral". Os totais vêm do app (não há como conferir no servidor).
 */
export function rankingRoutes(db: Db) {
  const r = new Hono<Env>();

  /** O app manda os totais da semana atual (aceita a semana de ontem e a de amanhã, por causa do fuso). */
  r.put('/me/week', async (c) => {
    const me = c.get('profile').id;
    const body = parse(weekStatsSchema, await jsonBody(c));
    const now = Date.now();
    const allowed = new Set([isoWeek(now - DAY), isoWeek(now), isoWeek(now + DAY)]);
    if (!allowed.has(body.week)) throw new HttpError(400, 'invalid_week', 'Só a semana atual.');
    await db
      .insert(weeklyStats)
      .values({ userId: me, week: body.week, offlineMinutes: body.offlineMinutes, cups: body.cups })
      .onConflictDoUpdate({ target: [weeklyStats.userId, weeklyStats.week], set: { offlineMinutes: body.offlineMinutes, cups: body.cups, updatedAt: new Date() } });
    return c.body(null, 204);
  });

  r.get('/rankings', async (c) => {
    const me = c.get('profile').id;
    const scope = c.req.query('scope') === 'global' ? 'global' : 'friends';
    const week = c.req.query('week') ?? isoWeek(Date.now());
    if (!/^\d{4}-W\d{2}$/.test(week)) throw new HttpError(400, 'invalid_week');
    const hidden = await blockedWith(db, me);

    let ids: string[];
    if (scope === 'friends') {
      const rows = await db
        .select({ a: friendships.requesterId, b: friendships.addresseeId })
        .from(friendships)
        .where(and(eq(friendships.status, 'accepted'), or(eq(friendships.requesterId, me), eq(friendships.addresseeId, me))));
      ids = [me, ...rows.map((x) => (x.a === me ? x.b : x.a))];
    } else {
      const rows = await db.select({ id: privacySettings.userId }).from(privacySettings).where(eq(privacySettings.showInGlobalRanking, true));
      ids = rows.map((x) => x.id);
    }
    ids = [...new Set(ids)].filter((id) => !hidden.has(id));
    if (!ids.length) return c.json({ week, scope, entries: [] });

    const people = await db.select({ id: profiles.id, handle: profiles.handle, displayName: profiles.displayName, avatarPath: profiles.avatarPath, bannedAt: profiles.bannedAt }).from(profiles).where(inArray(profiles.id, ids));
    const stats = await db.select().from(weeklyStats).where(and(eq(weeklyStats.week, week), inArray(weeklyStats.userId, ids)));
    const byUser = new Map(stats.map((s) => [s.userId, s]));
    // Entre amigos aparecem todos (quem não mandou nada fica com zero); no geral, só quem tem números da semana.
    const rows = people
      .filter((p) => !p.bannedAt && (scope === 'friends' || byUser.has(p.id)))
      .map((p) => ({ person: { id: p.id, handle: p.handle, displayName: p.displayName, avatarPath: p.avatarPath }, offlineMinutes: byUser.get(p.id)?.offlineMinutes ?? 0, cups: byUser.get(p.id)?.cups ?? 0, me: p.id === me }))
      .sort((a, b) => b.offlineMinutes - a.offlineMinutes || b.cups - a.cups || (a.person.handle ?? '').localeCompare(b.person.handle ?? ''))
      .slice(0, TOP)
      .map((x, i) => ({ rank: i + 1, ...x }));
    return c.json({ week, scope, entries: rows });
  });

  return r;
}
