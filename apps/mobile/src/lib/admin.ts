import { useAuth } from '@/store/useAuth';

/**
 * Ferramentas de teste (copos de 1 minuto, dados de exemplo, moedas grátis) são só para administrador:
 * build de desenvolvimento, ou conta com e-mail verificado que esteja em EXPO_PUBLIC_ADMIN_EMAILS (separados por vírgula).
 * É uma trava de interface, não de segurança: as ferramentas só mexem nos dados do próprio aparelho.
 * Atenção: variáveis EXPO_PUBLIC_* vão dentro do app, então o e-mail do administrador fica visível para quem abrir o pacote.
 */
export function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

type AdminUser = { email: string | null; emailVerified: boolean } | null;

export function isAdminUser(user: AdminUser, emails: string[] = parseAdminEmails(process.env.EXPO_PUBLIC_ADMIN_EMAILS)): boolean {
  if (!user?.email || !user.emailVerified) return false;
  return emails.includes(user.email.trim().toLowerCase());
}

const isDevBuild = () => typeof __DEV__ !== 'undefined' && __DEV__;

/** Para regras fora de componentes (por exemplo, iniciar o copo). */
export function canUseTestTools(): boolean {
  return isDevBuild() || isAdminUser(useAuth.getState().user);
}

/** Para telas: reage ao login e à saída da conta. */
export function useTestTools(): boolean {
  const user = useAuth((s) => s.user);
  return isDevBuild() || isAdminUser(user);
}
