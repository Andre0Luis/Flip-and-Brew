/** Quem está do outro lado, depois que o token foi conferido. */
export type Identity = { id: string; email: string; emailVerified: boolean };

/** Conferir um token de login. Há duas implementações: `dev` (local) e `supabase` (última fase do plano, ADR-0024). */
export interface AuthProvider {
  verify(token: string): Promise<Identity | null>;
}
