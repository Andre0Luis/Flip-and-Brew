import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { snapshotPutSchema } from '@flipandbrew/shared';
import type { Env } from '../auth/middleware';
import type { Db } from '../db/client';
import { userSnapshots } from '../db/schema';
import { HttpError, jsonBody, parse } from '../lib/errors';

/** Backup do progresso. Mesma ideia do Firestore de hoje: o app decide quem é mais novo; o servidor só impede regravar com dado mais velho. */
export function snapshotRoutes(db: Db) {
  const r = new Hono<Env>();

  r.get('/me/snapshot', async (c) => {
    const [row] = await db.select().from(userSnapshots).where(eq(userSnapshots.userId, c.get('profile').id));
    if (!row) throw new HttpError(404, 'no_snapshot', 'Ainda não há backup.');
    return c.json({ v: row.version, updatedAt: row.updatedAt, data: row.data });
  });

  r.put('/me/snapshot', async (c) => {
    const id = c.get('profile').id;
    const body = parse(snapshotPutSchema, await jsonBody(c));
    const [cur] = await db.select({ updatedAt: userSnapshots.updatedAt }).from(userSnapshots).where(eq(userSnapshots.userId, id));
    if (cur && cur.updatedAt > body.updatedAt) {
      throw new HttpError(409, 'stale_snapshot', 'O servidor tem um backup mais novo.', { currentUpdatedAt: cur.updatedAt });
    }
    const values = { userId: id, data: body.data, updatedAt: body.updatedAt, version: body.v };
    await db.insert(userSnapshots).values(values).onConflictDoUpdate({ target: userSnapshots.userId, set: { data: values.data, updatedAt: values.updatedAt, version: values.version } });
    return c.json({ updatedAt: body.updatedAt });
  });

  return r;
}
