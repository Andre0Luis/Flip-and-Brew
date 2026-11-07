import { ApiError } from './apiClient';
import { toAuthError } from './errors';
import { AuthError, type AuthErrorCode } from './types';

// Códigos do Supabase Auth (campo `code` do erro) para os códigos que a interface sabe mostrar.
const CODES: Record<string, AuthErrorCode> = {
  invalid_credentials: 'wrong-credentials',
  user_not_found: 'wrong-credentials',
  invalid_grant: 'wrong-credentials',
  email_exists: 'email-in-use',
  user_already_exists: 'email-in-use',
  identity_already_exists: 'email-in-use',
  weak_password: 'weak-password',
  over_request_rate_limit: 'too-many',
  over_email_send_rate_limit: 'too-many',
  over_sms_send_rate_limit: 'too-many',
  email_not_confirmed: 'unconfirmed',
  otp_expired: 'link-expired',
  flow_state_expired: 'link-expired',
  validation_failed: 'invalid-email',
  email_address_invalid: 'invalid-email',
  reauthentication_needed: 'recent-login',
  reauthentication_not_valid: 'recent-login',
  session_not_found: 'recent-login',
  refresh_token_not_found: 'recent-login',
  // O provedor (e-mail, Google, Apple) não está ligado no painel do Supabase.
  provider_disabled: 'config',
  email_provider_disabled: 'config',
  signup_disabled: 'config',
  bad_oauth_callback: 'config',
  bad_oauth_state: 'config',
};

// Versões antigas não mandavam `code`; a mensagem identifica os casos comuns.
const MESSAGES: [RegExp, AuthErrorCode][] = [
  [/invalid login credentials/i, 'wrong-credentials'],
  [/email not confirmed/i, 'unconfirmed'],
  [/user already registered/i, 'email-in-use'],
  [/password should be at least|weak password/i, 'weak-password'],
  [/rate limit/i, 'too-many'],
  [/fetch failed|network request failed|failed to fetch|timed? ?out/i, 'network'],
];

/** Traduz um erro do Supabase Auth, da nossa API ou do login nativo (Google, Apple) para um código da interface. */
export function toSupabaseAuthError(e: unknown): AuthError {
  if (e instanceof AuthError) return e;
  if (e instanceof ApiError) {
    if (e.status === 0) return new AuthError('network', e.message);
    if (e.status === 401) return new AuthError('recent-login', e.code);
    if (e.status === 429) return new AuthError('too-many', e.code);
    return new AuthError('unknown', `${e.status} ${e.code}`);
  }
  const x = e as { name?: string; code?: unknown; message?: string; status?: number } | null;
  if (x?.name === 'AuthRetryableFetchError') return new AuthError('network', x.message);
  if (typeof x?.code === 'string' && CODES[x.code]) return new AuthError(CODES[x.code], x.code);
  for (const [re, code] of MESSAGES) if (x?.message && re.test(x.message)) return new AuthError(code, x.message);
  // Resposta sem `code` (por exemplo "Invalid API key", do portão da API do Supabase): a mensagem é o que diagnostica.
  if (x?.message && typeof x.code !== 'string' && x.code === undefined && x.name !== 'Error') return new AuthError('unknown', x.message);
  // Google e Apple nativos têm códigos próprios; o mapeador do Firebase já cuida deles e guarda o código original no que não conhece.
  const generic = toAuthError(e);
  return generic.code === 'unknown' && typeof x?.code === 'string' ? new AuthError('unknown', x.code) : generic;
}
