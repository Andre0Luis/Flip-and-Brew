import test from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { activity, auditLog, profiles } from './db/schema';
import { loadConfig } from './config';
import { testApp } from './test/helpers';
import { brevoEmail } from './email/brevo';
import { consoleEmail } from './email/console';
import { welcomeEmail } from './email/welcome';
import { purgeOldActivity } from './jobs/retention';

test('saúde responde sem login', async () => {
  const t = await testApp();
  assert.deepEqual((await t.call('/health')).body, { ok: true });
  await t.close();
});

test('sem token, ou com token falso, nada passa', async () => {
  const t = await testApp();
  assert.equal((await t.call('/v1/me')).status, 401);
  assert.equal((await t.call('/v1/me', { token: 'qualquer.coisa.aqui' })).status, 401);
  assert.equal((await t.call('/v1/admin/overview')).status, 401);
  await t.close();
});

test('antes do bootstrap não há perfil; depois dele, sim, e repetir não duplica', async () => {
  const t = await testApp();
  const u = await t.user();
  assert.equal((await t.call('/v1/me', { token: u.token })).status, 404);
  const first = await t.call('/v1/me/bootstrap', { token: u.token, method: 'POST', body: {} });
  assert.equal(first.status, 201);
  assert.equal(first.body.profile.role, 'user');
  assert.equal(first.body.created, true);
  const again = await t.call('/v1/me/bootstrap', { token: u.token, method: 'POST', body: {} });
  assert.equal(again.status, 200);
  assert.equal(again.body.created, false);
  assert.equal((await t.handle.db.select().from(profiles)).length, 1);
  const me = await t.call('/v1/me', { token: u.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.privacy.showInGlobalRanking, false);
  await t.close();
});

test('admin vem só de e-mail verificado que está na lista, e o cliente não escolhe a role', async () => {
  const t = await testApp();
  const verified = await t.member('dono@exemplo.com', true);
  assert.equal(verified.bootstrap.body.profile.role, 'admin');
  const fake = await t.member('dono@exemplo.com', false);
  assert.equal(fake.bootstrap.body.profile.role, 'user');
  const m = await t.member();
  const r = await t.call('/v1/me', { token: m.token, method: 'PATCH', body: { role: 'admin' } });
  assert.equal(r.status, 400);
  await t.close();
});

test('perfil: apelido único, formato válido e idade mínima de 18 anos', async () => {
  const t = await testApp();
  const a = await t.member();
  const b = await t.member();
  assert.equal((await t.call('/v1/me', { token: a.token, method: 'PATCH', body: { handle: 'ana_cafe', displayName: 'Ana' } })).status, 200);
  assert.equal((await t.call('/v1/me', { token: b.token, method: 'PATCH', body: { handle: 'ana_cafe' } })).body.error.code, 'handle_taken');
  assert.equal((await t.call('/v1/me', { token: b.token, method: 'PATCH', body: { handle: 'Ana Maria' } })).status, 400);
  const year = new Date().getFullYear();
  const young = await t.call('/v1/me', { token: b.token, method: 'PATCH', body: { birthDate: `${year - 17}-01-01` } });
  assert.equal(young.body.error.code, 'under_age');
  assert.equal((await t.call('/v1/me', { token: b.token, method: 'PATCH', body: { birthDate: '2026-02-30' } })).body.error.code, 'invalid_birth_date');
  const ok = await t.call('/v1/me', { token: b.token, method: 'PATCH', body: { birthDate: `${year - 30}-06-15` } });
  assert.equal(ok.status, 200);
  assert.equal((await t.call('/v1/me', { token: b.token, method: 'PATCH', body: { birthDate: `${year - 40}-06-15` } })).body.error.code, 'birth_date_locked');
  await t.close();
});

test('preferências de café e privacidade guardam só o que veio', async () => {
  const t = await testApp();
  const u = await t.member();
  const p = await t.call('/v1/me/prefs', { token: u.token, method: 'PATCH', body: { favoriteCoffees: ['espresso'], roast: 'media' } });
  assert.deepEqual(p.body.prefs.favoriteCoffees, ['espresso']);
  assert.deepEqual(p.body.prefs.methods, []);
  const q = await t.call('/v1/me/privacy', { token: u.token, method: 'PATCH', body: { showInGlobalRanking: true } });
  assert.equal(q.body.privacy.showInGlobalRanking, true);
  assert.equal(q.body.privacy.showCoffeePrefs, false);
  // não existe escolha de visibilidade: o perfil é público e a comunidade é só entre amigos
  assert.equal((await t.call('/v1/me/privacy', { token: u.token, method: 'PATCH', body: { profileVisibility: 'private' } })).status, 400);
  await t.close();
});

test('presença: atualiza o visto por último e grava atividade no máximo a cada 10 minutos', async () => {
  const t = await testApp();
  const u = await t.member();
  const body = { platform: 'android', appVersion: '1.0.0' };
  assert.equal((await t.call('/v1/me/ping', { token: u.token, body })).status, 204);
  assert.equal((await t.call('/v1/me/ping', { token: u.token, body })).status, 204);
  assert.equal((await t.handle.db.select().from(activity)).length, 1);
  const [p] = await t.handle.db.select().from(profiles).where(eq(profiles.id, u.id));
  assert.ok(p.lastSeenAt);
  assert.equal((await t.call('/v1/me/ping', { token: u.token, body: { platform: 'palm', appVersion: '1' } })).status, 400);
  await t.close();
});

test('backup: grava, lê, e recusa regravar com dado mais velho', async () => {
  const t = await testApp();
  const u = await t.member();
  assert.equal((await t.call('/v1/me/snapshot', { token: u.token })).status, 404);
  const put = (updatedAt: number, coins: number) => t.call('/v1/me/snapshot', { token: u.token, method: 'PUT', body: { v: 1, updatedAt, data: { coins } } });
  assert.equal((await put(2000, 150)).status, 200);
  const stale = await put(1000, 99);
  assert.equal(stale.status, 409);
  assert.equal(stale.body.error.currentUpdatedAt, 2000);
  assert.equal((await put(3000, 200)).status, 200);
  const got = await t.call('/v1/me/snapshot', { token: u.token });
  assert.deepEqual(got.body, { v: 1, updatedAt: 3000, data: { coins: 200 } });
  // cada pessoa só enxerga o próprio backup
  const other = await t.member();
  assert.equal((await t.call('/v1/me/snapshot', { token: other.token })).status, 404);
  await t.close();
});

test('café de verdade: registrar, listar, apagar só o próprio e limite por dia', async () => {
  const t = await testApp();
  const a = await t.member();
  const b = await t.member();
  const made = await t.call('/v1/me/coffees', { token: a.token, body: { kind: 'espresso', method: 'maquina', sizeMl: 40 } });
  assert.equal(made.status, 201);
  assert.equal((await t.call('/v1/me/coffees', { token: a.token, body: { kind: 'x', at: Date.now() + 3_600_000 } })).status, 400);
  assert.equal((await t.call('/v1/me/coffees', { token: a.token, body: { kind: '' } })).status, 400);
  assert.equal((await t.call('/v1/me/coffees', { token: a.token })).body.coffees.length, 1);
  assert.equal((await t.call('/v1/me/coffees', { token: b.token })).body.coffees.length, 0);
  const id = made.body.coffee.id;
  assert.equal((await t.call(`/v1/me/coffees/${id}`, { token: b.token, method: 'DELETE' })).status, 404);
  assert.equal((await t.call(`/v1/me/coffees/${id}`, { token: a.token, method: 'DELETE' })).status, 204);
  for (let i = 0; i < 50; i++) assert.equal((await t.call('/v1/me/coffees', { token: a.token, body: { kind: 'coado' } })).status, 201);
  assert.equal((await t.call('/v1/me/coffees', { token: a.token, body: { kind: 'coado' } })).status, 429);
  await t.close();
});

test('admin: só admin vê o monitoramento, e ver a lista de usuários fica registrado', async () => {
  const t = await testApp();
  const admin = await t.member('dono@exemplo.com');
  const common = await t.member();
  const outro = await t.member();
  await t.call('/v1/me/ping', { token: outro.token, body: { platform: 'ios', appVersion: '1.0.0' } });
  assert.equal((await t.call('/v1/admin/overview', { token: common.token })).status, 403);
  assert.equal((await t.call('/v1/admin/users', { token: common.token })).status, 403);
  const ov = await t.call('/v1/admin/overview', { token: admin.token });
  assert.equal(ov.status, 200);
  assert.equal(ov.body.totalUsers, 3);
  assert.equal(ov.body.activeNow, 1);
  assert.equal(ov.body.newLast7d, 3);
  assert.equal(ov.body.signupsByDay.length, 1);
  const list = await t.call('/v1/admin/users?limit=2', { token: admin.token });
  assert.equal(list.body.users.length, 2);
  assert.ok(list.body.nextBefore);
  assert.equal(list.body.users.every((u: { email: string }) => typeof u.email === 'string'), true);
  const rest = await t.call(`/v1/admin/users?limit=2&before=${list.body.nextBefore}`, { token: admin.token });
  assert.equal(rest.body.users.length, 1);
  assert.equal((await t.handle.db.select().from(auditLog)).filter((a) => a.action === 'admin.users.list').length, 2);
  await t.close();
});

test('conta suspensa não entra, e excluir a conta apaga os dados', async () => {
  const t = await testApp();
  const u = await t.member();
  await t.call('/v1/me/coffees', { token: u.token, body: { kind: 'coado' } });
  await t.handle.db.update(profiles).set({ bannedAt: new Date() }).where(eq(profiles.id, u.id));
  assert.equal((await t.call('/v1/me', { token: u.token })).body.error.code, 'banned');
  assert.equal((await t.call('/v1/me/bootstrap', { token: u.token, body: {} })).body.error.code, 'banned');
  await t.handle.db.update(profiles).set({ bannedAt: null }).where(eq(profiles.id, u.id));
  assert.equal((await t.call('/v1/me', { token: u.token, method: 'DELETE' })).status, 204);
  assert.equal((await t.handle.db.select().from(profiles)).length, 0);
  assert.equal((await t.handle.db.select().from(auditLog)).some((a) => a.action === 'account.delete'), true);
  await t.close();
});

test('corpo que não é JSON ou é grande demais é recusado', async () => {
  const t = await testApp();
  const u = await t.member();
  const bad = await t.app.request('/v1/me', { method: 'PATCH', headers: { authorization: `Bearer ${u.token}`, 'content-type': 'application/json' }, body: '{nope' });
  assert.equal(bad.status, 400);
  const big = await t.app.request('/v1/me/snapshot', { method: 'PUT', headers: { authorization: `Bearer ${u.token}`, 'content-type': 'application/json' }, body: JSON.stringify({ v: 1, updatedAt: 1, data: { x: 'a'.repeat(1_200_000) } }) });
  assert.equal(big.status, 413);
  await t.close();
});

test('configuração: login de desenvolvimento não sobe em produção e faltando segredo falha cedo', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production', DATABASE_URL: 'postgres://x', AUTH_PROVIDER: 'dev', DEV_JWT_SECRET: 'x'.repeat(20) }), /não pode rodar em produção/);
  assert.throws(() => loadConfig({ NODE_ENV: 'development', AUTH_PROVIDER: 'dev' }), /DEV_JWT_SECRET/);
  assert.throws(() => loadConfig({ NODE_ENV: 'production', AUTH_PROVIDER: 'supabase' }), /DATABASE_URL/);
  const ok = loadConfig({ AUTH_PROVIDER: 'dev', DEV_JWT_SECRET: 'x'.repeat(20), ADMIN_EMAILS: ' A@x.com, b@x.com ' });
  assert.deepEqual(ok.adminEmails, ['a@x.com', 'b@x.com']);
  assert.equal(ok.databaseUrl, 'pglite:./.data/dev');
});

test('boas-vindas: um e-mail só, no idioma pedido, mesmo repetindo o bootstrap', async () => {
  const t = await testApp();
  const u = await t.user('ana@exemplo.com');
  const body = { language: 'es' };
  const r1 = await t.call('/v1/me/bootstrap', { token: u.token, body });
  assert.equal(r1.status, 201);
  assert.ok(r1.body.profile.welcomedAt);
  await t.call('/v1/me/bootstrap', { token: u.token, body });
  await t.call('/v1/me/bootstrap', { token: u.token, body });
  assert.equal(t.sent.length, 1);
  assert.equal(t.sent[0].to, 'ana@exemplo.com');
  assert.match(t.sent[0].subject, /Bienvenido/);
  assert.equal((await t.call('/v1/me/bootstrap', { token: (await t.user()).token, body: { language: 'fr' } })).status, 400);
  await t.close();
});

test('boas-vindas: sem idioma vai em português, e dois pedidos simultâneos mandam um e-mail só', async () => {
  const t = await testApp();
  const u = await t.user();
  await Promise.all([t.call('/v1/me/bootstrap', { token: u.token, body: {} }), t.call('/v1/me/bootstrap', { token: u.token, body: {} })]);
  assert.equal(t.sent.length, 1);
  assert.match(t.sent[0].subject, /Bem-vindo/);
  await t.close();
});

test('boas-vindas: se o provedor falha o cadastro continua, e a próxima abertura tenta de novo', async () => {
  const t = await testApp();
  const u = await t.user();
  t.mail.failNext = 1;
  const first = await t.call('/v1/me/bootstrap', { token: u.token, body: {} });
  assert.equal(first.status, 201);
  assert.equal(first.body.profile.welcomedAt, null);
  assert.equal(t.sent.length, 0);
  const again = await t.call('/v1/me/bootstrap', { token: u.token, body: {} });
  assert.ok(again.body.profile.welcomedAt);
  assert.equal(t.sent.length, 1);
  await t.close();
});

test('o e-mail de boas-vindas é texto fixo e escapado', () => {
  const m = welcomeEmail('x@y.com', 'en');
  assert.match(m.html, /Welcome to Flip &amp; Brew/);
  assert.doesNotMatch(m.html, /Flip & Brew</);
  assert.match(m.text, /Welcome to Flip & Brew/);
});

test('Brevo: um POST na API com a chave no cabeçalho, e erro do provedor vira exceção', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const ok = brevoEmail({ apiKey: 'chave-falsa', fromEmail: 'eu@exemplo.com', fromName: 'Flip & Brew', fetchFn: (async (url: string, init: RequestInit) => { calls.push({ url, init }); return new Response('{}', { status: 201 }); }) as typeof fetch });
  await ok.send({ to: 'ana@exemplo.com', subject: 'Oi', html: '<p>oi</p>', text: 'oi' });
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal((calls[0].init.headers as Record<string, string>)['api-key'], 'chave-falsa');
  const payload = JSON.parse(calls[0].init.body as string);
  assert.deepEqual(payload.to, [{ email: 'ana@exemplo.com' }]);
  assert.deepEqual(payload.sender, { name: 'Flip & Brew', email: 'eu@exemplo.com' });
  const bad = brevoEmail({ apiKey: 'k', fromEmail: 'eu@exemplo.com', fromName: 'x', fetchFn: (async () => new Response('no', { status: 401 })) as typeof fetch });
  await assert.rejects(() => bad.send({ to: 'a@b.com', subject: 's', html: 'h', text: 't' }), /401/);
});

test('o provedor de console registra só destinatário e assunto, nunca o corpo', async () => {
  const lines: string[] = [];
  await consoleEmail((l) => lines.push(l)).send({ to: 'a@b.com', subject: 'Assunto', html: '<p>segredo</p>', text: 'segredo' });
  assert.equal(lines.length, 1);
  assert.doesNotMatch(lines[0], /segredo/);
});

test('retenção: presença com mais de 30 dias sai; o resto fica', async () => {
  const t = await testApp();
  const u = await t.member();
  const old = new Date(Date.now() - 31 * 86_400_000);
  await t.handle.db.insert(activity).values([{ userId: u.id, at: old, platform: 'android', appVersion: '1' }, { userId: u.id, at: new Date(), platform: 'android', appVersion: '1' }]);
  assert.equal(await purgeOldActivity(t.handle.db), 1);
  assert.equal((await t.handle.db.select().from(activity)).length, 1);
  await t.close();
});

test('configuração: a chave da Brevo exige um remetente', () => {
  assert.throws(() => loadConfig({ AUTH_PROVIDER: 'dev', DEV_JWT_SECRET: 'x'.repeat(20), BREVO_API_KEY: 'k' }), /MAIL_FROM/);
  const ok = loadConfig({ AUTH_PROVIDER: 'dev', DEV_JWT_SECRET: 'x'.repeat(20), BREVO_API_KEY: 'k', MAIL_FROM: 'eu@exemplo.com' });
  assert.equal(ok.mailFromName, 'Flip & Brew');
});
