import { serve } from '@hono/node-server';
import { createApp } from './app';
import { devAuth } from './auth/dev';
import { loadConfig } from './config';
import { createDb } from './db/client';
import { runMigrations } from './db/migrate';

const config = loadConfig();
if (config.authProvider !== 'dev' || !config.devJwtSecret) {
  throw new Error('Só o login de desenvolvimento está pronto; o do Supabase entra na última fase (ADR-0024).');
}
const handle = await createDb(config.databaseUrl);
// Em desenvolvimento a base se atualiza sozinha; em produção as migrações rodam pelo CI antes do deploy.
if (config.env !== 'production') await runMigrations(handle);

const app = createApp({ db: handle.db, auth: devAuth(config.devJwtSecret), config });
serve({ fetch: app.fetch, port: config.port }, (i) => console.log(`API em http://localhost:${i.port} (${handle.kind})`));
