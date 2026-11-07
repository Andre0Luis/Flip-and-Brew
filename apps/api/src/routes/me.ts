import { and, eq, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import { MIN_AGE, ageOn, bootstrapSchema, coffeePrefsSchema, pingSchema, privacyPatchSchema, profilePatchSchema } from '../shared.js';
import type { Env } from '../auth/middleware.js';
import type { Config } from '../config.js';
import type { Db } from '../db/client.js';
import { activity, auditLog, coffeePrefs, privacySettings, profiles, type Profile } from '../db/schema.js';
import type { EmailProvider } from '../email/provider.js';
import { welcomeEmail } from '../email/welcome.js';
import { HttpError, jsonBody, parse } from '../lib/errors.js';

const TEN_MIN = 10 * 60_000;

const own = (p: Profile) => ({
  id: p.id,
  email: p.email,
  handle: p.handle,
  displayName: p.displayName,
  bio: p.bio,
  country: p.country,
  birthDate: p.birthDate,
  role: p.role,
  welcomedAt: p.welcomedAt,
  createdAt: p.createdAt,
});

const isUnique = (e: unknown): boolean => {
  const x = e as { code?: string; cause?: { code?: string } };
  return x?.code === '23505' || x?.cause?.code === '23505';
};

/** Rotas da própria pessoa. `/bootstrap` só exige token; as demais exigem perfil (ver app.ts). */
export function meRoutes(db: Db, cfg: Config, email: EmailProvider) {
  const r = new Hono<Env>();

  const load = async (id: string) => (await db.select().from(profiles).where(eq(profiles.id, id)))[0];

  /**
   * Boas-vindas, uma única vez por pessoa. O `welcomedAt` é reservado antes do envio (um UPDATE condicional), então dois pedidos
   * simultâneos não mandam dois e-mails. Se o provedor falhar, a reserva é desfeita e a próxima abertura tenta de novo; o cadastro nunca falha por isso.
   */
  const sendWelcome = async (p: Profile, language: 'pt' | 'en' | 'es' | undefined) => {
    if (p.welcomedAt) return null;
    const claimed = await db.update(profiles).set({ welcomedAt: new Date() }).where(and(eq(profiles.id, p.id), isNull(profiles.welcomedAt))).returning({ id: profiles.id });
    if (!claimed.length) return null;
    try {
      await email.send(welcomeEmail(p.email, language));
    } catch (e) {
      console.error('[email] boas-vindas falharam, vai tentar de novo na próxima abertura:', (e as Error).message);
      await db.update(profiles).set({ welcomedAt: null }).where(eq(profiles.id, p.id));
    }
    return load(p.id);
  };

  /** Cria o perfil na primeira vez (idempotente). Admin só por e-mail verificado que está em ADMIN_EMAILS. */
  r.post('/me/bootstrap', async (c) => {
    const who = c.get('identity');
    // O corpo é opcional (só traz o idioma do e-mail de boas-vindas).
    const body = parse(bootstrapSchema, await c.req.json().catch(() => ({})));
    const wantsAdmin = who.emailVerified && cfg.adminEmails.includes(who.email);
    let p = await load(who.id);
    let created = false;
    if (!p) {
      await db.insert(profiles).values({ id: who.id, email: who.email, role: wantsAdmin ? 'admin' : 'user' }).onConflictDoNothing();
      await db.insert(privacySettings).values({ userId: who.id }).onConflictDoNothing();
      await db.insert(coffeePrefs).values({ userId: who.id }).onConflictDoNothing();
      p = await load(who.id);
      created = true;
    } else if (wantsAdmin && p.role !== 'admin') {
      await db.update(profiles).set({ role: 'admin' }).where(eq(profiles.id, who.id));
      await db.insert(auditLog).values({ actorId: who.id, action: 'role.admin_by_config', target: who.id });
      p = await load(who.id);
    }
    if (!p) throw new HttpError(500, 'bootstrap_failed');
    if (p.bannedAt) throw new HttpError(403, 'banned', 'Conta suspensa.');
    p = (await sendWelcome(p, body.language)) ?? p;
    return c.json({ profile: own(p), created }, created ? 201 : 200);
  });

  r.get('/me', async (c) => {
    const p = c.get('profile');
    const [prefs] = await db.select().from(coffeePrefs).where(eq(coffeePrefs.userId, p.id));
    const [privacy] = await db.select().from(privacySettings).where(eq(privacySettings.userId, p.id));
    return c.json({ profile: own(p), prefs: prefs ?? null, privacy: privacy ?? null });
  });

  r.patch('/me', async (c) => {
    const p = c.get('profile');
    const patch = parse(profilePatchSchema, await jsonBody(c));
    if (patch.birthDate !== undefined) {
      if (p.birthDate) throw new HttpError(400, 'birth_date_locked', 'A data de nascimento não pode ser trocada.');
      const age = ageOn(patch.birthDate);
      if (age === null) throw new HttpError(400, 'invalid_birth_date', 'Data de nascimento inválida.');
      if (age < MIN_AGE) throw new HttpError(400, 'under_age', `É preciso ter ${MIN_AGE} anos ou mais.`);
    }
    if (Object.keys(patch).length === 0) return c.json({ profile: own(p) });
    try {
      await db.update(profiles).set(patch).where(eq(profiles.id, p.id));
    } catch (e) {
      if (isUnique(e)) throw new HttpError(409, 'handle_taken', 'Esse apelido já existe.');
      throw e;
    }
    return c.json({ profile: own((await load(p.id))!) });
  });

  r.patch('/me/prefs', async (c) => {
    const id = c.get('profile').id;
    const patch = parse(coffeePrefsSchema, await jsonBody(c));
    if (Object.keys(patch).length === 0) await db.insert(coffeePrefs).values({ userId: id }).onConflictDoNothing();
    else await db.insert(coffeePrefs).values({ userId: id, ...patch }).onConflictDoUpdate({ target: coffeePrefs.userId, set: patch });
    const [row] = await db.select().from(coffeePrefs).where(eq(coffeePrefs.userId, id));
    return c.json({ prefs: row });
  });

  r.patch('/me/privacy', async (c) => {
    const id = c.get('profile').id;
    const patch = parse(privacyPatchSchema, await jsonBody(c));
    if (Object.keys(patch).length === 0) await db.insert(privacySettings).values({ userId: id }).onConflictDoNothing();
    else await db.insert(privacySettings).values({ userId: id, ...patch }).onConflictDoUpdate({ target: privacySettings.userId, set: patch });
    const [row] = await db.select().from(privacySettings).where(eq(privacySettings.userId, id));
    return c.json({ privacy: row });
  });

  /** Presença. Atualiza "visto por último" sempre e grava uma linha de atividade no máximo a cada 10 minutos. */
  r.post('/me/ping', async (c) => {
    const p = c.get('profile');
    const body = parse(pingSchema, await jsonBody(c));
    const now = new Date();
    await db.update(profiles).set({ lastSeenAt: now }).where(eq(profiles.id, p.id));
    if (!p.lastSeenAt || now.getTime() - p.lastSeenAt.getTime() > TEN_MIN) {
      await db.insert(activity).values({ userId: p.id, at: now, platform: body.platform, appVersion: body.appVersion });
    }
    return c.body(null, 204);
  });

  /** Exclui a conta e tudo o que depende dela (cascata). O registro de auditoria fica, sem dado pessoal. */
  r.delete('/me', async (c) => {
    const id = c.get('profile').id;
    await db.insert(auditLog).values({ actorId: id, action: 'account.delete', target: id });
    await db.delete(profiles).where(eq(profiles.id, id));
    return c.body(null, 204);
  });

  return r;
}
