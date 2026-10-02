import type { Session } from '@/store/types';

export type Provider = 'password' | 'google';

export type CloudUser = {
  uid: string;
  email: string | null;
  provider: Provider;
  emailVerified: boolean;
};

export type AuthErrorCode =
  | 'invalid-email'
  | 'weak-password'
  | 'email-in-use'
  | 'wrong-credentials'
  | 'network'
  | 'too-many'
  | 'cancelled'
  | 'recent-login'
  | 'not-configured'
  | 'unavailable'
  | 'unknown';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'AuthError';
  }
}

/** O que vai para a nuvem. Fica de fora o que é do aparelho (calibração, ferramentas de teste) e o copo em andamento. */
export type SnapshotData = {
  coins: number;
  owned: string[];
  brewerId: string;
  cupId: string;
  sessions: Session[];
  practiceAccepted: string | null;
  practicesDone: string[];
  articlesRead: string[];
  settings: {
    goalMin: number;
    language: 'pt' | 'en' | 'es';
    themeMode: 'system' | 'light' | 'dark';
    autoStart: boolean;
    notifyOnDone: boolean;
  };
};

export type Snapshot = { v: 1; updatedAt: number; data: SnapshotData };

/** Contrato que o Firebase e o servidor falso implementam. */
export interface CloudBackend {
  readonly kind: 'firebase' | 'mock';
  /** Chama `cb` com o usuário atual (ou null) agora e a cada mudança. Devolve a função que cancela. */
  onChange(cb: (user: CloudUser | null) => void): () => void;
  googleAvailable(): boolean;
  signUp(email: string, password: string): Promise<CloudUser>;
  signIn(email: string, password: string): Promise<CloudUser>;
  signInGoogle(): Promise<CloudUser>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  /** Confirma a identidade antes de apagar. Com senha para e-mail, sem argumento para Google. */
  reauthenticate(password?: string): Promise<void>;
  /** Apaga o backup e a conta. Chame `reauthenticate` antes. */
  deleteAccount(): Promise<void>;
  getSnapshot(uid: string): Promise<Snapshot | null>;
  putSnapshot(uid: string, snapshot: Snapshot): Promise<void>;
}
