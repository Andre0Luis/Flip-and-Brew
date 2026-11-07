import { and, asc, eq, ilike, isNotNull, isNull, ne } from 'drizzle-orm';
import { Hono } from 'hono';
import { handleSchema, searchQuerySchema } from '../shared';
import type { Env } from '../auth/middleware';
import type { Db } from '../db/client';
import { coffeePrefs, privacySettings, profiles } from '../db/schema';
import { HttpError, parse } from '../lib/errors';
import { blockedWith, isBlockedBetween, relationBetween } from '../lib/social';

/** Busca e perfil público. O perfil é visível para todo mundo que está logado; só quem bloqueou (ou foi bloqueado) some. */
export function userRoutes(db: Db) {
  const r = new Hono<Env>();

  /** Busca pelo começo do apelido. Só aparece quem já escolheu um apelido. Nunca devolve e-mail. */
  r.get('/users/search', async (c) => {
    const me = c.get('profile').id;
    const q = parse(searchQuerySchema, c.req.query('q') ?? '');
    const rows = await db
      .select({ id: profiles.id, handle: profiles.handle, displayName: profiles.displayName, avatarPath: profiles.avatarPath })
      .from(profiles)
      .where(and(ilike(profiles.handle, `${q.replace(/[\\%_]/g, '\\$&')}%`), isNotNull(profiles.handle), isNull(profiles.bannedAt), ne(profiles.id, me)))
      .orderBy(asc(profiles.handle))
      .limit(50);
    const hidden = await blockedWith(db, me);
    return c.json({ users: rows.filter((u) => !hidden.has(u.id)).slice(0, 20) });
  });

  r.get('/users/:handle', async (c) => {
    const me = c.get('profile').id;
    const handle = parse(handleSchema, c.req.param('handle'));
    const [p] = await db.select().from(profiles).where(and(eq(profiles.handle, handle), isNull(profiles.bannedAt)));
    if (!p || (p.id !== me && (await isBlockedBetween(db, me, p.id)))) throw new HttpError(404, 'not_found', 'Pessoa não encontrada.');
    const [privacy] = await db.select().from(privacySettings).where(eq(privacySettings.userId, p.id));
    const showPrefs = p.id === me || !!privacy?.showCoffeePrefs;
    const [prefs] = showPrefs ? await db.select().from(coffeePrefs).where(eq(coffeePrefs.userId, p.id)) : [];
    return c.json({
      profile: { id: p.id, handle: p.handle, displayName: p.displayName, avatarPath: p.avatarPath, bio: p.bio, country: p.country, joinedAt: p.createdAt },
      relation: await relationBetween(db, me, p.id),
      prefs: prefs ? { favoriteCoffees: prefs.favoriteCoffees, methods: prefs.methods, roast: prefs.roast, flavors: prefs.flavors } : null,
    });
  });

  return r;
}
