import type { GoTrueClient, Session, User } from '@supabase/auth-js';
import type { ApiClient, Language } from './apiClient';
import { RECOVERY_REDIRECT, parseRecoveryUrl } from './recoveryLink';
import { toSupabaseAuthError } from './supabaseErrors';
import { AuthError, type CloudBackend, type CloudUser, type Provider, type Role, type Snapshot } from './types';

/** O pedaço do cliente de login (Supabase Auth) que usamos; permite trocar por um falso nos testes. */
export type AuthClient = Pick<
  GoTrueClient,
  'getSession' | 'onAuthStateChange' | 'signUp' | 'signInWithPassword' | 'signInWithIdToken' | 'resend' | 'refreshSession' | 'updateUser' | 'resetPasswordForEmail' | 'setSession' | 'signOut'
>;

export type ApiBackendDeps = {
  auth: AuthClient;
  api: ApiClient;
  getLanguage: () => Language;
  google?: { available: () => boolean; idToken: () => Promise<string> };
  apple?: { available: () => boolean; credential: () => Promise<{ idToken: string; nonce: string }> };
};

const providerOf = (u: User): Provider => {
  const p = u.app_metadata?.provider;
  return p === 'google' ? 'google' : p === 'apple' ? 'apple' : 'password';
};

export const toCloudUser = (u: User): CloudUser => ({ uid: u.id, email: u.email ?? null, provider: providerOf(u), emailVerified: !!u.email_confirmed_at });

/**
 * O nosso backend atrás da mesma interface do Firebase: login pelo Supabase Auth e backup pela API (apps/api).
 * Depois do login, `ensureProfile` chama `POST /v1/me/bootstrap` (cria o perfil e manda as boas-vindas, uma vez); o backup espera por ele.
 */
export function createApiBackend(d: ApiBackendDeps): CloudBackend {
  const { auth, api } = d;
  const profiles = new Map<string, Promise<Awaited<ReturnType<ApiClient['bootstrap']>>>>();

  const ensureProfile = (uid: string) => {
    let p = profiles.get(uid);
    if (!p) {
      p = api.bootstrap(d.getLanguage()).catch((e) => {
        profiles.delete(uid); // sem rede agora: tenta de novo na próxima chamada
        throw e;
      });
      profiles.set(uid, p);
    }
    return p;
  };

  const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (e) {
      throw toSupabaseAuthError(e);
    }
  };

  const must = <T extends { error: unknown }>(r: T): T => {
    if (r.error) throw r.error;
    return r;
  };

  const sessionUser = async (): Promise<User> => {
    const { data } = must(await auth.getSession());
    if (!data.session) throw new AuthError('recent-login');
    return data.session.user;
  };

  const userOf = (data: { user: User | null; session?: Session | null }): CloudUser => {
    if (!data.user) throw new AuthError('unknown');
    return toCloudUser(data.user);
  };

  return {
    kind: 'api',

    onChange(cb) {
      let last: string | undefined;
      const emit = (user: CloudUser | null) => {
        const key = user ? `${user.uid}:${user.emailVerified}` : '';
        if (key === last) return;
        last = key;
        cb(user);
        if (user) void ensureProfile(user.uid).catch(() => {}); // o backup repete a tentativa se isto falhar
      };
      void auth
        .getSession()
        .then(({ data }) => emit(data.session ? toCloudUser(data.session.user) : null))
        .catch(() => emit(null));
      const { data } = auth.onAuthStateChange((_event, session) => emit(session ? toCloudUser(session.user) : null));
      return () => data.subscription.unsubscribe();
    },

    getRole: () =>
      wrap(async (): Promise<Role> => {
        const { profile } = await ensureProfile((await sessionUser()).id);
        return profile.role === 'admin' ? 'admin' : 'user';
      }),

    googleAvailable: () => !!d.google?.available(),
    appleAvailable: () => !!d.apple?.available(),

    signUp: (email, password) =>
      wrap(async () => {
        const { data } = must(await auth.signUp({ email, password }));
        // Com e-mail já cadastrado e confirmação ligada, o Supabase não avisa (protege contra enumeração) e devolve uma conta sem identidades.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new AuthError('email-in-use');
        return userOf(data);
      }),

    signIn: (email, password) => wrap(async () => userOf(must(await auth.signInWithPassword({ email, password })).data)),

    signInGoogle: () =>
      wrap(async () => {
        if (!d.google) throw new AuthError('unavailable');
        const token = await d.google.idToken();
        return userOf(must(await auth.signInWithIdToken({ provider: 'google', token })).data);
      }),

    signInApple: () =>
      wrap(async () => {
        if (!d.apple) throw new AuthError('unavailable');
        const { idToken, nonce } = await d.apple.credential();
        return userOf(must(await auth.signInWithIdToken({ provider: 'apple', token: idToken, nonce })).data);
      }),

    sendVerificationEmail: () =>
      wrap(async () => {
        const email = (await sessionUser()).email;
        if (!email) throw new AuthError('unknown');
        must(await auth.resend({ type: 'signup', email }));
      }),

    refreshUser: () =>
      wrap(async () => {
        const { data, error } = await auth.refreshSession();
        if (error || !data.user) return null;
        return toCloudUser(data.user);
      }),

    changePassword: (current, next) =>
      wrap(async () => {
        const email = (await sessionUser()).email;
        if (!email) throw new AuthError('unknown');
        must(await auth.signInWithPassword({ email, password: current })); // confirma a senha atual
        must(await auth.updateUser({ password: next }));
      }),

    // O link do e-mail volta ao app em `flipandbrew://nova-senha` (precisa estar em Redirect URLs no painel do Supabase).
    sendPasswordReset: (email) => wrap(async () => void must(await auth.resetPasswordForEmail(email, { redirectTo: RECOVERY_REDIRECT }))),

    resetPasswordWithLink: (url, next) =>
      wrap(async () => {
        const link = parseRecoveryUrl(url);
        if (!link) throw new AuthError('link-expired');
        if (link.kind === 'error') throw new AuthError(link.code === 'otp_expired' || link.code === 'access_denied' ? 'link-expired' : 'unknown', link.code);
        must(await auth.setSession({ access_token: link.accessToken, refresh_token: link.refreshToken }));
        must(await auth.updateUser({ password: next }));
      }),

    signOut: () =>
      wrap(async () => {
        profiles.clear();
        must(await auth.signOut());
      }),

    reauthenticate: (password) =>
      wrap(async () => {
        if (!password) return; // Google e Apple: a sessão atual basta
        const email = (await sessionUser()).email;
        if (!email) throw new AuthError('unknown');
        must(await auth.signInWithPassword({ email, password }));
      }),

    deleteAccount: () =>
      wrap(async () => {
        await api.deleteAccount();
        profiles.clear();
        await auth.signOut().catch(() => {}); // a conta já foi apagada no servidor; sair é só limpar o aparelho
      }),

    getSnapshot: (uid) =>
      wrap(async () => {
        await ensureProfile(uid);
        return (await api.getSnapshot()) as Snapshot | null;
      }),

    putSnapshot: (uid, snapshot) =>
      wrap(async () => {
        await ensureProfile(uid);
        await api.putSnapshot({ v: 1, updatedAt: snapshot.updatedAt, data: snapshot.data as unknown as Record<string, unknown> });
      }),
  };
}
