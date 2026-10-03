import { useApp } from '@/store/useApp';
import { useAuth } from '@/store/useAuth';
import { getBackend } from './index';
import { applySnapshot, buildSnapshot, dataSignature, decideInitialSync, type LocalData } from './snapshot';
import type { Snapshot } from './types';

const AUTO_BACKUP_DELAY_MS = 8_000;

export function localData(): LocalData {
  const s = useApp.getState();
  return {
    coins: s.coins,
    owned: s.owned,
    brewerId: s.brewerId,
    cupId: s.cupId,
    sessions: s.sessions,
    checkins: s.checkins,
    practiceAccepted: s.practiceAccepted,
    practicesDone: s.practicesDone,
    articlesRead: s.articlesRead,
    settings: s.settings,
  };
}

let lastSignature = '';
const remember = () => (lastSignature = dataSignature(localData()));

function apply(snapshot: Snapshot) {
  const current = useApp.getState();
  useApp.setState(applySnapshot(current, snapshot));
  remember();
}

/** Envia o progresso deste aparelho para a nuvem. */
export async function backupNow(): Promise<boolean> {
  const backend = getBackend();
  const { user } = useAuth.getState();
  if (!backend || !user) return false;
  useAuth.setState({ sync: 'syncing' });
  try {
    const snap = buildSnapshot(localData(), Date.now());
    await backend.putSnapshot(user.uid, snap);
    remember();
    useAuth.setState({ sync: 'ok', lastBackupAt: snap.updatedAt });
    return true;
  } catch {
    useAuth.setState({ sync: 'error' });
    return false;
  }
}

/** Troca os dados deste aparelho pelos da nuvem. Devolve false se não há backup ou se falhou. */
export async function restoreNow(): Promise<boolean> {
  const backend = getBackend();
  const { user } = useAuth.getState();
  if (!backend || !user) return false;
  useAuth.setState({ sync: 'syncing' });
  try {
    const remote = await backend.getSnapshot(user.uid);
    if (!remote) {
      useAuth.setState({ sync: 'ok' });
      return false;
    }
    apply(remote);
    useAuth.setState({ sync: 'ok', lastBackupAt: remote.updatedAt });
    return true;
  } catch {
    useAuth.setState({ sync: 'error' });
    return false;
  }
}

/** Primeiro cruzamento depois de entrar: restaura, envia ou pergunta, mas nunca sobrescreve dados dos dois lados sozinho. */
export async function initialSync(uid: string): Promise<void> {
  const backend = getBackend();
  if (!backend) return;
  useAuth.setState({ sync: 'syncing', ready: false, choice: null });
  try {
    const remote = await backend.getSnapshot(uid);
    const decision = decideInitialSync(localData(), remote);
    if (decision === 'restore' && remote) {
      apply(remote);
      useAuth.setState({ lastBackupAt: remote.updatedAt });
    } else if (decision === 'push') {
      const snap = buildSnapshot(localData(), Date.now());
      await backend.putSnapshot(uid, snap);
      useAuth.setState({ lastBackupAt: snap.updatedAt });
    } else if (decision === 'ask' && remote) {
      useAuth.setState({ choice: remote, lastBackupAt: remote.updatedAt });
      useAuth.setState({ sync: 'idle' });
      return; // o backup automático só liga depois da escolha
    } else if (remote) {
      useAuth.setState({ lastBackupAt: remote.updatedAt });
    }
    remember();
    useAuth.setState({ sync: 'ok', ready: true });
  } catch {
    useAuth.setState({ sync: 'error', ready: true });
  }
}

/** Resolve o conflito do primeiro login: mantém este aparelho (envia) ou usa a nuvem (restaura). */
export async function resolveChoice(pick: 'local' | 'cloud'): Promise<void> {
  const { choice } = useAuth.getState();
  if (!choice) return;
  useAuth.setState({ choice: null });
  if (pick === 'cloud') {
    apply(choice);
    useAuth.setState({ sync: 'ok', ready: true, lastBackupAt: choice.updatedAt });
  } else {
    useAuth.setState({ ready: true });
    await backupNow();
  }
}

/** Liga o backup automático: depois de uma mudança relevante, espera um pouco e envia. Devolve a função que desliga. */
export function startAutoBackup(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const unsub = useApp.subscribe(() => {
    const { status, ready, choice } = useAuth.getState();
    if (status !== 'signedIn' || !ready || choice) return;
    if (dataSignature(localData()) === lastSignature) return;
    clearTimeout(timer);
    timer = setTimeout(() => void backupNow(), AUTO_BACKUP_DELAY_MS);
  });
  return () => {
    clearTimeout(timer);
    unsub();
  };
}
