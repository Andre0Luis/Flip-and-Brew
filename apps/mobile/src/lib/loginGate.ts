import type { AuthStatus } from '@/store/useAuth';

/** O que mostrar na raiz do app. Função pura, testada em Node. */
export type GateScreen = 'intro' | 'loading' | 'login' | 'firstSteps' | 'app';

export type GateInput = {
  /** o login é obrigatório (só com o backend próprio ligado; o Firebase continua opcional) */
  required: boolean;
  onboarded: boolean;
  status: AuthStatus;
  firstStepsDone: boolean;
};

/**
 * Ordem: introdução, depois (com login obrigatório) a tela de entrar, depois a orientação de primeiros passos, depois o app.
 * Sem login obrigatório nada muda: o app abre direto e a conta continua opcional.
 */
export function gateScreen({ required, onboarded, status, firstStepsDone }: GateInput): GateScreen {
  if (!onboarded) return 'intro';
  if (!required) return 'app';
  if (status === 'loading') return 'loading';
  if (status === 'signedOut') return 'login';
  return firstStepsDone ? 'app' : 'firstSteps';
}
