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
    /** A integração Supabase da Vercel preenche POSTGRES_URL (pooler); serve de reserva para DATABASE_URL. */
    POSTGRES_URL: z.string().optional(),
    AUTH_PROVIDER: z.enum(['dev', 'supabase']).default('dev'),
    DEV_JWT_SECRET: z.string().min(16).optional(),
    ADMIN_EMAILS: z.string().optional(),
    CORS_ORIGINS: z.string().optional(),
    SUPABASE_URL: z.url().optional(),
    SUPABASE_JWT_SECRET: z.string().min(16).optional(),
    BREVO_API_KEY: z.string().optional(),
    MAIL_FROM: z.email().optional(),
    MAIL_FROM_NAME: z.string().optional(),
  })
  .superRefine((e, ctx) => {
    if (e.NODE_ENV === 'production' && e.AUTH_PROVIDER === 'dev') {
      ctx.addIssue({ code: 'custom', message: 'AUTH_PROVIDER=dev não pode rodar em produção' });
    }
    if (e.NODE_ENV === 'production' && !e.DATABASE_URL && !e.POSTGRES_URL) {
      ctx.addIssue({ code: 'custom', message: 'DATABASE_URL (ou POSTGRES_URL) é obrigatória em produção' });
    }
    if (e.BREVO_API_KEY && !e.MAIL_FROM) {
      ctx.addIssue({ code: 'custom', message: 'MAIL_FROM é obrigatório com BREVO_API_KEY (use um remetente verificado na Brevo)' });
    }
    if (e.AUTH_PROVIDER === 'supabase' && !e.SUPABASE_URL) {
      ctx.addIssue({ code: 'custom', message: 'SUPABASE_URL é obrigatória com AUTH_PROVIDER=supabase (confere o emissor e as chaves do token)' });
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
  supabaseUrl: string | undefined;
  /** Segredo JWT (HS256) do projeto Supabase; sem ele só valem tokens com chave assimétrica (JWKS). */
  supabaseJwtSecret: string | undefined;
  adminEmails: string[];
  corsOrigins: string[];
  brevoApiKey: string | undefined;
  mailFrom: string | undefined;
  mailFromName: string;
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
    databaseUrl: e.DATABASE_URL ?? e.POSTGRES_URL ?? 'pglite:./.data/dev',
    authProvider: e.AUTH_PROVIDER,
    devJwtSecret: e.DEV_JWT_SECRET,
    supabaseUrl: e.SUPABASE_URL?.replace(/\/$/, ''),
    supabaseJwtSecret: e.SUPABASE_JWT_SECRET,
    adminEmails: list(e.ADMIN_EMAILS),
    corsOrigins: list(e.CORS_ORIGINS),
    brevoApiKey: e.BREVO_API_KEY,
    mailFrom: e.MAIL_FROM,
    mailFromName: e.MAIL_FROM_NAME ?? 'Flip & Brew',
  };
}
