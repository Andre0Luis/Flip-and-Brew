import { randomUUID } from 'node:crypto';
import { and, count, desc, eq, gte, inArray, isNull, lt, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { commentCreateSchema, postCreateSchema, uploadRequestSchema } from '../shared.js';
import type { Env } from '../auth/middleware.js';
import type { Db } from '../db/client.js';
import { friendships, notifications, postComments, postImages, postLikes, posts, profiles } from '../db/schema.js';
import { HttpError, jsonBody, parse } from '../lib/errors.js';
import { areFriends, blockedWith, isBlockedBetween } from '../lib/social.js';
import type { StorageProvider } from '../storage/provider.js';

const summary = { id: profiles.id, handle: profiles.handle, displayName: profiles.displayName, avatarPath: profiles.avatarPath };
/** Sem `id`: junto de outra tabela, o `id` dela não pode ser sobrescrito pelo da pessoa. */
const who = { handle: profiles.handle, displayName: profiles.displayName, avatarPath: profiles.avatarPath };
const READ_SECONDS = 60 * 60;
const MAX_POSTS_PER_DAY = 20;
const PAGE = 20;
const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

/** Posts, curtidas, comentários e avisos. Só o autor e os amigos dele veem um post (ADR-0024). */
export function postRoutes(db: Db, storage: StorageProvider | undefined) {
  const r = new Hono<Env>();

  const friendIds = async (me: string): Promise<string[]> => {
    const rows = await db
      .select({ a: friendships.requesterId, b: friendships.addresseeId })
      .from(friendships)
      .where(and(eq(friendships.status, 'accepted'), or(eq(friendships.requesterId, me), eq(friendships.addresseeId, me))));
    return rows.map((x) => (x.a === me ? x.b : x.a));
  };

  /** O post, se eu posso vê-lo; senão 404 (sem revelar que existe). */
  const visiblePost = async (me: string, id: string) => {
    if (!isUuid(id)) throw new HttpError(404, 'not_found');
    const [p] = await db.select().from(posts).where(eq(posts.id, id));
    if (!p) throw new HttpError(404, 'not_found');
    if (p.authorId !== me && ((await isBlockedBetween(db, me, p.authorId)) || !(await areFriends(db, me, p.authorId)))) throw new HttpError(404, 'not_found');
    return p;
  };

  /** Monta os cartões: autor, fotos com link assinado, curtidas e comentários. */
  const cards = async (me: string, list: (typeof posts.$inferSelect)[]) => {
    if (!list.length) return [];
    const ids = list.map((p) => p.id);
    const authors = await db.select(summary).from(profiles).where(inArray(profiles.id, [...new Set(list.map((p) => p.authorId))]));
    const imgs = await db.select().from(postImages).where(inArray(postImages.postId, ids)).orderBy(postImages.position);
    const urls = storage ? await storage.signRead(imgs.map((i) => i.path), READ_SECONDS) : new Map<string, string>();
    const likes = await db.select({ postId: postLikes.postId, n: count() }).from(postLikes).where(inArray(postLikes.postId, ids)).groupBy(postLikes.postId);
    const mine = await db.select({ postId: postLikes.postId }).from(postLikes).where(and(inArray(postLikes.postId, ids), eq(postLikes.userId, me)));
    const comments = await db.select({ postId: postComments.postId, n: count() }).from(postComments).where(inArray(postComments.postId, ids)).groupBy(postComments.postId);
    const likeN = new Map(likes.map((x) => [x.postId, Number(x.n)]));
    const commentN = new Map(comments.map((x) => [x.postId, Number(x.n)]));
    const liked = new Set(mine.map((x) => x.postId));
    return list.map((p) => ({
      id: p.id,
      title: p.title,
      caption: p.caption,
      createdAt: p.createdAt,
      author: authors.find((a) => a.id === p.authorId) ?? null,
      images: imgs.filter((i) => i.postId === p.id && urls.has(i.path)).map((i) => ({ url: urls.get(i.path)! })),
      likeCount: likeN.get(p.id) ?? 0,
      likedByMe: liked.has(p.id),
      commentCount: commentN.get(p.id) ?? 0,
      mine: p.authorId === me,
    }));
  };

  r.post('/posts/uploads', async (c) => {
    const me = c.get('profile').id;
    const { count: n } = parse(uploadRequestSchema, await jsonBody(c));
    if (!storage) throw new HttpError(501, 'storage_unavailable', 'O envio de fotos ainda não está configurado.');
    const uploads = [];
    for (let i = 0; i < n; i++) {
      const path = `${me}/${randomUUID()}.jpg`;
      uploads.push({ path, url: await storage.signUpload(path) });
    }
    return c.json({ uploads });
  });

  r.post('/posts', async (c) => {
    const me = c.get('profile').id;
    const body = parse(postCreateSchema, await jsonBody(c));
    const images = body.images ?? [];
    if (images.some((p) => !p.startsWith(`${me}/`))) throw new HttpError(400, 'invalid_input', 'Foto que não é sua.');
    const [{ n }] = await db.select({ n: count() }).from(posts).where(and(eq(posts.authorId, me), gte(posts.createdAt, new Date(Date.now() - 86_400_000))));
    if (Number(n) >= MAX_POSTS_PER_DAY) throw new HttpError(429, 'too_many_posts', 'Limite de posts por dia.');
    const [p] = await db.insert(posts).values({ authorId: me, title: body.title, caption: body.caption || null }).returning();
    if (images.length) await db.insert(postImages).values(images.map((path, position) => ({ postId: p.id, position, path })));
    const [card] = await cards(me, [p]);
    return c.json({ post: card }, 201);
  });

  /** Meus posts e os dos amigos, do mais novo para o mais velho. `before` é o `createdAt` (ISO) do último da página. */
  r.get('/feed', async (c) => {
    const me = c.get('profile').id;
    const hidden = await blockedWith(db, me);
    const ids = [me, ...(await friendIds(me)).filter((id) => !hidden.has(id))];
    const before = c.req.query('before');
    const cursor = before && !Number.isNaN(Date.parse(before)) ? new Date(before) : null;
    const list = await db
      .select()
      .from(posts)
      .where(and(inArray(posts.authorId, ids), cursor ? lt(posts.createdAt, cursor) : undefined))
      .orderBy(desc(posts.createdAt))
      .limit(PAGE);
    const items = await cards(me, list);
    return c.json({ posts: items, nextBefore: list.length === PAGE ? list[list.length - 1].createdAt : null });
  });

  r.delete('/posts/:id', async (c) => {
    const me = c.get('profile');
    const p = await visiblePost(me.id, c.req.param('id'));
    if (p.authorId !== me.id && me.role !== 'admin' && me.role !== 'moderator') throw new HttpError(403, 'forbidden');
    const imgs = await db.select({ path: postImages.path }).from(postImages).where(eq(postImages.postId, p.id));
    await db.delete(posts).where(eq(posts.id, p.id));
    if (storage && imgs.length) await storage.remove(imgs.map((i) => i.path)).catch(() => {});
    return c.body(null, 204);
  });

  r.post('/posts/:id/like', async (c) => {
    const me = c.get('profile').id;
    const p = await visiblePost(me, c.req.param('id'));
    const inserted = await db.insert(postLikes).values({ postId: p.id, userId: me }).onConflictDoNothing().returning();
    if (inserted.length && p.authorId !== me) {
      await db.insert(notifications).values({ userId: p.authorId, actorId: me, kind: 'like', postId: p.id });
    }
    return c.body(null, 204);
  });

  r.delete('/posts/:id/like', async (c) => {
    const me = c.get('profile').id;
    const p = await visiblePost(me, c.req.param('id'));
    await db.delete(postLikes).where(and(eq(postLikes.postId, p.id), eq(postLikes.userId, me)));
    // Descurtir apaga o aviso que ainda não foi lido (não faz sentido avisar de uma curtida desfeita).
    await db.delete(notifications).where(and(eq(notifications.postId, p.id), eq(notifications.actorId, me), eq(notifications.kind, 'like'), isNull(notifications.readAt)));
    return c.body(null, 204);
  });

  r.get('/posts/:id/comments', async (c) => {
    const me = c.get('profile').id;
    const p = await visiblePost(me, c.req.param('id'));
    const hidden = await blockedWith(db, me);
    const rows = await db
      .select({ id: postComments.id, body: postComments.body, createdAt: postComments.createdAt, authorId: postComments.authorId, ...who })
      .from(postComments)
      .innerJoin(profiles, eq(profiles.id, postComments.authorId))
      .where(eq(postComments.postId, p.id))
      .orderBy(postComments.createdAt)
      .limit(200);
    return c.json({
      comments: rows
        .filter((x) => !hidden.has(x.authorId))
        .map((x) => ({ id: x.id, body: x.body, createdAt: x.createdAt, author: { id: x.authorId, handle: x.handle, displayName: x.displayName, avatarPath: x.avatarPath }, mine: x.authorId === me })),
    });
  });

  r.post('/posts/:id/comments', async (c) => {
    const me = c.get('profile').id;
    const p = await visiblePost(me, c.req.param('id'));
    const { body } = parse(commentCreateSchema, await jsonBody(c));
    const [row] = await db.insert(postComments).values({ postId: p.id, authorId: me, body }).returning();
    if (p.authorId !== me) await db.insert(notifications).values({ userId: p.authorId, actorId: me, kind: 'comment', postId: p.id });
    return c.json({ comment: { id: row.id, body: row.body, createdAt: row.createdAt } }, 201);
  });

  /** Apaga um comentário: quem escreveu, o dono do post ou a moderação. */
  r.delete('/comments/:id', async (c) => {
    const me = c.get('profile');
    const id = c.req.param('id');
    if (!isUuid(id)) throw new HttpError(404, 'not_found');
    const [row] = await db.select({ id: postComments.id, authorId: postComments.authorId, postAuthor: posts.authorId }).from(postComments).innerJoin(posts, eq(posts.id, postComments.postId)).where(eq(postComments.id, id));
    if (!row) throw new HttpError(404, 'not_found');
    if (row.authorId !== me.id && row.postAuthor !== me.id && me.role !== 'admin' && me.role !== 'moderator') throw new HttpError(404, 'not_found');
    await db.delete(postComments).where(eq(postComments.id, id));
    return c.body(null, 204);
  });

  r.get('/me/notifications', async (c) => {
    const me = c.get('profile').id;
    const hidden = await blockedWith(db, me);
    const rows = await db
      .select({ id: notifications.id, kind: notifications.kind, postId: notifications.postId, createdAt: notifications.createdAt, readAt: notifications.readAt, postTitle: posts.title, actorId: notifications.actorId, ...who })
      .from(notifications)
      .innerJoin(profiles, eq(profiles.id, notifications.actorId))
      .leftJoin(posts, eq(posts.id, notifications.postId))
      .where(eq(notifications.userId, me))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    const list = rows
      .filter((x) => !hidden.has(x.actorId))
      .map((x) => ({ id: x.id, kind: x.kind, postId: x.postId, postTitle: x.postTitle, createdAt: x.createdAt, read: !!x.readAt, actor: { id: x.actorId, handle: x.handle, displayName: x.displayName, avatarPath: x.avatarPath } }));
    return c.json({ notifications: list, unread: list.filter((x) => !x.read).length });
  });

  r.post('/me/notifications/read', async (c) => {
    const me = c.get('profile').id;
    await db.update(notifications).set({ readAt: sql`now()` }).where(and(eq(notifications.userId, me), isNull(notifications.readAt)));
    return c.body(null, 204);
  });

  return r;
}
