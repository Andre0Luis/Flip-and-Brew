import { eq } from 'drizzle-orm';
import type { MiddlewareHandler } from 'hono';
import { type Role } from '../shared';
import type { Db } from '../db/client';
import { profiles, type Profile } from '../db/schema';
import { HttpError } from '../lib/errors';
import type { AuthProvider, Identity } from './provider';

export type Env = { Variables: { identity: Identity; profile: Profile } };

/** Exige um token válido. Não exige perfil: é o que o `bootstrap` usa, pois o perfil nasce nele. */
export const requireIdentity = (auth: AuthProvider): MiddlewareHandler<Env> => async (c, next) => {
  const h = c.req.header('authorization') ?? '';
  const token = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  const who = token ? await auth.verify(token) : null;
  if (!who) throw new HttpError(401, 'unauthorized', 'Entre para continuar.');
  c.set('identity', who);
  await next();
};

/** Exige perfil existente e não banido. A role vem do banco a cada pedido, nunca do token. */
export const requireProfile = (db: Db): MiddlewareHandler<Env> => async (c, next) => {
  const [p] = await db.select().from(profiles).where(eq(profiles.id, c.get('identity').id));
  if (!p) throw new HttpError(404, 'no_profile', 'Conclua o cadastro antes.');
  if (p.bannedAt) throw new HttpError(403, 'banned', 'Conta suspensa.');
  c.set('profile', p);
  await next();
};

export const requireRole = (...roles: Role[]): MiddlewareHandler<Env> => async (c, next) => {
  if (!roles.includes(c.get('profile').role)) throw new HttpError(403, 'forbidden', 'Sem permissão.');
  await next();
};
