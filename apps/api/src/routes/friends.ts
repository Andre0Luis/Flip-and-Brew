import { and, count, desc, eq, inArray, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { MAX_PENDING_REQUESTS, userIdSchema } from '@flipandbrew/shared';
import type { Env } from '../auth/middleware';
import type { Db } from '../db/client';
import { blocks, friendships, profiles } from '../db/schema';
import { HttpError, jsonBody, parse } from '../lib/errors';
import { friendshipBetween, isBlockedBetween } from '../lib/social';

const summary = {
  id: profiles.id,
  handle: profiles.handle,
  displayName: profiles.displayName,
  avatarPath: profiles.avatarPath,
};

const isUnique = (e: unknown): boolean => {
  const x = e as { code?: string; cause?: { code?: string } };
  return x?.code === '23505' || x?.cause?.code === '23505';
};

/** Amizade com aprovação e bloqueio. Quem está bloqueado (em qualquer direção) responde 404, para não revelar que a conta existe. */
export function friendRoutes(db: Db) {
  const r = new Hono<Env>();

  const target = async (me: string, userId: string) => {
    const [t] = await db.select({ id: profiles.id, bannedAt: profiles.bannedAt }).from(profiles).where(eq(profiles.id, userId));
    if (!t || t.bannedAt || (await isBlockedBetween(db, me, userId))) throw new HttpError(404, 'not_found', 'Pessoa não encontrada.');
    return t;
  };

  /** Pedir amizade. Se a outra pessoa já tinha pedido a mim, vira amizade na hora. */
  r.post('/friend-requests', async (c) => {
    const me = c.get('profile').id;
    const { userId } = parse(userIdSchema, await jsonBody(c));
    if (userId === me) throw new HttpError(400, 'invalid_input', 'Você não pode pedir amizade a si mesmo.');
    await target(me, userId);
    const existing = await friendshipBetween(db, me, userId);
    if (existing?.status === 'accepted') throw new HttpError(409, 'already_friends', 'Vocês já são amigos.');
    if (existing && existing.requesterId === me) throw new HttpError(409, 'already_requested', 'O pedido já foi enviado.');
    if (existing) {
      const [row] = await db.update(friendships).set({ status: 'accepted', respondedAt: new Date() }).where(eq(friendships.id, existing.id)).returning();
      return c.json({ friendship: row, accepted: true });
    }
    const [{ n }] = await db.select({ n: count() }).from(friendships).where(and(eq(friendships.requesterId, me), eq(friendships.status, 'pending')));
    if (n >= MAX_PENDING_REQUESTS) throw new HttpError(429, 'too_many_requests', 'Muitos pedidos sem resposta.');
    try {
      const [row] = await db.insert(friendships).values({ requesterId: me, addresseeId: userId }).returning();
      return c.json({ friendship: row, accepted: false }, 201);
    } catch (e) {
      if (isUnique(e)) throw new HttpError(409, 'already_requested', 'Já existe um pedido entre vocês.');
      throw e;
    }
  });

  r.get('/me/friend-requests', async (c) => {
    const me = c.get('profile').id;
    const incoming = c.req.query('direction') !== 'outgoing';
    const rows = await db
      .select({ requestId: friendships.id, createdAt: friendships.createdAt, ...summary })
      .from(friendships)
      .innerJoin(profiles, eq(profiles.id, incoming ? friendships.requesterId : friendships.addresseeId))
      .where(and(eq(incoming ? friendships.addresseeId : friendships.requesterId, me), eq(friendships.status, 'pending')))
      .orderBy(desc(friendships.createdAt))
      .limit(100);
    return c.json({ requests: rows });
  });

  /** Só quem recebeu o pedido aceita. */
  r.post('/friend-requests/:id/accept', async (c) => {
    const me = c.get('profile').id;
    const id = c.req.param('id');
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new HttpError(404, 'not_found');
    const [f] = await db.select().from(friendships).where(and(eq(friendships.id, id), eq(friendships.addresseeId, me), eq(friendships.status, 'pending')));
    if (!f || (await isBlockedBetween(db, me, f.requesterId))) throw new HttpError(404, 'not_found');
    const [row] = await db.update(friendships).set({ status: 'accepted', respondedAt: new Date() }).where(eq(friendships.id, id)).returning();
    return c.json({ friendship: row });
  });

  /** Recusar (quem recebeu) ou cancelar (quem enviou) apaga o pedido. */
  r.delete('/friend-requests/:id', async (c) => {
    const me = c.get('profile').id;
    const id = c.req.param('id');
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new HttpError(404, 'not_found');
    const gone = await db
      .delete(friendships)
      .where(and(eq(friendships.id, id), eq(friendships.status, 'pending'), or(eq(friendships.addresseeId, me), eq(friendships.requesterId, me))))
      .returning({ id: friendships.id });
    if (!gone.length) throw new HttpError(404, 'not_found');
    return c.body(null, 204);
  });

  r.get('/me/friends', async (c) => {
    const me = c.get('profile').id;
    const rows = await db
      .select({ since: friendships.respondedAt, requester: friendships.requesterId, addressee: friendships.addresseeId })
      .from(friendships)
      .where(and(eq(friendships.status, 'accepted'), or(eq(friendships.requesterId, me), eq(friendships.addresseeId, me))));
    const ids = rows.map((x) => (x.requester === me ? x.addressee : x.requester));
    if (!ids.length) return c.json({ friends: [] });
    const people = await db.select(summary).from(profiles).where(inArray(profiles.id, ids));
    const since = new Map(rows.map((x) => [x.requester === me ? x.addressee : x.requester, x.since]));
    return c.json({ friends: people.map((p) => ({ ...p, since: since.get(p.id) ?? null })).sort((a, b) => (a.displayName ?? a.handle ?? '').localeCompare(b.displayName ?? b.handle ?? '')) });
  });

  r.delete('/friends/:userId', async (c) => {
    const me = c.get('profile').id;
    const other = c.req.param('userId');
    if (!/^[0-9a-f-]{36}$/i.test(other)) throw new HttpError(404, 'not_found');
    const f = await friendshipBetween(db, me, other);
    if (!f || f.status !== 'accepted') throw new HttpError(404, 'not_found');
    await db.delete(friendships).where(eq(friendships.id, f.id));
    return c.body(null, 204);
  });

  /** Bloquear desfaz a amizade e qualquer pedido, nos dois sentidos. */
  r.post('/blocks', async (c) => {
    const me = c.get('profile').id;
    const { userId } = parse(userIdSchema, await jsonBody(c));
    if (userId === me) throw new HttpError(400, 'invalid_input', 'Você não pode bloquear a si mesmo.');
    const [t] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, userId));
    if (!t) throw new HttpError(404, 'not_found', 'Pessoa não encontrada.');
    await db.insert(blocks).values({ blockerId: me, blockedId: userId }).onConflictDoNothing();
    const f = await friendshipBetween(db, me, userId);
    if (f) await db.delete(friendships).where(eq(friendships.id, f.id));
    return c.body(null, 204);
  });

  r.delete('/blocks/:userId', async (c) => {
    const me = c.get('profile').id;
    const other = c.req.param('userId');
    if (!/^[0-9a-f-]{36}$/i.test(other)) throw new HttpError(404, 'not_found');
    const gone = await db.delete(blocks).where(and(eq(blocks.blockerId, me), eq(blocks.blockedId, other))).returning({ id: blocks.blockedId });
    if (!gone.length) throw new HttpError(404, 'not_found');
    return c.body(null, 204);
  });

  r.get('/me/blocks', async (c) => {
    const me = c.get('profile').id;
    const rows = await db.select(summary).from(blocks).innerJoin(profiles, eq(profiles.id, blocks.blockedId)).where(eq(blocks.blockerId, me)).limit(200);
    return c.json({ blocked: rows });
  });

  return r;
}
