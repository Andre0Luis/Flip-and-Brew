import { AuthError, type AuthErrorCode } from './types';

const FIREBASE: Record<string, AuthErrorCode> = {
  'auth/invalid-email': 'invalid-email',
  'auth/missing-email': 'invalid-email',
  'auth/weak-password': 'weak-password',
  'auth/email-already-in-use': 'email-in-use',
  'auth/invalid-credential': 'wrong-credentials',
  'auth/wrong-password': 'wrong-credentials',
  'auth/user-not-found': 'wrong-credentials',
  'auth/invalid-login-credentials': 'wrong-credentials',
  'auth/user-disabled': 'wrong-credentials',
  'auth/too-many-requests': 'too-many',
  'auth/network-request-failed': 'network',
  'auth/requires-recent-login': 'recent-login',
  'auth/popup-closed-by-user': 'cancelled',
  'auth/cancelled-popup-request': 'cancelled',
  'auth/user-token-expired': 'recent-login',
  'auth/credential-already-in-use': 'email-in-use',
  'auth/account-exists-with-different-credential': 'email-in-use',
  // O método de login não foi ativado no console do Firebase, ou a chave do app não tem permissão.
  'auth/operation-not-allowed': 'config',
  'auth/admin-restricted-operation': 'config',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'config',
  'auth/invalid-api-key': 'config',
  'auth/app-not-authorized': 'config',
};

// Códigos da biblioteca de login com o Google (@react-native-google-signin).
const GOOGLE: Record<string, AuthErrorCode> = {
  SIGN_IN_CANCELLED: 'cancelled',
  '12501': 'cancelled',
  IN_PROGRESS: 'cancelled',
  PLAY_SERVICES_NOT_AVAILABLE: 'unavailable',
  // SHA-1 ou nome do pacote do build não batem com o cliente OAuth Android do Google Cloud.
  DEVELOPER_ERROR: 'config',
  '10': 'config',
};

// Códigos do login com a Apple (expo-apple-authentication).
const APPLE: Record<string, AuthErrorCode> = {
  ERR_REQUEST_CANCELED: 'cancelled',
  ERR_CANCELED: 'cancelled',
  ERR_REQUEST_NOT_HANDLED: 'unavailable',
  ERR_REQUEST_NOT_INTERACTIVE: 'unavailable',
};

/** Traduz qualquer erro do Firebase ou do login com o Google para um código que a interface sabe mostrar. */
export function toAuthError(e: unknown): AuthError {
  if (e instanceof AuthError) return e;
  const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: unknown }).code) : '';
  const known = FIREBASE[code] ?? GOOGLE[code] ?? APPLE[code];
  // Sem tradução conhecida, o código original vai junto, para dar para diagnosticar.
  return new AuthError(known ?? 'unknown', code || (e instanceof Error ? e.message : undefined));
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (s: string) => EMAIL.test(s.trim());
export const MIN_PASSWORD = 8;
