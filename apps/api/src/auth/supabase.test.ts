import test from 'node:test';
import assert from 'node:assert/strict';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { loadConfig } from '../config';
import { authFor } from '../build-app';
import { supabaseAuth } from './supabase';

const URL_ = 'https://abcd.supabase.co';
const ISS = `${URL_}/auth/v1`;
const SECRET = 'segredo-jwt-do-projeto-com-mais-de-16-chars';
const key = new TextEncoder().encode(SECRET);
const ID = '6f1c1c0e-5b0e-4a41-9a39-6b6e0f0f0f0f';

type Claims = Record<string, unknown>;
const hs = (claims: Claims = {}, o: { secret?: Uint8Array; iss?: string; aud?: string; exp?: string } = {}) =>
  new SignJWT({ role: 'authenticated', email: 'Ana@Exemplo.com', user_metadata: { email_verified: true }, ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(ID)
    .setIssuer(o.iss ?? ISS)
    .setAudience(o.aud ?? 'authenticated')
    .setIssuedAt()
    .setExpirationTime(o.exp ?? '1h')
    .sign(o.secret ?? key);

const auth = supabaseAuth({ url: URL_, jwtSecret: SECRET });

test('token do Supabase válido vira identidade, com e-mail em minúsculas e verificação lida de user_metadata', async () => {
  assert.deepEqual(await auth.verify(await hs()), { id: ID, email: 'ana@exemplo.com', emailVerified: true });
  assert.equal((await auth.verify(await hs({ user_metadata: {} })))?.emailVerified, false);
  assert.equal((await auth.verify(await hs({ user_metadata: undefined })))?.emailVerified, false);
});

test('a chave pública anon e a service_role NÃO valem como login (mesmo segredo, outro papel)', async () => {
  // a chave anon é um JWT assinado com o mesmo segredo, sem usuário
  const anon = await new SignJWT({ role: 'anon' }).setProtectedHeader({ alg: 'HS256' }).setIssuer('supabase').setIssuedAt().setExpirationTime('10y').sign(key);
  const service = await new SignJWT({ role: 'service_role' }).setProtectedHeader({ alg: 'HS256' }).setIssuer('supabase').setIssuedAt().setExpirationTime('10y').sign(key);
  assert.equal(await auth.verify(anon), null);
  assert.equal(await auth.verify(service), null);
  // mesmo com emissor e audiência certos, o papel precisa ser authenticated
  assert.equal(await auth.verify(await hs({ role: 'anon' })), null);
  assert.equal(await auth.verify(await hs({ role: 'service_role' })), null);
});

test('recusa segredo errado, emissor ou audiência errados, expirado, anônimo e sem e-mail', async () => {
  assert.equal(await auth.verify(await hs({}, { secret: new TextEncoder().encode('outro-segredo-qualquer-bem-longo-123') })), null);
  assert.equal(await auth.verify(await hs({}, { iss: 'https://outro.supabase.co/auth/v1' })), null);
  assert.equal(await auth.verify(await hs({}, { aud: 'anon' })), null);
  assert.equal(await auth.verify(await hs({}, { exp: '-1h' })), null);
  assert.equal(await auth.verify(await hs({ is_anonymous: true })), null);
  assert.equal(await auth.verify(await hs({ email: undefined })), null);
  assert.equal(await auth.verify('lixo'), null);
  assert.equal(await auth.verify(''), null);
});

test('algoritmo "none" e HS256 sem segredo configurado são recusados', async () => {
  const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: ID, role: 'authenticated', email: 'a@b.com', iss: ISS, aud: 'authenticated' })).toString('base64url')}.`;
  assert.equal(await auth.verify(none), null);
  assert.equal(await supabaseAuth({ url: URL_ }).verify(await hs()), null);
});

test('chave assimétrica (ES256) vale pelas chaves públicas do projeto, e uma chave de fora não', async () => {
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'ES256', use: 'sig' };
  const asym = supabaseAuth({ url: URL_, jwks: createLocalJWKSet({ keys: [jwk] }) });
  const sign = (k: CryptoKey) =>
    new SignJWT({ role: 'authenticated', email: 'bia@exemplo.com', user_metadata: { email_verified: true } })
      .setProtectedHeader({ alg: 'ES256', kid: 'k1' }).setSubject(ID).setIssuer(ISS).setAudience('authenticated').setIssuedAt().setExpirationTime('1h').sign(k);
  assert.equal((await asym.verify(await sign(privateKey)))?.email, 'bia@exemplo.com');
  const stranger = await generateKeyPair('ES256');
  assert.equal(await asym.verify(await sign(stranger.privateKey)), null);
});

test('configuração: o provedor supabase exige SUPABASE_URL, e a URL do banco aceita POSTGRES_URL da Vercel', () => {
  assert.throws(() => loadConfig({ NODE_ENV: 'production', DATABASE_URL: 'postgres://x', AUTH_PROVIDER: 'supabase' }), /SUPABASE_URL/);
  const prod = { NODE_ENV: 'production', AUTH_PROVIDER: 'supabase', SUPABASE_URL: `${URL_}/`, SUPABASE_JWT_SECRET: SECRET };
  assert.throws(() => loadConfig(prod), /DATABASE_URL/);
  const c = loadConfig({ ...prod, POSTGRES_URL: 'postgres://u:p@h.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x' });
  assert.match(c.databaseUrl, /pooler\.supabase\.com:6543/);
  assert.equal(c.supabaseUrl, URL_);
  assert.equal(loadConfig({ ...prod, DATABASE_URL: 'postgres://a', POSTGRES_URL: 'postgres://b' }).databaseUrl, 'postgres://a');
  assert.equal(authFor(c) !== undefined, true);
});
