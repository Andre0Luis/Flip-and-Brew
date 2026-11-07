import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { requireIdentity, requireProfile, requireRole, type Env } from './auth/middleware';
import type { AuthProvider } from './auth/provider';
import type { Config } from './config';
import type { Db } from './db/client';
import type { EmailProvider } from './email/provider';
import { HttpError } from './lib/errors';
import { rateLimit } from './lib/rate-limit';
import { adminRoutes } from './routes/admin';
import { coffeeRoutes } from './routes/coffees';
import { meRoutes } from './routes/me';
import { snapshotRoutes } from './routes/snapshot';

export type AppDeps = { db: Db; auth: AuthProvider; email: EmailProvider; config: Config; rateLimit?: { windowMs: number; max: number } | false };

/** Monta a API. Recebe tudo de fora (banco, login, configuração) para rodar igual no servidor local, na Vercel e nos testes. */
export function createApp({ db, auth, email, config, rateLimit: rl = { windowMs: 60_000, max: 120 } }: AppDeps) {
  const app = new Hono<Env>();

  app.use(secureHeaders());
  if (config.corsOrigins.length) app.use(cors({ origin: config.corsOrigins, allowHeaders: ['authorization', 'content-type'] }));
  app.use(bodyLimit({ maxSize: 1024 * 1024, onError: () => { throw new HttpError(413, 'payload_too_large', 'Corpo grande demais.'); } }));

  app.get('/health', (c) => c.json({ ok: true }));

  const v1 = new Hono<Env>();
  if (rl) v1.use(rateLimit({ ...rl, key: (c) => c.req.header('authorization')?.slice(-24) ?? c.req.header('x-forwarded-for') ?? 'anon' }));
  v1.use(requireIdentity(auth));
  const withProfile = requireProfile(db);
  // No Hono o middleware só vale para o que é registrado depois dele; por isso vem tudo antes das rotas.
  // `/me/bootstrap` cria o perfil, então é a única rota logada que não exige perfil.
  v1.use('/me', withProfile);
  v1.use('/me/*', async (c, next) => (c.req.path.endsWith('/me/bootstrap') ? next() : withProfile(c, next)));
  v1.use('/admin/*', withProfile, requireRole('admin'));
  v1.route('/', meRoutes(db, config, email));
  v1.route('/', snapshotRoutes(db));
  v1.route('/', coffeeRoutes(db));
  v1.route('/', adminRoutes(db));
  app.route('/v1', v1);

  app.notFound((c) => c.json({ error: { code: 'not_found', message: 'Rota não encontrada.' } }, 404));
  app.onError((e, c) => {
    if (e instanceof HttpError) return c.json({ error: { code: e.code, message: e.message, ...e.extra } }, e.status);
    console.error(e);
    return c.json({ error: { code: 'internal', message: 'Erro interno.' } }, 500);
  });
  return app;
}
