import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
export type DbHandle = { db: Db; close: () => Promise<void>; kind: 'pg' | 'pglite'; raw: unknown };

/**
 * `postgres://...` usa o Postgres de verdade (Docker local, ou o pooler do Supabase).
 * `pglite:` (memória) ou `pglite:./pasta` usa o Postgres embutido, sem Docker: para testes e desenvolvimento rápido.
 */
export async function createDb(url: string): Promise<DbHandle> {
  if (url.startsWith('pglite:')) {
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const dir = url.slice('pglite:'.length);
    const client = dir ? new PGlite(dir) : new PGlite();
    await client.waitReady;
    return { db: drizzle(client, { schema }) as unknown as Db, close: () => client.close(), kind: 'pglite', raw: client };
  }
  const { Pool } = await import('pg');
  // Em serverless cada instância abre poucas conexões; o pooler do Supabase faz o resto.
  const pool = new Pool({ connectionString: url, max: 3 });
  return { db: drizzlePg(pool, { schema }) as unknown as Db, close: () => pool.end(), kind: 'pg', raw: pool };
}
