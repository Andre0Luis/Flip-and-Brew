import { and, desc, eq, gte, lt } from 'drizzle-orm';
import { Hono } from 'hono';
import { coffeeLogSchema } from '../shared';
import type { Env } from '../auth/middleware';
import type { Db } from '../db/client';
import { coffeeLogs } from '../db/schema';
import { HttpError, jsonBody, parse } from '../lib/errors';

const DAY = 86_400_000;
const MAX_PER_DAY = 50;

/** Registro de café de verdade. Um café por registro, só a própria pessoa lê e apaga. */
export function coffeeRoutes(db: Db) {
  const r = new Hono<Env>();

  r.post('/me/coffees', async (c) => {
    const id = c.get('profile').id;
    const body = parse(coffeeLogSchema, await jsonBody(c));
    const now = Date.now();
    const at = body.at ?? now;
    if (at > now + 60_000) throw new HttpError(400, 'invalid_input', 'O horário não pode estar no futuro.');
    const recent = await db.select({ id: coffeeLogs.id }).from(coffeeLogs).where(and(eq(coffeeLogs.userId, id), gte(coffeeLogs.at, new Date(now - DAY))));
    if (recent.length >= MAX_PER_DAY) throw new HttpError(429, 'too_many_requests', 'Muitos registros hoje.');
    const [row] = await db
      .insert(coffeeLogs)
      .values({ userId: id, at: new Date(at), kind: body.kind, method: body.method, sizeMl: body.sizeMl, note: body.note })
      .returning();
    return c.json({ coffee: row }, 201);
  });

  r.get('/me/coffees', async (c) => {
    const id = c.get('profile').id;
    const limit = Math.min(100, Math.max(1, Number(c.req.query('limit')) || 50));
    const before = Number(c.req.query('before'));
    const rows = await db
      .select()
      .from(coffeeLogs)
      .where(and(eq(coffeeLogs.userId, id), Number.isFinite(before) && before > 0 ? lt(coffeeLogs.at, new Date(before)) : undefined))
      .orderBy(desc(coffeeLogs.at))
      .limit(limit);
    return c.json({ coffees: rows, nextBefore: rows.length === limit ? rows[rows.length - 1].at.getTime() : null });
  });

  r.delete('/me/coffees/:id', async (c) => {
    const uid = c.get('profile').id;
    const cid = c.req.param('id');
    if (!/^[0-9a-f-]{36}$/i.test(cid)) throw new HttpError(404, 'not_found');
    const gone = await db.delete(coffeeLogs).where(and(eq(coffeeLogs.id, cid), eq(coffeeLogs.userId, uid))).returning({ id: coffeeLogs.id });
    if (!gone.length) throw new HttpError(404, 'not_found');
    return c.body(null, 204);
  });

  return r;
}
