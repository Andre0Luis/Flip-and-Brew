import { sql } from 'drizzle-orm';
import { bigint, boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

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
}).enableRLS();

const owner = () => uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' });

/** Perfil visível para todos; comunidade só entre amigos (sem escolha). Aqui só o que é opcional: ranking geral e cafés preferidos. */
export const privacySettings = pgTable('privacy_settings', {
  userId: owner().primaryKey(),
  showInGlobalRanking: boolean('show_in_global_ranking').notNull().default(false),
  showCoffeePrefs: boolean('show_coffee_prefs').notNull().default(false),
}).enableRLS();

export const coffeePrefs = pgTable('coffee_prefs', {
  userId: owner().primaryKey(),
  favoriteCoffees: text('favorite_coffees').array().notNull().default([]),
  methods: text('methods').array().notNull().default([]),
  roast: text('roast'),
  flavors: text('flavors').array().notNull().default([]),
}).enableRLS();

/** O backup do progresso (hoje no Firestore): o servidor guarda o documento e o horário, nada mais. */
export const userSnapshots = pgTable('user_snapshots', {
  userId: owner().primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
  version: integer('version').notNull().default(1),
}).enableRLS();

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
).enableRLS();

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
).enableRLS();

/** Tudo o que administrador e moderador fazem. `actorId` não tem chave estrangeira: o registro sobrevive à exclusão da conta. */
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  action: text('action').notNull(),
  target: text('target'),
  meta: jsonb('meta'),
  at: ts('at').notNull().defaultNow(),
}).enableRLS();

export const friendshipStatusEnum = pgEnum('friendship_status', ['pending', 'accepted']);

/**
 * Amizade com aprovação: nasce `pending` (quem pediu = `requesterId`) e vira `accepted` quando a outra pessoa aceita.
 * Recusar ou cancelar apaga a linha. Só existe uma linha por par, em qualquer direção (índice com least/greatest).
 */
export const friendships = pgTable(
  'friendships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requesterId: uuid('requester_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    addresseeId: uuid('addressee_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    status: friendshipStatusEnum('status').notNull().default('pending'),
    createdAt: ts('created_at').notNull().defaultNow(),
    respondedAt: ts('responded_at'),
  },
  (t) => [
    uniqueIndex('friendships_pair').on(sql`least(${t.requesterId}, ${t.addresseeId})`, sql`greatest(${t.requesterId}, ${t.addresseeId})`),
    index('friendships_addressee').on(t.addresseeId, t.status),
    index('friendships_requester').on(t.requesterId, t.status),
  ],
).enableRLS();

/** Quem bloqueou quem. Bloquear desfaz amizade e pedidos, e some dos dois lados (busca, perfil, ranking). */
export const blocks = pgTable(
  'blocks',
  {
    blockerId: uuid('blocker_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    blockedId: uuid('blocked_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] }), index('blocks_blocked').on(t.blockedId)],
).enableRLS();

/** Post da comunidade: título, legenda e até 3 fotos. Só o autor e os amigos dele veem (ADR-0024). */
export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    caption: text('caption'),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('posts_author_at').on(t.authorId, t.createdAt)],
).enableRLS();

/** As fotos de um post, na ordem. O arquivo fica no armazenamento privado (`path`); a leitura é por link assinado. */
export const postImages = pgTable(
  'post_images',
  {
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    path: text('path').notNull(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.position] })],
).enableRLS();

export const postLikes = pgTable(
  'post_likes',
  {
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
).enableRLS();

export const postComments = pgTable(
  'post_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    createdAt: ts('created_at').notNull().defaultNow(),
  },
  (t) => [index('post_comments_post_at').on(t.postId, t.createdAt)],
).enableRLS();

export const notificationKindEnum = pgEnum('notification_kind', ['like', 'comment']);
/** Avisos dentro do app: quem curtiu ou comentou um post meu. */
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    kind: notificationKindEnum('kind').notNull(),
    postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: ts('created_at').notNull().defaultNow(),
    readAt: ts('read_at'),
  },
  (t) => [index('notifications_user_at').on(t.userId, t.createdAt)],
).enableRLS();

/** Totais da semana (ISO, "2026-W45") enviados pelo app, para o ranking. */
export const weeklyStats = pgTable(
  'weekly_stats',
  {
    userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    week: text('week').notNull(),
    offlineMinutes: integer('offline_minutes').notNull(),
    cups: integer('cups').notNull(),
    updatedAt: ts('updated_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.week] }), index('weekly_stats_week').on(t.week, t.offlineMinutes)],
).enableRLS();

export type Profile = typeof profiles.$inferSelect;
