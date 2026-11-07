import { createApp } from './create-app';
import { devAuth } from './auth/dev';
import type { AuthProvider } from './auth/provider';
import { supabaseAuth } from './auth/supabase';
import { loadConfig, type Config } from './config';
import { createDb, type DbHandle } from './db/client';
import { brevoEmail } from './email/brevo';
import { consoleEmail } from './email/console';

export function authFor(config: Config): AuthProvider {
  if (config.authProvider === 'supabase') return supabaseAuth({ url: config.supabaseUrl!, jwtSecret: config.supabaseJwtSecret });
  return devAuth(config.devJwtSecret!);
}

/** Monta tudo a partir do ambiente. Usado pelo servidor local (`local.ts`) e pela Vercel (`index.ts`). */
export async function buildApp(env: Record<string, string | undefined> = process.env): Promise<{ app: ReturnType<typeof createApp>; handle: DbHandle; config: Config }> {
  const config = loadConfig(env);
  const handle = await createDb(config.databaseUrl);
  const email = config.brevoApiKey && config.mailFrom ? brevoEmail({ apiKey: config.brevoApiKey, fromEmail: config.mailFrom, fromName: config.mailFromName }) : consoleEmail();
  return { app: createApp({ db: handle.db, auth: authFor(config), email, config }), handle, config };
}
