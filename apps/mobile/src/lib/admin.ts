import { useAuth } from '@/store/useAuth';
import type { Role } from '@/lib/cloud/types';

/**
 * Ferramentas de teste (copos de 1 minuto, dados de exemplo, moedas grátis) são só para administrador.
 * Quem é administrador o servidor decide (a lista ADMIN_EMAILS fica na API, na Vercel): o app só pergunta o papel depois do login.
 * Assim o e-mail do administrador não vai dentro do app nem do repositório. Ainda é uma trava de interface:
 * as ferramentas só mexem nos dados do próprio aparelho.
 */
type AdminUser = { emailVerified: boolean } | null;

export function isAdminUser(user: AdminUser, role: Role | null): boolean {
  return !!user?.emailVerified && role === 'admin';
}

/** Para regras fora de componentes (por exemplo, iniciar o copo). */
export function canUseTestTools(): boolean {
  const { user, role } = useAuth.getState();
  return isAdminUser(user, role);
}

/** Para telas: reage ao login e à saída da conta. */
export function useTestTools(): boolean {
  const user = useAuth((s) => s.user);
  const role = useAuth((s) => s.role);
  return isAdminUser(user, role);
}
