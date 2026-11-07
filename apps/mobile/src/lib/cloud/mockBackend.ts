import { appStorage } from '@/store/storage';
import { makeTestData, TEST_EMAIL, TEST_PASSWORD } from '@/lib/testUser';
import { DEFAULT_SETTINGS } from '@/store/useApp';
import { buildSnapshot, parseSnapshot } from './snapshot';
import { AuthError, type CloudBackend, type CloudUser, type Snapshot } from './types';

// Servidor falso para desenvolvimento: guarda tudo no armazenamento local do aparelho ou do navegador.
// Só é usado com EXPO_PUBLIC_AUTH_MODE=mock em build de desenvolvimento. Nunca fala com a internet.
type Account = { uid: string; email: string; password: string; provider: 'password' | 'google' | 'apple'; snapshot: Snapshot | null; /** e-mail confirmado (só conta com senha começa sem) */ verified?: boolean; verifySent?: boolean };
type Db = { accounts: Account[]; currentUid: string | null };

const KEY = 'flip-and-brew-mock-auth';
const listeners = new Set<(u: CloudUser | null) => void>();

function load(): Db {
  try {
    const raw = appStorage.getItem(KEY);
    if (typeof raw === 'string') return JSON.parse(raw) as Db;
  } catch {
    // começa vazio
  }
  // Primeira vez: já existe uma conta de teste com progresso farto, pronta para entrar.
  const now = Date.now();
  const test: Account = {
    uid: 'mock-teste',
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    provider: 'password',
    snapshot: buildSnapshot({ ...makeTestData(now), settings: { ...DEFAULT_SETTINGS } }, now),
  };
  return { accounts: [test], currentUid: null };
}
const save = (db: Db) => void appStorage.setItem(KEY, JSON.stringify(db));
const view = (a: Account): CloudUser => ({ uid: a.uid, email: a.email, provider: a.provider, emailVerified: a.provider !== 'password' || !!a.verified });
const current = (db: Db) => db.accounts.find((a) => a.uid === db.currentUid) ?? null;
const emit = (db: Db) => {
  const a = current(db);
  listeners.forEach((l) => l(a ? view(a) : null));
};
const delay = () => new Promise((r) => setTimeout(r, 250));

export const mockBackend: CloudBackend = {
  kind: 'mock',

  onChange(cb) {
    listeners.add(cb);
    const a = current(load());
    cb(a ? view(a) : null);
    return () => void listeners.delete(cb);
  },

  googleAvailable: () => true,
  appleAvailable: () => true,

  async signUp(email, password) {
    await delay();
    const db = load();
    if (db.accounts.some((a) => a.email === email.trim().toLowerCase())) throw new AuthError('email-in-use');
    if (password.length < 8) throw new AuthError('weak-password');
    const acc: Account = { uid: `mock-${Date.now()}`, email: email.trim().toLowerCase(), password, provider: 'password', snapshot: null };
    db.accounts.push(acc);
    db.currentUid = acc.uid;
    save(db);
    emit(db);
    return view(acc);
  },

  async signIn(email, password) {
    await delay();
    const db = load();
    const acc = db.accounts.find((a) => a.email === email.trim().toLowerCase() && a.provider === 'password' && a.password === password);
    if (!acc) throw new AuthError('wrong-credentials');
    db.currentUid = acc.uid;
    save(db);
    emit(db);
    return view(acc);
  },

  async signInGoogle() {
    await delay();
    const db = load();
    let acc = db.accounts.find((a) => a.provider === 'google');
    if (!acc) {
      acc = { uid: `mock-g-${Date.now()}`, email: 'pessoa.teste@gmail.com', password: '', provider: 'google', snapshot: null };
      db.accounts.push(acc);
    }
    db.currentUid = acc.uid;
    save(db);
    emit(db);
    return view(acc);
  },

  async signInApple() {
    await delay();
    const db = load();
    let acc = db.accounts.find((a) => a.provider === 'apple');
    if (!acc) {
      acc = { uid: `mock-a-${Date.now()}`, email: 'pessoa.teste@privaterelay.appleid.com', password: '', provider: 'apple', snapshot: null };
      db.accounts.push(acc);
    }
    db.currentUid = acc.uid;
    save(db);
    emit(db);
    return view(acc);
  },

  async sendVerificationEmail() {
    await delay();
    const db = load();
    const acc = current(db);
    if (!acc) throw new AuthError('wrong-credentials');
    acc.verifySent = true;
    save(db);
  },

  // No servidor falso, "abrir o link do e-mail" é simulado: depois de pedir o envio, a próxima checagem confirma.
  async refreshUser() {
    await delay();
    const db = load();
    const acc = current(db);
    if (!acc) return null;
    if (acc.verifySent) acc.verified = true;
    save(db);
    emit(db);
    return view(acc);
  },

  async changePassword(currentPassword, next) {
    await delay();
    const db = load();
    const acc = current(db);
    if (!acc || acc.provider !== 'password' || acc.password !== currentPassword) throw new AuthError('wrong-credentials');
    if (next.length < 8) throw new AuthError('weak-password');
    acc.password = next;
    save(db);
  },

  async sendPasswordReset() {
    await delay();
  },

  async signOut() {
    const db = load();
    db.currentUid = null;
    save(db);
    emit(db);
  },

  async reauthenticate(password) {
    await delay();
    const acc = current(load());
    if (!acc) throw new AuthError('wrong-credentials');
    if (acc.provider === 'password' && acc.password !== password) throw new AuthError('wrong-credentials');
  },

  async deleteAccount() {
    await delay();
    const db = load();
    db.accounts = db.accounts.filter((a) => a.uid !== db.currentUid);
    db.currentUid = null;
    save(db);
    emit(db);
  },

  async getSnapshot(uid) {
    await delay();
    return parseSnapshot(load().accounts.find((a) => a.uid === uid)?.snapshot);
  },

  async putSnapshot(uid, snapshot) {
    await delay();
    const db = load();
    const acc = db.accounts.find((a) => a.uid === uid);
    if (acc) acc.snapshot = snapshot;
    save(db);
  },
};
