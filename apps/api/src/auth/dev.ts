import { SignJWT, jwtVerify } from 'jose';
import type { AuthProvider, Identity } from './provider';

const key = (secret: string) => new TextEncoder().encode(secret);

/** Login de desenvolvimento: aceita tokens HS256 assinados com um segredo local. A configuração recusa isto em produção. */
export function devAuth(secret: string): AuthProvider {
  return {
    async verify(token) {
      try {
        const { payload } = await jwtVerify(token, key(secret), { algorithms: ['HS256'], issuer: 'flipandbrew-dev' });
        if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
        return { id: payload.sub, email: payload.email.toLowerCase(), emailVerified: payload.email_verified === true };
      } catch {
        return null;
      }
    },
  };
}

export async function signDevToken(secret: string, who: Identity, ttlSeconds = 3600): Promise<string> {
  return new SignJWT({ email: who.email, email_verified: who.emailVerified })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(who.id)
    .setIssuer('flipandbrew-dev')
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(key(secret));
}
