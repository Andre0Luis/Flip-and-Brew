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
};

// Códigos da biblioteca de login com o Google (@react-native-google-signin).
const GOOGLE: Record<string, AuthErrorCode> = {
  SIGN_IN_CANCELLED: 'cancelled',
  '12501': 'cancelled',
  IN_PROGRESS: 'cancelled',
  PLAY_SERVICES_NOT_AVAILABLE: 'unavailable',
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
  return new AuthError(FIREBASE[code] ?? GOOGLE[code] ?? APPLE[code] ?? 'unknown', e instanceof Error ? e.message : undefined);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (s: string) => EMAIL.test(s.trim());
export const MIN_PASSWORD = 8;
