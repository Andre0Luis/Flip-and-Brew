import test from 'node:test';
import assert from 'node:assert/strict';
import type { User } from '@supabase/auth-js';
import { ApiError, type ApiClient } from './apiClient';
import { createApiBackend, toCloudUser, type AuthClient } from './apiBackend';
import { toSupabaseAuthError } from './supabaseErrors';
import { AuthError, type CloudUser, type Snapshot } from './types';

const user = (over: Partial<User> = {}): User =>
  ({ id: 'u1', email: 'ana@exemplo.com', email_confirmed_at: '2026-11-01T00:00:00Z', app_metadata: { provider: 'email' }, ...over }) as User;
const ok = <T>(data: T) => ({ data, error: null });
const sbError = (code: string, message = code, name = 'AuthApiError') => Object.assign(new Error(message), { code, name, status: 400 });

/** Login falso: guarda a sessão na memória e anota as chamadas. Cada método pode ser trocado por teste. */
function fakeAuth(over: Partial<Record<keyof AuthClient, unknown>> = {}) {
  const calls: string[] = [];
  let session: { user: User; access_token: string } | null = null;
  let listener: ((e: string, s: unknown) => void) | null = null;
  const rec = (name: string, fn: (...a: any[]) => unknown) => (...a: any[]) => {
    calls.push(name);
    return fn(...a);
  };
  const auth = {
    getSession: rec('getSession', async () => ok({ session })),
    onAuthStateChange: rec('onAuthStateChange', (cb: (e: string, s: unknown) => void) => {
      listener = cb;
      return { data: { subscription: { unsubscribe: () => calls.push('unsubscribe') } } };
    }),
    signUp: rec('signUp', async () => ok({ user: user(), session: null })),
    signInWithPassword: rec('signInWithPassword', async () => ok({ user: user(), session: { user: user() } })),
    signInWithIdToken: rec('signInWithIdToken', async () => ok({ user: user({ app_metadata: { provider: 'google' } }), session: {} })),
    resend: rec('resend', async () => ({ data: {}, error: null })),
    refreshSession: rec('refreshSession', async () => ok({ user: user(), session: {} })),
    updateUser: rec('updateUser', async () => ok({ user: user() })),
    resetPasswordForEmail: rec('resetPasswordForEmail', async () => ({ data: {}, error: null })),
    setSession: rec('setSession', async () => ok({ user: user(), session: {} })),
    signOut: rec('signOut', async () => ({ error: null })),
    ...Object.fromEntries(Object.entries(over).map(([k, v]) => [k, rec(k, v as (...a: any[]) => unknown)])),
  } as unknown as AuthClient;
  return { auth, calls, signIn: (u = user()) => (session = { user: u, access_token: 't' }), emit: (s: unknown) => listener?.('SIGNED_IN', s) };
}

function fakeApi(over: Partial<ApiClient> = {}) {
  const calls: string[] = [];
  const api: ApiClient = {
    bootstrap: async (lang) => (calls.push(`bootstrap:${lang}`), { created: true, profile: { id: 'u1', email: 'a@b.com', role: 'user' } }),
    getSnapshot: async () => (calls.push('get'), null),
    putSnapshot: async () => (calls.push('put'), 'saved'),
    deleteAccount: async () => void calls.push('delete'),
    ...over,
  };
  return { api, calls };
}

const make = (a = fakeAuth(), b = fakeApi(), extra: Partial<Parameters<typeof createApiBackend>[0]> = {}) => ({ backend: createApiBackend({ auth: a.auth, api: b.api, getLanguage: () => 'pt', ...extra }), a, b });
const tick = () => new Promise((r) => setTimeout(r, 5));

test('o usuário do Supabase vira CloudUser: provedor, e-mail e confirmação', () => {
  assert.deepEqual(toCloudUser(user()), { uid: 'u1', email: 'ana@exemplo.com', provider: 'password', emailVerified: true });
  assert.equal(toCloudUser(user({ app_metadata: { provider: 'google' } })).provider, 'google');
  // O Google manda o nome completo nos metadados da conta.
  assert.equal(toCloudUser(user({ user_metadata: { full_name: ' Ana Souza ' } })).name, 'Ana Souza');
  assert.equal(toCloudUser(user({ user_metadata: { name: 'Bia' } })).name, 'Bia');
  assert.equal('name' in toCloudUser(user({ user_metadata: {} })), false);
  assert.equal(toCloudUser(user({ app_metadata: { provider: 'apple' } })).provider, 'apple');
  assert.equal(toCloudUser(user({ email_confirmed_at: undefined })).emailVerified, false);
  assert.equal(toCloudUser(user({ email: undefined })).email, null);
});

test('entrar: sucesso devolve o usuário; os erros do Supabase viram códigos da interface', async () => {
  assert.equal((await make().backend.signIn('a@b.com', 'x')).uid, 'u1');
  const cases: [Error, string][] = [
    [sbError('invalid_credentials'), 'wrong-credentials'],
    [sbError('email_not_confirmed'), 'unconfirmed'],
    [sbError('over_request_rate_limit'), 'too-many'],
    [sbError('weak_password'), 'weak-password'],
    [sbError('provider_disabled'), 'config'],
    [sbError('x', 'fetch failed', 'AuthRetryableFetchError'), 'network'],
    [new Error('Invalid login credentials'), 'wrong-credentials'],
    [new Error('Email not confirmed'), 'unconfirmed'],
  ];
  for (const [err, code] of cases) {
    const { backend } = make(fakeAuth({ signInWithPassword: async () => ({ data: { user: null, session: null }, error: err }) }));
    await assert.rejects(() => backend.signIn('a@b.com', 'x'), (e: AuthError) => e.code === code, `esperava ${code} para "${err.message}"`);
  }
});

test('cadastrar: conta nova fica sem confirmação; e-mail já usado (conta sem identidades) é recusado', async () => {
  const novo = await make().backend.signUp('a@b.com', 'senha-longa');
  assert.equal(novo.emailVerified, true); // o fake usa o usuário padrão; o que importa aqui é não lançar
  const dup = make(fakeAuth({ signUp: async () => ok({ user: user({ identities: [] }), session: null }) }));
  await assert.rejects(() => dup.backend.signUp('a@b.com', 'senha-longa'), (e: AuthError) => e.code === 'email-in-use');
  const pend = make(fakeAuth({ signUp: async () => ok({ user: user({ email_confirmed_at: undefined, identities: [{}] as never }), session: null }) }));
  assert.equal((await pend.backend.signUp('a@b.com', 'senha-longa')).emailVerified, false);
});

test('onChange avisa o estado inicial uma vez, não repete o igual e cria o perfil uma vez por usuário', async () => {
  const a = fakeAuth();
  a.signIn();
  const b = fakeApi();
  const { backend } = make(a, b);
  const seen: (CloudUser | null)[] = [];
  const stop = backend.onChange((u) => seen.push(u));
  await tick();
  a.emit({ user: user() }); // o mesmo usuário de novo: ignorado
  a.emit({ user: user({ email_confirmed_at: undefined }) }); // confirmação mudou: avisa
  await tick();
  assert.deepEqual(seen.map((u) => u && `${u.uid}:${u.emailVerified}`), ['u1:true', 'u1:false']);
  assert.deepEqual(b.calls.filter((c) => c.startsWith('bootstrap')), ['bootstrap:pt']);
  stop();
  assert.ok(a.calls.includes('unsubscribe'));
});

test('sem sessão, onChange avisa null (o app precisa saber que não há login)', async () => {
  const { backend } = make();
  const seen: unknown[] = [];
  backend.onChange((u) => seen.push(u));
  await tick();
  assert.deepEqual(seen, [null]);
});

test('o backup espera o perfil existir e, se o perfil falhou, tenta de novo na chamada seguinte', async () => {
  let n = 0;
  const b = fakeApi({
    bootstrap: async () => {
      n += 1;
      if (n === 1) throw new ApiError(0, 'network');
      return { created: false, profile: { id: 'u1', email: 'a@b.com', role: 'user' } };
    },
  });
  const { backend } = make(fakeAuth(), b);
  await assert.rejects(() => backend.getSnapshot('u1'), (e: AuthError) => e.code === 'network');
  assert.equal(await backend.getSnapshot('u1'), null);
  assert.equal(n, 2);
  const snap = { v: 1, updatedAt: 3, data: { coins: 1 } } as unknown as Snapshot;
  const calls: unknown[] = [];
  const { backend: b2 } = make(fakeAuth(), fakeApi({ putSnapshot: async (s) => (calls.push(s), 'stale') }));
  await b2.putSnapshot('u1', snap); // "stale" não é erro
  assert.deepEqual(calls, [{ v: 1, updatedAt: 3, data: { coins: 1 } }]);
});

test('excluir a conta apaga no servidor e só então sai; falha do servidor não finge sucesso', async () => {
  const { backend, a, b } = make();
  await backend.deleteAccount();
  assert.deepEqual(b.calls, ['delete']);
  assert.ok(a.calls.includes('signOut'));
  const bad = make(fakeAuth(), fakeApi({ deleteAccount: async () => { throw new ApiError(0, 'network'); } }));
  await assert.rejects(() => bad.backend.deleteAccount(), (e: AuthError) => e.code === 'network');
  assert.equal(bad.a.calls.includes('signOut'), false);
});

test('trocar a senha confirma a atual primeiro; senha atual errada não troca nada', async () => {
  const a = fakeAuth();
  a.signIn();
  await make(a).backend.changePassword('antiga', 'nova-senha-1');
  assert.deepEqual(a.calls.filter((c) => c === 'signInWithPassword' || c === 'updateUser'), ['signInWithPassword', 'updateUser']);
  const w = fakeAuth({ signInWithPassword: async () => ({ data: { user: null, session: null }, error: sbError('invalid_credentials') }) });
  w.signIn();
  await assert.rejects(() => make(w).backend.changePassword('errada', 'nova-senha-1'), (e: AuthError) => e.code === 'wrong-credentials');
  assert.equal(w.calls.includes('updateUser'), false);
});

test('Google e Apple: o token nativo vai para o Supabase (a Apple com o nonce) e, sem os módulos, não estão disponíveis', async () => {
  assert.equal(make().backend.googleAvailable(), false);
  assert.equal(make().backend.appleAvailable(), false);
  await assert.rejects(() => make().backend.signInGoogle(), (e: AuthError) => e.code === 'unavailable');
  const seen: unknown[] = [];
  const a = fakeAuth({ signInWithIdToken: async (c: unknown) => (seen.push(c), ok({ user: user({ app_metadata: { provider: 'google' } }), session: {} })) });
  const { backend } = make(a, fakeApi(), {
    google: { available: () => true, idToken: async () => 'g-token' },
    apple: { available: () => true, credential: async () => ({ idToken: 'a-token', nonce: 'cru' }) },
  });
  assert.equal(backend.googleAvailable() && backend.appleAvailable(), true);
  assert.equal((await backend.signInGoogle()).provider, 'google');
  await backend.signInApple();
  assert.deepEqual(seen, [{ provider: 'google', token: 'g-token' }, { provider: 'apple', token: 'a-token', nonce: 'cru' }]);
});

test('erro desconhecido guarda o código original; erro de login nativo continua sendo traduzido', () => {
  const e = toSupabaseAuthError(sbError('um_codigo_novo'));
  assert.equal(e.code, 'unknown');
  assert.equal(e.message, 'um_codigo_novo');
  assert.equal(toSupabaseAuthError(Object.assign(new Error('x'), { code: 'SIGN_IN_CANCELLED' })).code, 'cancelled');
  assert.equal(toSupabaseAuthError(new ApiError(401, 'unauthorized')).code, 'recent-login');
  assert.equal(toSupabaseAuthError(new ApiError(0, 'network')).code, 'network');
  const same = new AuthError('too-many');
  assert.equal(toSupabaseAuthError(same), same);
});

test('recuperação de senha: o e-mail volta ao app e o link define a nova senha', async () => {
  const args: unknown[][] = [];
  const a = fakeAuth({ resetPasswordForEmail: async (...x: unknown[]) => (args.push(x), { data: {}, error: null }), updateUser: async (...x: unknown[]) => (args.push(x), ok({ user: user() })), setSession: async (...x: unknown[]) => (args.push(x), ok({ user: user(), session: {} })) });
  const { backend } = make(a);
  await backend.sendPasswordReset('ana@exemplo.com');
  assert.deepEqual(args[0], ['ana@exemplo.com', { redirectTo: 'flipandbrew://nova-senha' }]);
  await backend.resetPasswordWithLink!('flipandbrew://nova-senha#access_token=aa&refresh_token=rr&type=recovery', 'SenhaNova123');
  assert.deepEqual(args[1], [{ access_token: 'aa', refresh_token: 'rr' }]);
  assert.deepEqual(args[2], [{ password: 'SenhaNova123' }]);
  assert.deepEqual(a.calls.filter((c) => c === 'setSession' || c === 'updateUser'), ['setSession', 'updateUser']);
});

test('link vencido, usado ou sem dados vira "link-expired" e não mexe na sessão', async () => {
  const a = fakeAuth();
  const { backend } = make(a);
  for (const url of ['flipandbrew://nova-senha#error=access_denied&error_code=otp_expired', 'flipandbrew://nova-senha', '']) {
    await assert.rejects(backend.resetPasswordWithLink!(url, 'SenhaNova123'), (e: AuthError) => e.code === 'link-expired');
  }
  assert.equal(a.calls.includes('setSession'), false);
});

test('senha fraca no passo final volta como weak-password', async () => {
  const { backend } = make(fakeAuth({ updateUser: async () => ({ data: { user: null }, error: Object.assign(new Error('weak'), { code: 'weak_password' }) }) }));
  await assert.rejects(backend.resetPasswordWithLink!('flipandbrew://nova-senha#access_token=a&refresh_token=b', '123'), (e: AuthError) => e.code === 'weak-password');
});

test('erro do portão do Supabase sem código (chave inválida) mostra a mensagem real, não "undefined"', () => {
  const e = toSupabaseAuthError(Object.assign(new Error('Invalid API key'), { name: 'AuthApiError', status: 401, code: undefined }));
  assert.equal(e.code, 'unknown');
  assert.equal(e.message, 'Invalid API key');
});
