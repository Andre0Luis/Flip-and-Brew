import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify, type JWTVerifyGetKey } from 'jose';
import type { AuthProvider } from './provider';

/**
 * Confere o token de acesso do Supabase Auth.
 * - HS256: com o segredo JWT do projeto (`SUPABASE_JWT_SECRET`), o caso dos projetos com a chave legada.
 * - Assimétrico (ES256/RS256): com as chaves públicas do projeto (JWKS), o caso das chaves de assinatura novas.
 * A chave `anon` e a `service_role` também são JWTs assinados com o mesmo segredo; por isso exigimos `role = authenticated`,
 * um `sub` de usuário e que a conta não seja anônima. Sem isso a chave pública `anon` valeria como login.
 */
export function supabaseAuth(o: { url: string; jwtSecret?: string; jwks?: JWTVerifyGetKey }): AuthProvider {
  const issuer = `${o.url.replace(/\/$/, '')}/auth/v1`;
  const jwks = o.jwks ?? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  const secret = o.jwtSecret ? new TextEncoder().encode(o.jwtSecret) : null;
  return {
    async verify(token) {
      try {
        const alg = decodeProtectedHeader(token).alg;
        const opts = { issuer, audience: 'authenticated' };
        let payload;
        if (alg === 'HS256') {
          if (!secret) return null;
          ({ payload } = await jwtVerify(token, secret, { ...opts, algorithms: ['HS256'] }));
        } else if (alg === 'ES256' || alg === 'RS256') {
          ({ payload } = await jwtVerify(token, jwks, { ...opts, algorithms: ['ES256', 'RS256'] }));
        } else {
          return null; // inclui "none"
        }
        if (payload.role !== 'authenticated' || payload.is_anonymous === true) return null;
        if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
        const meta = payload.user_metadata as { email_verified?: unknown } | undefined;
        return { id: payload.sub, email: payload.email.toLowerCase(), emailVerified: meta?.email_verified === true };
      } catch {
        return null;
      }
    },
  };
}
