// As chaves vêm do .env (EXPO_PUBLIC_*). O Expo troca cada `process.env.EXPO_PUBLIC_X` pelo valor na hora do build,
// então cada variável precisa ser escrita por extenso, nunca montada dinamicamente.
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

/** Só em desenvolvimento: troca o Firebase por um servidor falso na memória, para testar as telas sem chaves. */
export const mockRequested = process.env.EXPO_PUBLIC_AUTH_MODE === 'mock';

export function isFirebaseConfigured(c: typeof firebaseConfig = firebaseConfig): boolean {
  return !!(c.apiKey && c.projectId && c.appId);
}
