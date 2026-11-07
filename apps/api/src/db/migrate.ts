import { fileURLToPath } from 'node:url';
import { loadConfig } from '../config';
import { createDb, type DbHandle } from './client';

const folder = fileURLToPath(new URL('../../drizzle', import.meta.url));

/** Aplica as migrações versionadas em `apps/api/drizzle`. Só avança, nunca apaga dados. */
export async function runMigrations(h: DbHandle): Promise<void> {
  if (h.kind === 'pglite') {
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    await migrate(h.db as never, { migrationsFolder: folder });
  } else {
    const { migrate } = await import('drizzle-orm/node-postgres/migrator');
    await migrate(h.db as never, { migrationsFolder: folder });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const cfg = loadConfig();
  // Migrações pedem conexão direta (sessão); o pooler em modo transação serve ao runtime. MIGRATE_DATABASE_URL tem prioridade.
  const h = await createDb(process.env.MIGRATE_DATABASE_URL || cfg.databaseUrl);
  await runMigrations(h);
  await h.close();
  console.log('Migrações aplicadas.');
}
