// Servidor local (npm run dev). Na Vercel a entrada é src/index.ts; este arquivo NÃO se chama server.ts de propósito,
// porque a Vercel procura esse nome como entrada do app.
import { serve } from '@hono/node-server';
import { buildApp } from './build-app';
import { runMigrations } from './db/migrate';

const { app, handle, config } = await buildApp();
// Em desenvolvimento a base se atualiza sozinha; em produção as migrações rodam fora (npm run db:migrate).
if (config.env !== 'production') await runMigrations(handle);
serve({ fetch: app.fetch, port: config.port }, (i) => console.log(`API em http://localhost:${i.port} (${handle.kind}, login: ${config.authProvider})`));
