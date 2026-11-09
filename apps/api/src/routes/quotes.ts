import { asc, eq, max, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { quotesPutSchema } from '../shared.js';
import type { Env } from '../auth/middleware.js';
import type { Db } from '../db/client.js';
import { auditLog, dailyQuotes } from '../db/schema.js';
import { HttpError, jsonBody, parse } from '../lib/errors.js';

const view = (r: typeof dailyQuotes.$inferSelect) => ({ id: r.id, position: r.position, active: r.active, content: r.content, updatedAt: r.updatedAt });

/**
 * Frases do dia. O app lê a lista ativa (`GET /quotes`), guarda no aparelho e escolhe a do dia pela posição.
 * Quem administra acrescenta e corrige por `/admin/quotes`; a role é conferida em `requireRole` antes de chegar aqui.
 */
export function quoteRoutes(db: Db) {
  const r = new Hono<Env>();

  r.get('/quotes', async (c) => {
    const rows = await db.select().from(dailyQuotes).where(eq(dailyQuotes.active, true)).orderBy(asc(dailyQuotes.position), asc(dailyQuotes.id));
    c.header('cache-control', 'private, max-age=300');
    return c.json({ quotes: rows.map(({ id, content }) => ({ id, content })), updatedAt: rows.reduce((a, x) => Math.max(a, x.updatedAt.getTime()), 0) });
  });

  r.get('/admin/quotes', async (c) => {
    const rows = await db.select().from(dailyQuotes).orderBy(asc(dailyQuotes.position), asc(dailyQuotes.id));
    return c.json({ quotes: rows.map(view) });
  });

  /** Cria ou corrige (pelo `id`). Sem `position`, a frase nova vai para o fim do rodízio e a antiga mantém o lugar. */
  r.put('/admin/quotes', async (c) => {
    const actor = c.get('profile');
    const { quotes } = parse(quotesPutSchema, await jsonBody(c));
    const ids = quotes.map((q) => q.id);
    if (new Set(ids).size !== ids.length) throw new HttpError(400, 'invalid_input', 'Id repetido na lista.');
    const [{ top }] = await db.select({ top: max(dailyQuotes.position) }).from(dailyQuotes);
    let next = (top ?? -1) + 1;
    const now = new Date();
    for (const q of quotes) {
      const base = { content: q.content, ...(q.active === undefined ? {} : { active: q.active }), updatedAt: now };
      await db
        .insert(dailyQuotes)
        .values({ id: q.id, position: q.position ?? next, active: q.active ?? true, content: q.content })
        .onConflictDoUpdate({ target: dailyQuotes.id, set: q.position === undefined ? base : { ...base, position: q.position } });
      if (q.position === undefined) next += 1;
    }
    await db.insert(auditLog).values({ actorId: actor.id, action: 'admin.quotes.put', meta: { n: quotes.length } });
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(dailyQuotes);
    return c.json({ saved: quotes.length, total: n });
  });

  r.delete('/admin/quotes/:id', async (c) => {
    const actor = c.get('profile');
    const id = c.req.param('id');
    const gone = await db.delete(dailyQuotes).where(eq(dailyQuotes.id, id)).returning({ id: dailyQuotes.id });
    if (!gone.length) throw new HttpError(404, 'not_found');
    await db.insert(auditLog).values({ actorId: actor.id, action: 'admin.quotes.delete', target: id });
    return c.body(null, 204);
  });

  return r;
}
