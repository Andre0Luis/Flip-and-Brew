import { z } from 'zod';

const list = (v: string | undefined) =>
  (v ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(8787),
    DATABASE_URL: z.string().optional(),
    AUTH_PROVIDER: z.enum(['dev', 'supabase']).default('dev'),
    DEV_JWT_SECRET: z.string().min(16).optional(),
    ADMIN_EMAILS: z.string().optional(),
    CORS_ORIGINS: z.string().optional(),
  })
  .superRefine((e, ctx) => {
    if (e.NODE_ENV === 'production' && e.AUTH_PROVIDER === 'dev') {
      ctx.addIssue({ code: 'custom', message: 'AUTH_PROVIDER=dev não pode rodar em produção' });
    }
    if (e.NODE_ENV === 'production' && !e.DATABASE_URL) {
      ctx.addIssue({ code: 'custom', message: 'DATABASE_URL é obrigatória em produção' });
    }
    if (e.AUTH_PROVIDER === 'dev' && !e.DEV_JWT_SECRET) {
      ctx.addIssue({ code: 'custom', message: 'DEV_JWT_SECRET (16+ caracteres) é obrigatória com AUTH_PROVIDER=dev' });
    }
  });

export type Config = {
  env: 'development' | 'test' | 'production';
  port: number;
  databaseUrl: string;
  authProvider: 'dev' | 'supabase';
  devJwtSecret: string | undefined;
  adminEmails: string[];
  corsOrigins: string[];
};

/** Lê e valida o ambiente. Falha cedo, com a lista do que está errado, em vez de subir meio configurado. */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const r = schema.safeParse(env);
  if (!r.success) {
    throw new Error(`Configuração inválida:\n${r.error.issues.map((i) => `- ${i.path.join('.') || 'env'}: ${i.message}`).join('\n')}`);
  }
  const e = r.data;
  return {
    env: e.NODE_ENV,
    port: e.PORT,
    databaseUrl: e.DATABASE_URL ?? 'pglite:./.data/dev',
    authProvider: e.AUTH_PROVIDER,
    devJwtSecret: e.DEV_JWT_SECRET,
    adminEmails: list(e.ADMIN_EMAILS),
    corsOrigins: list(e.CORS_ORIGINS),
  };
}
