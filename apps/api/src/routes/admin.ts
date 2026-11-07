import { count, desc, gte, lt, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { ACTIVE_NOW_MS } from '../shared.js';
import type { Env } from '../auth/middleware.js';
import type { Db } from '../db/client.js';
import { auditLog, profiles } from '../db/schema.js';

const DAY = 86_400_000;

/** Monitoramento (só admin). A role é conferida no banco em `requireRole`; esconder a tela no app é só interface. */
export function adminRoutes(db: Db) {
  const r = new Hono<Env>();

  r.get('/admin/overview', async (c) => {
    const now = Date.now();
    const n = async (since?: number) => {
      const [row] = await db.select({ n: count() }).from(profiles).where(since ? gte(profiles.lastSeenAt, new Date(since)) : undefined);
      return row.n;
    };
    const [created7] = await db.select({ n: count() }).from(profiles).where(gte(profiles.createdAt, new Date(now - 7 * DAY)));
    const day = sql<string>`to_char(${profiles.createdAt} at time zone 'UTC', 'YYYY-MM-DD')`;
    const signups = await db
      .select({ day, n: sql<number>`count(*)::int` })
      .from(profiles)
      .where(gte(profiles.createdAt, new Date(now - 14 * DAY)))
      .groupBy(sql`1`)
      .orderBy(sql`1`);
    return c.json({
      totalUsers: await n(),
      activeNow: await n(now - ACTIVE_NOW_MS),
      active24h: await n(now - DAY),
      active7d: await n(now - 7 * DAY),
      newLast7d: created7.n,
      signupsByDay: signups,
      at: now,
    });
  });

  r.get('/admin/users', async (c) => {
    const actor = c.get('profile');
    const now = Date.now();
    const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 50));
    const before = Number(c.req.query('before'));
    const rows = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        displayName: profiles.displayName,
        handle: profiles.handle,
        role: profiles.role,
        createdAt: profiles.createdAt,
        lastSeenAt: profiles.lastSeenAt,
        bannedAt: profiles.bannedAt,
      })
      .from(profiles)
      .where(Number.isFinite(before) && before > 0 ? lt(profiles.createdAt, new Date(before)) : undefined)
      .orderBy(desc(profiles.createdAt))
      .limit(limit);
    await db.insert(auditLog).values({ actorId: actor.id, action: 'admin.users.list', meta: { returned: rows.length } });
    return c.json({
      users: rows.map((u) => ({ ...u, activeNow: !!u.lastSeenAt && now - u.lastSeenAt.getTime() < ACTIVE_NOW_MS })),
      nextBefore: rows.length === limit ? rows[rows.length - 1].createdAt.getTime() : null,
    });
  });

  return r;
}
