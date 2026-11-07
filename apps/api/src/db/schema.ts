import { bigint, boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'moderator', 'admin']);

const ts = (name: string) => timestamp(name, { withTimezone: true });

/** Uma linha por pessoa. O `id` é o do provedor de login (Supabase Auth); aqui não há senha. */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  handle: text('handle').unique(),
  displayName: text('display_name'),
  avatarPath: text('avatar_path'),
  bio: text('bio'),
  role: roleEnum('role').notNull().default('user'),
  /** "AAAA-MM-DD"; serve para a regra de idade mínima */
  birthDate: text('birth_date'),
  country: text('country'),
  welcomedAt: ts('welcomed_at'),
  lastSeenAt: ts('last_seen_at'),
  bannedAt: ts('banned_at'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

const owner = () => uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' });

/** Perfil visível para todos; comunidade só entre amigos (sem escolha). Aqui só o que é opcional: ranking geral e cafés preferidos. */
export const privacySettings = pgTable('privacy_settings', {
  userId: owner().primaryKey(),
  showInGlobalRanking: boolean('show_in_global_ranking').notNull().default(false),
  showCoffeePrefs: boolean('show_coffee_prefs').notNull().default(false),
});

export const coffeePrefs = pgTable('coffee_prefs', {
  userId: owner().primaryKey(),
  favoriteCoffees: text('favorite_coffees').array().notNull().default([]),
  methods: text('methods').array().notNull().default([]),
  roast: text('roast'),
  flavors: text('flavors').array().notNull().default([]),
});

/** O backup do progresso (hoje no Firestore): o servidor guarda o documento e o horário, nada mais. */
export const userSnapshots = pgTable('user_snapshots', {
  userId: owner().primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  version: integer('version').notNull().default(1),
});

/** Café de verdade que a pessoa bebeu (alimenta o ranking de café). */
export const coffeeLogs = pgTable(
  'coffee_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: owner(),
    at: ts('at').notNull().defaultNow(),
    kind: text('kind').notNull(),
    method: text('method'),
    sizeMl: integer('size_ml'),
    note: text('note'),
  },
  (t) => [index('coffee_logs_user_at').on(t.userId, t.at)],
);

/** Presença: uma linha de vez em quando (não a cada ping). Retenção curta, limpa por rotina. */
export const activity = pgTable(
  'activity',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: owner(),
    at: ts('at').notNull().defaultNow(),
    platform: text('platform').notNull(),
    appVersion: text('app_version').notNull(),
  },
  (t) => [index('activity_at').on(t.at)],
);

/** Tudo o que administrador e moderador fazem. `actorId` não tem chave estrangeira: o registro sobrevive à exclusão da conta. */
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  action: text('action').notNull(),
  target: text('target'),
  meta: jsonb('meta'),
  at: ts('at').notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
