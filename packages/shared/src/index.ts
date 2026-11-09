// Contratos da API compartilhados com o app: esquemas Zod e regras puras (sem dependência de servidor nem de React Native).
import { z } from 'zod';

/** Idade mínima para ter conta (decisão do dono, ADR-0024). Menos de 18 pede revisão jurídica (LGPD). */
export const MIN_AGE = 18;

export const ROLES = ['user', 'moderator', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const PLATFORMS = ['android', 'ios', 'web'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const LANGUAGES = ['pt', 'en', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];

/** "Ativo agora": visto nos últimos 5 minutos. */
export const ACTIVE_NOW_MS = 5 * 60_000;

/** Idade completa em `now`, a partir de "AAAA-MM-DD". Devolve null se a data não existe ou está no futuro. */
export function ageOn(birthDate: string, now = Date.now()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const born = new Date(Date.UTC(y, mo - 1, d));
  if (born.getUTCFullYear() !== y || born.getUTCMonth() !== mo - 1 || born.getUTCDate() !== d) return null;
  const today = new Date(now);
  if (born.getTime() > today.getTime()) return null;
  let age = today.getUTCFullYear() - y;
  const before = today.getUTCMonth() < mo - 1 || (today.getUTCMonth() === mo - 1 && today.getUTCDate() < d);
  if (before) age -= 1;
  return age;
}

export const handleSchema = z.string().regex(/^[a-z0-9_]{3,20}$/, 'handle: 3 a 20 letras minúsculas, números ou _');

export const profilePatchSchema = z
  .object({
    displayName: z.string().trim().min(1).max(60),
    handle: handleSchema,
    bio: z.string().max(280),
    country: z.string().length(2).toUpperCase(),
    birthDate: z.string(),
  })
  .partial()
  .strict();

export const coffeePrefsSchema = z
  .object({
    favoriteCoffees: z.array(z.string().max(40)).max(10),
    methods: z.array(z.string().max(40)).max(10),
    roast: z.string().max(20).nullable(),
    flavors: z.array(z.string().max(40)).max(10),
  })
  .partial()
  .strict();

/** O perfil é visível para todos; posts, imagens e mensagens da comunidade só entre amigos (ADR-0024). Só há estas duas escolhas. */
export const privacyPatchSchema = z
  .object({
    showInGlobalRanking: z.boolean(),
    showCoffeePrefs: z.boolean(),
  })
  .partial()
  .strict();

/** Corpo do bootstrap. Opcional: o idioma escolhe o texto do e-mail de boas-vindas. */
export const bootstrapSchema = z.object({ language: z.enum(LANGUAGES).optional() }).strict();

/** Quantos pedidos de amizade enviados e ainda sem resposta uma pessoa pode ter (contra spam). */
export const MAX_PENDING_REQUESTS = 50;

export const userIdSchema = z.object({ userId: z.uuid() }).strict();

/** Busca por apelido (começo do apelido), no mínimo 2 letras. */
export const searchQuerySchema = z.string().trim().toLowerCase().regex(/^[a-z0-9_]{2,20}$/, 'busca: 2 a 20 letras minúsculas, números ou _');

export type FriendshipRelation = 'self' | 'none' | 'friends' | 'request_sent' | 'request_received';

export const pingSchema = z.object({ platform: z.enum(PLATFORMS), appVersion: z.string().max(20) }).strict();

/** O backup é o mesmo documento que hoje vai para o Firestore (`SnapshotData`); o servidor só guarda e devolve. */
export const snapshotPutSchema = z
  .object({ v: z.literal(1), updatedAt: z.number().int().positive(), data: z.record(z.string(), z.unknown()) })
  .strict();

export const coffeeLogSchema = z
  .object({
    at: z.number().int().positive().optional(),
    kind: z.string().trim().min(1).max(40),
    method: z.string().trim().max(40).optional(),
    sizeMl: z.number().int().min(10).max(2000).optional(),
    note: z.string().trim().max(200).optional(),
  })
  .strict();

/** Fotos por post (pedido do dono). O app reduz e compacta antes de enviar. */
export const MAX_POST_IMAGES = 3;
/** Caminho de uma foto no armazenamento: `<id de quem postou>/<uuid>.jpg`. */
export const postImagePathSchema = z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.jpg$/, 'imagem: caminho inválido');
export const uploadRequestSchema = z.object({ count: z.number().int().min(1).max(MAX_POST_IMAGES) }).strict();
export const postCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(80),
    caption: z.string().trim().max(500).optional(),
    images: z.array(postImagePathSchema).max(MAX_POST_IMAGES).optional(),
  })
  .strict();
export const commentCreateSchema = z.object({ body: z.string().trim().min(1).max(500) }).strict();
/** Frases do dia: o texto de cada idioma. `context` e `tryToday` são opcionais (a tela da frase esconde o que faltar). */
export const quoteTextSchema = z
  .object({
    text: z.string().trim().min(3).max(600),
    author: z.string().trim().min(1).max(80),
    source: z.string().trim().max(160).default(''),
    context: z.string().trim().max(1200).optional(),
    tryToday: z.array(z.string().trim().min(1).max(240)).max(4).optional(),
  })
  .strict();
export const quoteInputSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,39}$/, 'id: minúsculas, números e hífen'),
    position: z.number().int().min(0).max(100_000).optional(),
    active: z.boolean().optional(),
    content: z.object({ pt: quoteTextSchema, en: quoteTextSchema, es: quoteTextSchema }).strict(),
  })
  .strict();
export const quotesPutSchema = z.object({ quotes: z.array(quoteInputSchema).min(1).max(200) }).strict();

/** Totais da semana que o app envia para o ranking (minutos offline e copos terminados). */
export const weekStatsSchema = z
  .object({
    week: z.string().regex(/^\d{4}-W\d{2}$/, 'semana: AAAA-Wnn'),
    offlineMinutes: z.number().int().min(0).max(7 * 24 * 60),
    cups: z.number().int().min(0).max(1000),
  })
  .strict();

/** Semana ISO 8601 (segunda a domingo) de um instante, em UTC: "2026-W45". */
export function isoWeek(ms: number): string {
  const d = new Date(ms);
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const start = Date.UTC(t.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((t.getTime() - start) / 86_400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export type QuoteInput = z.infer<typeof quoteInputSchema>;
export type ProfilePatch = z.infer<typeof profilePatchSchema>;
export type CoffeePrefs = z.infer<typeof coffeePrefsSchema>;
export type PrivacyPatch = z.infer<typeof privacyPatchSchema>;
export type CoffeeLogInput = z.infer<typeof coffeeLogSchema>;
