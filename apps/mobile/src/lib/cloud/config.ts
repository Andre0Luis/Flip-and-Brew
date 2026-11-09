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
/** Cliente OAuth iOS do Google (público, como o do Android). O iPhone precisa dele no seletor de contas; o `iosUrlScheme` do `app.json` é este ID invertido. */
export const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '281468064554-kfe8a2a2kk35eob3h1101blt8126maeu.apps.googleusercontent.com';

/** Só em desenvolvimento: troca o Firebase por um servidor falso na memória, para testar as telas sem chaves. */
export const mockRequested = process.env.EXPO_PUBLIC_AUTH_MODE === 'mock';

export function isFirebaseConfigured(c: typeof firebaseConfig = firebaseConfig): boolean {
  return !!(c.apiKey && c.projectId && c.appId);
}

// O nosso backend (apps/api) e o Supabase Auth. As três são públicas (a chave `anon` do Supabase vai dentro do app por desenho);
// a segurança está na RLS do banco e na verificação do token pela API. Cada variável é escrita por extenso (o Expo as troca no build).
export const apiConfig = {
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, ''),
  supabaseUrl: (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, ''),
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

/** A chave pública do Supabase é um JWT (`eyJ...`) ou uma chave nova (`sb_publishable_...`). Qualquer outra coisa, como um texto de exemplo esquecido, não liga o backend. */
export const looksLikeSupabaseKey = (k: string) => /^(eyJ[\w-]+\.[\w-]+\.[\w-]+|sb_publishable_[\w-]+)$/.test(k.trim());

export function isApiConfigured(c: typeof apiConfig = apiConfig): boolean {
  return !!(c.apiUrl && c.supabaseUrl && looksLikeSupabaseKey(c.supabaseAnonKey));
}
