import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { loadConfig } from '../config.js';
import { seedQuotes } from '../seed/quotes-data.js';
import { createDb, type DbHandle } from './client.js';
import { dailyQuotes } from './schema.js';

/** Grava as frases de `src/seed/quotes-data.ts`. Pode rodar de novo: atualiza o texto e a ordem, não mexe em `active`. */
export async function seedDailyQuotes(h: DbHandle): Promise<number> {
  const rows = seedQuotes();
  for (const q of rows) {
    await h.db
      .insert(dailyQuotes)
      .values({ id: q.id, position: q.position, content: q.content })
      .onConflictDoUpdate({ target: dailyQuotes.id, set: { position: q.position, content: q.content, updatedAt: sql`now()` } });
  }
  return rows.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const cfg = loadConfig();
  const h = await createDb(process.env.MIGRATE_DATABASE_URL || cfg.databaseUrl);
  const n = await seedDailyQuotes(h);
  await h.close();
  console.log(`${n} frases gravadas.`);
}
