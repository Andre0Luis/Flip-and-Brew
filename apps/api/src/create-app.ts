import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { requireIdentity, requireProfile, requireRole, type Env } from './auth/middleware.js';
import type { AuthProvider } from './auth/provider.js';
import type { Config } from './config.js';
import type { Db } from './db/client.js';
import type { AuthAdmin } from './auth/admin.js';
import type { EmailProvider } from './email/provider.js';
import { HttpError } from './lib/errors.js';
import { rateLimit } from './lib/rate-limit.js';
import { SWAGGER_UI_VERSION, buildOpenApi } from './openapi.js';
import { adminRoutes } from './routes/admin.js';
import { coffeeRoutes } from './routes/coffees.js';
import { friendRoutes } from './routes/friends.js';
import { meRoutes } from './routes/me.js';
import { pagesRoutes } from './routes/pages.js';
import { postRoutes } from './routes/posts.js';
import { quoteRoutes } from './routes/quotes.js';
import { rankingRoutes } from './routes/rankings.js';
import { snapshotRoutes } from './routes/snapshot.js';
import type { StorageProvider } from './storage/provider.js';
import { userRoutes } from './routes/users.js';

export type AppDeps = { db: Db; auth: AuthProvider; email: EmailProvider; config: Config; authAdmin?: AuthAdmin; storage?: StorageProvider; rateLimit?: { windowMs: number; max: number } | false };

/** Monta a API. Recebe tudo de fora (banco, login, configuração) para rodar igual no servidor local, na Vercel e nos testes. */
export function createApp({ db, auth, email, config, authAdmin, storage, rateLimit: rl = { windowMs: 60_000, max: 120 } }: AppDeps) {
  const app = new Hono<Env>();

  app.use(secureHeaders());
  if (config.corsOrigins.length) app.use(cors({ origin: config.corsOrigins, allowHeaders: ['authorization', 'content-type'] }));
  app.use(bodyLimit({ maxSize: 1024 * 1024, onError: () => { throw new HttpError(413, 'payload_too_large', 'Corpo grande demais.'); } }));

  app.get('/health', (c) => c.json({ ok: true }));

  app.route('/', pagesRoutes(config));

  // Documentação (Swagger UI). Fora de /v1, sem login: o corpo é só a descrição das rotas; o "Authorize" da UI recebe o token.
  if (config.docsEnabled) {
    const spec = buildOpenApi();
    app.get('/openapi.json', (c) => c.json(spec));
    app.get('/docs', swaggerUI({ url: '/openapi.json', version: SWAGGER_UI_VERSION, persistAuthorization: true }));
  }

  const v1 = new Hono<Env>();
  if (rl) v1.use(rateLimit({ ...rl, key: (c) => c.req.header('authorization')?.slice(-24) ?? c.req.header('x-forwarded-for') ?? 'anon' }));
  v1.use(requireIdentity(auth));
  const withProfile = requireProfile(db);
  // No Hono o middleware só vale para o que é registrado depois dele; por isso vem tudo antes das rotas.
  // `/me/bootstrap` cria o perfil, então é a única rota logada que não exige perfil.
  v1.use('/me', withProfile);
  v1.use('/me/*', async (c, next) => (c.req.path.endsWith('/me/bootstrap') ? next() : withProfile(c, next)));
  v1.use('/admin/*', withProfile, requireRole('admin'));
  // Amizade, bloqueio e perfis de outras pessoas: todas exigem perfil.
  v1.use('/friend-requests', withProfile);
  v1.use('/friend-requests/*', withProfile);
  v1.use('/friends/*', withProfile);
  v1.use('/blocks', withProfile);
  v1.use('/blocks/*', withProfile);
  v1.use('/users/*', withProfile);
  // Posts, comentários e ranking.
  v1.use('/posts', withProfile);
  v1.use('/posts/*', withProfile);
  v1.use('/comments/*', withProfile);
  v1.use('/feed', withProfile);
  v1.use('/rankings', withProfile);
  v1.route('/', meRoutes(db, config, email, authAdmin, storage));
  v1.route('/', snapshotRoutes(db));
  v1.route('/', coffeeRoutes(db));
  v1.route('/', friendRoutes(db));
  v1.route('/', userRoutes(db));
  v1.route('/', adminRoutes(db));
  v1.route('/', postRoutes(db, storage));
  v1.route('/', rankingRoutes(db));
  v1.route('/', quoteRoutes(db));
  app.route('/v1', v1);

  app.notFound((c) => c.json({ error: { code: 'not_found', message: 'Rota não encontrada.' } }, 404));
  app.onError((e, c) => {
    if (e instanceof HttpError) return c.json({ error: { code: e.code, message: e.message, ...e.extra } }, e.status);
    console.error(e);
    return c.json({ error: { code: 'internal', message: 'Erro interno.' } }, 500);
  });
  return app;
}
