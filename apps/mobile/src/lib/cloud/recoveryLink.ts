/** Endereço para onde o link do e-mail de recuperação de senha volta ao app. Precisa estar em Redirect URLs, no painel do Supabase. */
export const RECOVERY_REDIRECT = 'flipandbrew://nova-senha';

export type RecoveryLink = { kind: 'tokens'; accessToken: string; refreshToken: string } | { kind: 'error'; code: string };

const decode = (s: string) => {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  } catch {
    return s;
  }
};

/**
 * Lê o link que o Supabase manda no e-mail de recuperação. Os dados vêm no fragmento (`#access_token=...&refresh_token=...`)
 * ou, em alguns casos, na query (`?`); em erro vêm `error` e `error_code`. Devolve null se o endereço não traz nada disso.
 */
export function parseRecoveryUrl(url: string | null | undefined): RecoveryLink | null {
  if (!url) return null;
  const start = url.search(/[?#]/);
  if (start < 0) return null;
  const params: Record<string, string> = {};
  for (const part of url.slice(start + 1).split(/[&#?]/)) {
    if (!part) continue;
    const eq = part.indexOf('=');
    params[decode(eq < 0 ? part : part.slice(0, eq))] = eq < 0 ? '' : decode(part.slice(eq + 1));
  }
  if (params.error_code || params.error) return { kind: 'error', code: params.error_code || params.error };
  if (params.access_token && params.refresh_token) return { kind: 'tokens', accessToken: params.access_token, refreshToken: params.refresh_token };
  return null;
}
