import { and, eq, or } from 'drizzle-orm';
import type { FriendshipRelation } from '@flipandbrew/shared';
import type { Db } from '../db/client';
import { blocks, friendships } from '../db/schema';

/** Existe bloqueio em qualquer direção entre as duas pessoas? Nesse caso uma não enxerga a outra. */
export async function isBlockedBetween(db: Db, a: string, b: string): Promise<boolean> {
  const rows = await db
    .select({ blockerId: blocks.blockerId })
    .from(blocks)
    .where(or(and(eq(blocks.blockerId, a), eq(blocks.blockedId, b)), and(eq(blocks.blockerId, b), eq(blocks.blockedId, a))));
  return rows.length > 0;
}

/** Todos que bloquearam `me` ou foram bloqueados por `me`. */
export async function blockedWith(db: Db, me: string): Promise<Set<string>> {
  const rows = await db.select().from(blocks).where(or(eq(blocks.blockerId, me), eq(blocks.blockedId, me)));
  return new Set(rows.map((r) => (r.blockerId === me ? r.blockedId : r.blockerId)));
}

/** A linha de amizade entre duas pessoas, em qualquer direção. */
export async function friendshipBetween(db: Db, a: string, b: string) {
  const [row] = await db
    .select()
    .from(friendships)
    .where(or(and(eq(friendships.requesterId, a), eq(friendships.addresseeId, b)), and(eq(friendships.requesterId, b), eq(friendships.addresseeId, a))));
  return row;
}

export async function relationBetween(db: Db, me: string, other: string): Promise<FriendshipRelation> {
  if (me === other) return 'self';
  const f = await friendshipBetween(db, me, other);
  if (!f) return 'none';
  if (f.status === 'accepted') return 'friends';
  return f.requesterId === me ? 'request_sent' : 'request_received';
}

export async function areFriends(db: Db, a: string, b: string): Promise<boolean> {
  return (await relationBetween(db, a, b)) === 'friends';
}
