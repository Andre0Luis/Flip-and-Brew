import { isApiConfigured, isFirebaseConfigured, mockRequested } from './config';
import type { CloudBackend } from './types';

let backend: CloudBackend | null | undefined;

/**
 * Qual servidor usar: o falso em desenvolvimento quando pedido, o nosso backend (API + Supabase Auth) quando as três variáveis
 * `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` existem, o Firebase quando as chaves dele existem, ou nenhum.
 * Sem servidor, o app inteiro segue funcionando sem conta e a interface de conta não aparece.
 */
export function getBackend(): CloudBackend | null {
  if (backend !== undefined) return backend;
  if (__DEV__ && mockRequested) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    backend = (require('./mockBackend') as typeof import('./mockBackend')).mockBackend;
  } else if (isApiConfigured()) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    backend = (require('./apiBackendReal') as typeof import('./apiBackendReal')).apiBackend;
  } else if (isFirebaseConfigured()) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    backend = (require('./firebaseBackend') as typeof import('./firebaseBackend')).firebaseBackend;
  } else {
    backend = null;
  }
  return backend;
}

export const cloudAvailable = () => getBackend() !== null;
export * from './types';
export { toAuthError, isValidEmail, MIN_PASSWORD } from './errors';
