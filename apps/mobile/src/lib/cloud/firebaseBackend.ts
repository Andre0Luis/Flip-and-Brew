import { Platform } from 'react-native';
import { appStorage } from '@/store/storage';
import { firebaseConfig, googleWebClientId } from './config';
import { parseSnapshot } from './snapshot';
import { AuthError, type CloudBackend, type CloudUser, type Provider, type Snapshot } from './types';
import { toAuthError } from './errors';

// O Firebase é carregado sob demanda: quem não usa conta não paga o custo de iniciar o SDK.
/* eslint-disable @typescript-eslint/no-require-imports */
type AppMod = typeof import('firebase/app');
type AuthMod = typeof import('firebase/auth');
type FsMod = typeof import('firebase/firestore');

let cache: { auth: import('firebase/auth').Auth; db: import('firebase/firestore').Firestore; A: AuthMod; F: FsMod } | null = null;

function sdk() {
  if (cache) return cache;
  const { initializeApp, getApps, getApp } = require('firebase/app') as AppMod;
  const A = require('firebase/auth') as AuthMod;
  const F = require('firebase/firestore') as FsMod;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // No aparelho, a sessão fica guardada no mesmo armazenamento rápido do app. Na web, o padrão do SDK serve.
  const rnPersistence = (A as unknown as { getReactNativePersistence?: (s: unknown) => unknown }).getReactNativePersistence;
  let auth: import('firebase/auth').Auth;
  if (Platform.OS !== 'web' && rnPersistence) {
    const storage = {
      getItem: async (k: string) => (await appStorage.getItem(`fb:${k}`)) ?? null,
      setItem: async (k: string, v: string) => void (await appStorage.setItem(`fb:${k}`, v)),
      removeItem: async (k: string) => void (await appStorage.removeItem(`fb:${k}`)),
    };
    try {
      auth = A.initializeAuth(app, { persistence: rnPersistence(storage) as never });
    } catch {
      auth = A.getAuth(app); // já inicializado (recarga em desenvolvimento)
    }
  } else {
    auth = A.getAuth(app);
  }
  cache = { auth, db: F.getFirestore(app), A, F };
  return cache;
}

function toUser(u: import('firebase/auth').User): CloudUser {
  const provider: Provider = u.providerData.some((p) => p.providerId === 'google.com') ? 'google' : u.providerData.some((p) => p.providerId === 'apple.com') ? 'apple' : 'password';
  return { uid: u.uid, email: u.email, provider, emailVerified: u.emailVerified };
}

/** No Expo Go não existe o módulo nativo do Google, e o Metro mostra o erro como fatal mesmo dentro de try/catch. */
function inExpoGo(): boolean {
  try {
    const { default: Constants, ExecutionEnvironment } = require('expo-constants') as typeof import('expo-constants');
    return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  } catch {
    return false;
  }
}

function google() {
  if (inExpoGo()) return null;
  try {
    return require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
  } catch {
    return null;
  }
}

/** Abre o seletor de contas do Google e devolve o token que o Firebase troca por uma credencial. */
async function googleIdToken(): Promise<string> {
  const g = google();
  if (!g || !googleWebClientId) throw new AuthError('unavailable');
  g.GoogleSignin.configure({ webClientId: googleWebClientId });
  await g.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const res = await g.GoogleSignin.signIn();
  if (!g.isSuccessResponse(res)) throw new AuthError('cancelled');
  const token = res.data.idToken;
  if (!token) throw new AuthError('unknown');
  return token;
}

function apple() {
  try {
    return require('expo-apple-authentication') as typeof import('expo-apple-authentication');
  } catch {
    return null;
  }
}

// Guardado só na memória: a Apple exige revogar este código quando a conta é excluída.
let appleAuthCode: string | null = null;

/** Abre o login da Apple com um nonce (o Firebase confere o hash) e devolve a credencial do Firebase. */
async function appleCredential(A: AuthMod) {
  const Apple = apple();
  if (!Apple) throw new AuthError('unavailable');
  const Crypto = require('expo-crypto') as typeof import('expo-crypto');
  const raw = Array.from(await Crypto.getRandomBytesAsync(16), (b) => b.toString(16).padStart(2, '0')).join('');
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
  const res = await Apple.signInAsync({
    requestedScopes: [Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL],
    nonce: hashed,
  });
  if (!res.identityToken) throw new AuthError('unknown');
  appleAuthCode = res.authorizationCode ?? null;
  return new A.OAuthProvider('apple.com').credential({ idToken: res.identityToken, rawNonce: raw });
}

const wrap = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    throw toAuthError(e);
  }
};

export const firebaseBackend: CloudBackend = {
  kind: 'firebase',

  onChange(cb) {
    const { auth, A } = sdk();
    return A.onAuthStateChanged(auth, (u) => cb(u ? toUser(u) : null));
  },

  googleAvailable: () => Platform.OS !== 'web' && !!googleWebClientId && !!google(),

  appleAvailable: () => Platform.OS === 'ios' && !!apple(),

  signUp: (email, password) =>
    wrap(async () => {
      const { auth, A } = sdk();
      const cred = await A.createUserWithEmailAndPassword(auth, email.trim(), password);
      A.sendEmailVerification(cred.user).catch(() => {}); // a confirmação é um complemento, não trava o cadastro
      return toUser(cred.user);
    }),

  signIn: (email, password) =>
    wrap(async () => {
      const { auth, A } = sdk();
      return toUser((await A.signInWithEmailAndPassword(auth, email.trim(), password)).user);
    }),

  signInGoogle: () =>
    wrap(async () => {
      const { auth, A } = sdk();
      const cred = A.GoogleAuthProvider.credential(await googleIdToken());
      return toUser((await A.signInWithCredential(auth, cred)).user);
    }),

  signInApple: () =>
    wrap(async () => {
      const { auth, A } = sdk();
      return toUser((await A.signInWithCredential(auth, await appleCredential(A))).user);
    }),

  sendVerificationEmail: () =>
    wrap(async () => {
      const { auth, A } = sdk();
      if (!auth.currentUser) throw new AuthError('wrong-credentials');
      await A.sendEmailVerification(auth.currentUser);
    }),

  refreshUser: () =>
    wrap(async () => {
      const { auth } = sdk();
      if (!auth.currentUser) return null;
      await auth.currentUser.reload();
      return auth.currentUser ? toUser(auth.currentUser) : null;
    }),

  changePassword: (current, next) =>
    wrap(async () => {
      const { auth, A } = sdk();
      const user = auth.currentUser;
      if (!user?.email) throw new AuthError('wrong-credentials');
      await A.reauthenticateWithCredential(user, A.EmailAuthProvider.credential(user.email, current));
      await A.updatePassword(user, next);
    }),

  sendPasswordReset: (email) =>
    wrap(async () => {
      const { auth, A } = sdk();
      await A.sendPasswordResetEmail(auth, email.trim());
    }),

  signOut: () =>
    wrap(async () => {
      const { auth, A } = sdk();
      await A.signOut(auth);
      await google()?.GoogleSignin.signOut().catch(() => {});
    }),

  reauthenticate: (password) =>
    wrap(async () => {
      const { auth, A } = sdk();
      const user = auth.currentUser;
      if (!user) throw new AuthError('wrong-credentials');
      if (user.providerData.some((p) => p.providerId === 'google.com')) {
        await A.reauthenticateWithCredential(user, A.GoogleAuthProvider.credential(await googleIdToken()));
      } else if (user.providerData.some((p) => p.providerId === 'apple.com')) {
        await A.reauthenticateWithCredential(user, await appleCredential(A));
      } else {
        if (!user.email || !password) throw new AuthError('wrong-credentials');
        await A.reauthenticateWithCredential(user, A.EmailAuthProvider.credential(user.email, password));
      }
    }),

  deleteAccount: () =>
    wrap(async () => {
      const { auth, db, A, F } = sdk();
      const user = auth.currentUser;
      if (!user) return;
      // Primeiro os dados, depois a conta: se a exclusão da conta falhar, dá para tentar de novo sem deixar backup órfão.
      await F.deleteDoc(F.doc(db, 'users', user.uid));
      // A Apple exige revogar o acesso ao apagar a conta. Se a revogação falhar, a exclusão segue: não prendemos a pessoa.
      if (appleAuthCode && user.providerData.some((p) => p.providerId === 'apple.com')) {
        await A.revokeAccessToken(auth, appleAuthCode).catch(() => {});
        appleAuthCode = null;
      }
      await A.deleteUser(user);
      await google()?.GoogleSignin.signOut().catch(() => {});
    }),

  getSnapshot: (uid) =>
    wrap(async () => {
      const { db, F } = sdk();
      const snap = await F.getDoc(F.doc(db, 'users', uid));
      return snap.exists() ? parseSnapshot(snap.data()) : null;
    }),

  putSnapshot: (uid, snapshot: Snapshot) =>
    wrap(async () => {
      const { db, F } = sdk();
      await F.setDoc(F.doc(db, 'users', uid), snapshot);
    }),
};
