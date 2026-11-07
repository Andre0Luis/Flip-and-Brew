import { Platform } from 'react-native';
import { googleWebClientId } from './config';
import { AuthError } from './types';

// Login nativo com o Google e a Apple, usado pelo apiBackend. (O firebaseBackend tem a própria cópia, que some no corte do Firebase.)

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

export const googleAvailable = () => Platform.OS !== 'web' && !!googleWebClientId && !!google();

/** Abre o seletor de contas do Google e devolve o token de identidade, que o Supabase troca por uma sessão. */
export async function googleIdToken(): Promise<string> {
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

export const appleAvailable = () => Platform.OS === 'ios' && !!apple();

/** Abre o login da Apple com um nonce: a Apple recebe o hash e o Supabase confere com o valor original. */
export async function appleCredential(): Promise<{ idToken: string; nonce: string }> {
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
  return { idToken: res.identityToken, nonce: raw };
}
