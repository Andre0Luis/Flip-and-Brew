import { randomUUID } from 'node:crypto';
import { createApp } from '../app';
import { devAuth, signDevToken } from '../auth/dev';
import type { Config } from '../config';
import { createDb } from '../db/client';
import { runMigrations } from '../db/migrate';

const SECRET = 'segredo-de-teste-com-mais-de-16-caracteres';

/** App completo com um Postgres embutido em memória, com as migrações aplicadas. Cada chamada é um banco novo. */
export async function testApp(over: Partial<Config> = {}) {
  const handle = await createDb('pglite:');
  await runMigrations(handle);
  const config: Config = { env: 'test', port: 0, databaseUrl: 'pglite:', authProvider: 'dev', devJwtSecret: SECRET, adminEmails: ['dono@exemplo.com'], corsOrigins: [], ...over };
  const app = createApp({ db: handle.db, auth: devAuth(SECRET), config, rateLimit: false });

  const user = async (email = `${randomUUID().slice(0, 8)}@exemplo.com`, emailVerified = true) => {
    const id = randomUUID();
    return { id, email, token: await signDevToken(SECRET, { id, email, emailVerified }) };
  };
  const call = async (path: string, o: { token?: string; method?: string; body?: unknown } = {}) => {
    const res = await app.request(path, {
      method: o.method ?? (o.body !== undefined ? 'POST' : 'GET'),
      headers: { ...(o.token ? { authorization: `Bearer ${o.token}` } : {}), ...(o.body !== undefined ? { 'content-type': 'application/json' } : {}) },
      body: o.body !== undefined ? JSON.stringify(o.body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  };
  /** Usuário com perfil já criado pelo bootstrap. */
  const member = async (email?: string, verified = true) => {
    const u = await user(email, verified);
    const r = await call('/v1/me/bootstrap', { token: u.token, method: 'POST', body: {} });
    return { ...u, bootstrap: r };
  };
  return { app, handle, call, user, member, close: () => handle.close() };
}
