import { createApp } from './create-app.js';
import { devAuth } from './auth/dev.js';
import type { AuthProvider } from './auth/provider.js';
import { supabaseAdmin } from './auth/admin.js';
import { supabaseAuth } from './auth/supabase.js';
import { memoryStorage } from './storage/memory.js';
import { supabaseStorage } from './storage/supabase.js';
import { loadConfig, type Config } from './config.js';
import { createDb, type DbHandle } from './db/client.js';
import { brevoEmail } from './email/brevo.js';
import { consoleEmail } from './email/console.js';

export function authFor(config: Config): AuthProvider {
  if (config.authProvider === 'supabase') return supabaseAuth({ url: config.supabaseUrl!, jwtSecret: config.supabaseJwtSecret });
  return devAuth(config.devJwtSecret!);
}

/** Monta tudo a partir do ambiente. Usado pelo servidor local (`local.ts`) e pela Vercel (`index.ts`). */
export async function buildApp(env: Record<string, string | undefined> = process.env): Promise<{ app: ReturnType<typeof createApp>; handle: DbHandle; config: Config }> {
  const config = loadConfig(env);
  const handle = await createDb(config.databaseUrl);
  const email = config.brevoApiKey && config.mailFrom ? brevoEmail({ apiKey: config.brevoApiKey, fromEmail: config.mailFrom, fromName: config.mailFromName }) : consoleEmail();
  const authAdmin = config.authProvider === 'supabase' && config.supabaseUrl && config.supabaseServiceRoleKey ? supabaseAdmin({ url: config.supabaseUrl, serviceRoleKey: config.supabaseServiceRoleKey }) : undefined;
  // Fotos dos posts: Supabase Storage em produção; fora dele, links de mentira (sem envio de verdade).
  const storage =
    config.supabaseUrl && config.supabaseServiceRoleKey
      ? supabaseStorage({ url: config.supabaseUrl, serviceRoleKey: config.supabaseServiceRoleKey })
      : config.env !== 'production'
        ? memoryStorage()
        : undefined;
  return { app: createApp({ db: handle.db, auth: authFor(config), email, config, authAdmin, storage }), handle, config };
}
