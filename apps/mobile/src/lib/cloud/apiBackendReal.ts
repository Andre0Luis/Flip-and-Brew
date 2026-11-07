import type { CloudBackend } from './types';
import { createApiBackend } from './apiBackend';
import { createApiClient } from './apiClient';

// A instância de verdade, montada com as variáveis de ambiente. Fica fora do apiBackend.ts porque importa o React Native
// (os testes rodam em Node). Só é carregada quando `isApiConfigured()` (ver index.ts).
function createRealBackend(): CloudBackend {
  const { AppState, Platform } = require('react-native') as typeof import('react-native');
  const { GoTrueClient: Client } = require('@supabase/auth-js') as typeof import('@supabase/auth-js');
  const { apiConfig } = require('./config') as typeof import('./config');
  const { appStorage } = require('@/store/storage') as typeof import('@/store/storage');
  const social = require('./socialNative') as typeof import('./socialNative');

  const auth = new Client({
    url: `${apiConfig.supabaseUrl}/auth/v1`,
    headers: { apikey: apiConfig.supabaseAnonKey },
    storageKey: 'flip-and-brew-auth',
    // A sessão fica no MMKV, como o resto do app; o refresh automático só roda com o app em primeiro plano.
    storage: { getItem: (k) => appStorage.getItem(k) as string | null, setItem: (k, v) => void appStorage.setItem(k, v), removeItem: (k) => void appStorage.removeItem(k) },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  });
  if (Platform.OS !== 'web') {
    void auth.startAutoRefresh();
    AppState.addEventListener('change', (s) => void (s === 'active' ? auth.startAutoRefresh() : auth.stopAutoRefresh()));
  }

  const api = createApiClient({
    baseUrl: apiConfig.apiUrl,
    getToken: async () => (await auth.getSession()).data.session?.access_token ?? null,
  });

  return createApiBackend({
    auth,
    api,
    getLanguage: () => (require('@/store/useApp') as typeof import('@/store/useApp')).useApp.getState().settings.language,
    google: { available: social.googleAvailable, idToken: social.googleIdToken },
    apple: { available: social.appleAvailable, credential: social.appleCredential },
  });
}

export const apiBackend: CloudBackend = createRealBackend();
