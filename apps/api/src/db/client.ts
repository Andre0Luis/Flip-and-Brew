import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';
import { SUPABASE_CA } from './supabase-ca';

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
export type DbHandle = { db: Db; close: () => Promise<void>; kind: 'pg' | 'pglite'; raw: unknown };

/** Opções do Pool. Banco do Supabase: TLS verificado contra as CAs do Supabase (e `sslmode` sai da URL, que senão sobrescreveria isto). */
export type PoolOpts = { connectionString: string; max: number; ssl?: { ca: string; rejectUnauthorized: boolean } };
export function poolConfig(url: string): PoolOpts {
  // Em serverless cada instância abre poucas conexões; o pooler do Supabase faz o resto.
  const base = { max: 3 };
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { ...base, connectionString: url };
  }
  if (!/\.supabase\.(com|co)$/.test(u.hostname)) return { ...base, connectionString: url };
  for (const k of ['sslmode', 'uselibpqcompat']) u.searchParams.delete(k);
  return { ...base, connectionString: u.toString(), ssl: { ca: SUPABASE_CA, rejectUnauthorized: true } };
}

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
  const pool = new Pool(poolConfig(url));
  return { db: drizzlePg(pool, { schema }) as unknown as Db, close: () => pool.end(), kind: 'pg', raw: pool };
}
