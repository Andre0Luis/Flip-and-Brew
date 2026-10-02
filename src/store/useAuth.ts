import { create } from 'zustand';
import type { CloudUser, Snapshot } from '@/lib/cloud/types';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';
export type SyncState = 'idle' | 'syncing' | 'ok' | 'error';

/** Estado da conta nesta sessão. Não é salvo: o Firebase guarda o login e o backup guarda o resto. */
type AuthState = {
  status: AuthStatus;
  user: CloudUser | null;
  sync: SyncState;
  lastBackupAt: number | null;
  /** o primeiro cruzamento entre aparelho e nuvem já foi resolvido; só então o backup automático liga */
  ready: boolean;
  /** backup da nuvem aguardando a pessoa escolher entre ele e os dados deste aparelho */
  choice: Snapshot | null;
};

export const useAuth = create<AuthState>()(() => ({
  status: 'loading',
  user: null,
  sync: 'idle',
  lastBackupAt: null,
  ready: false,
  choice: null,
}));
