import type { Session } from '@/store/types';
import { cleanProfile, hasProfile } from '@/lib/profile';
import type { Snapshot, SnapshotData } from './types';

/** Limite de sessões no backup, para o documento ficar bem abaixo de 1 MB do Firestore. */
export const MAX_SESSIONS = 1500;
/** Um check-in por dia: 2 anos bastam e o documento continua minúsculo. */
export const MAX_CHECKINS = 730;
const STARTING_COINS = 100;
const STARTER_ITEMS = 3;

/** Campos do estado que entram no backup. O estado completo do app tem mais coisas, e isso é de propósito. */
export type LocalData = Omit<SnapshotData, 'settings'> & {
  settings: SnapshotData['settings'] & Record<string, unknown>;
};

export function buildSnapshot(local: LocalData, now: number): Snapshot {
  const s = local.settings;
  // O Firestore rejeita `undefined`. Passar pelo JSON descarta as chaves vazias, como as de sessões sem humor ou gatilho.
  return JSON.parse(JSON.stringify({
    v: 1,
    updatedAt: now,
    data: {
      coins: local.coins,
      owned: [...local.owned],
      brewerId: local.brewerId,
      cupId: local.cupId,
      packId: local.packId,
      sessions: local.sessions.slice(-MAX_SESSIONS),
      checkins: (local.checkins ?? []).slice(-MAX_CHECKINS),
      profile: cleanProfile(local.profile),
      practiceAccepted: local.practiceAccepted,
      practicesDone: [...local.practicesDone],
      articlesRead: [...local.articlesRead],
      settings: { goalMin: s.goalMin, language: s.language, themeMode: s.themeMode, autoStart: s.autoStart, notifyOnDone: s.notifyOnDone },
    },
  })) as Snapshot;
}

/** Há algo aqui que valha proteger de uma substituição? Um app recém-instalado não tem. */
export function hasMeaningfulData(d: Pick<SnapshotData, 'coins' | 'owned' | 'sessions' | 'practicesDone' | 'articlesRead'> & { checkins?: unknown[]; profile?: object }): boolean {
  return d.sessions.length > 0 || (d.checkins?.length ?? 0) > 0 || hasProfile(d.profile ?? {}) || d.practicesDone.length > 0 || d.articlesRead.length > 0 || d.owned.length > STARTER_ITEMS || d.coins !== STARTING_COINS;
}

/** Um snapshot salvo na nuvem pode ter sido gravado por outra versão; só aceita o que reconhece. */
export function parseSnapshot(raw: unknown): Snapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { v?: unknown; updatedAt?: unknown; data?: unknown };
  if (r.v !== 1 || typeof r.updatedAt !== 'number' || !r.data || typeof r.data !== 'object') return null;
  const d = r.data as Partial<SnapshotData>;
  const ok =
    typeof d.coins === 'number' &&
    Array.isArray(d.owned) &&
    Array.isArray(d.sessions) &&
    (d.checkins === undefined || Array.isArray(d.checkins)) &&
    (d.profile === undefined || (typeof d.profile === 'object' && d.profile !== null && !Array.isArray(d.profile))) &&
    Array.isArray(d.practicesDone) &&
    Array.isArray(d.articlesRead) &&
    typeof d.brewerId === 'string' &&
    typeof d.cupId === 'string' &&
    (d.packId === undefined || typeof d.packId === 'string') &&
    !!d.settings;
  return ok ? (raw as Snapshot) : null;
}

export type SyncDecision = 'noop' | 'push' | 'restore' | 'ask';

const sameData = (a: SnapshotData, b: SnapshotData) =>
  a.coins === b.coins && a.sessions.length === b.sessions.length && a.owned.length === b.owned.length && a.articlesRead.length === b.articlesRead.length && a.practicesDone.length === b.practicesDone.length && (a.checkins?.length ?? 0) === (b.checkins?.length ?? 0) && JSON.stringify(cleanProfile(a.profile)) === JSON.stringify(cleanProfile(b.profile));

/** O que fazer logo depois de entrar na conta. Nunca sobrescreve dados dos dois lados sem perguntar. */
export function decideInitialSync(local: LocalData, remote: Snapshot | null): SyncDecision {
  const localHas = hasMeaningfulData(local);
  if (!remote) return localHas ? 'push' : 'noop';
  if (!localHas) return 'restore';
  return sameData(buildSnapshot(local, 0).data, remote.data) ? 'noop' : 'ask';
}

/** Estado local resultante de aplicar um snapshot. As configurações do aparelho são preservadas. */
export function applySnapshot<S extends Record<string, unknown>>(current: { settings: S; packId?: string }, snap: Snapshot) {
  const d = snap.data;
  return {
    coins: d.coins,
    owned: d.owned,
    brewerId: d.brewerId,
    cupId: d.cupId,
    packId: d.packId ?? current.packId ?? 'pack-extraforte',
    sessions: d.sessions as Session[],
    checkins: d.checkins ?? [],
    profile: cleanProfile(d.profile),
    practiceAccepted: d.practiceAccepted,
    practicesDone: d.practicesDone,
    articlesRead: d.articlesRead,
    settings: { ...current.settings, ...d.settings },
  };
}

/** Assinatura barata do que entra no backup, para saber se vale agendar um novo. */
export function dataSignature(d: LocalData): string {
  const s = d.settings;
  return [d.coins, d.owned.length, d.sessions.length, d.sessions.at(-1)?.id ?? '', d.sessions.at(-1)?.mood ?? '', d.sessions.at(-1)?.trigger ?? '', d.checkins?.length ?? 0, d.checkins?.at(-1)?.energy ?? '', JSON.stringify(cleanProfile(d.profile)), d.brewerId, d.cupId, d.packId ?? '', d.articlesRead.length, d.practicesDone.length, s.goalMin, s.language, s.themeMode, s.autoStart, s.notifyOnDone].join('|');
}
