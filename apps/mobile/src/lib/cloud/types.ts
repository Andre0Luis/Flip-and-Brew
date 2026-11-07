import type { Checkin, Profile, Session } from '@/store/types';

export type Provider = 'password' | 'google' | 'apple';

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
  | 'config'
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
  /** Opcional: backups antigos não têm pacote de café. */
  packId?: string;
  sessions: Session[];
  /** Opcional: backups feitos antes do check-in de energia não têm este campo. */
  checkins?: Checkin[];
  /** Opcional: nome, telefone, idade e preferências de café. Backups antigos não têm. */
  profile?: Profile;
  /** Opcional: missões diárias resgatadas, para não resgatar de novo depois de restaurar. */
  missionsClaimed?: string[];
  /** Opcional: totais de missões, para as conquistas. */
  missionsDone?: number;
  missionBonusDays?: number;
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
  /** Entrar com a Apple: só no iOS. */
  appleAvailable(): boolean;
  signUp(email: string, password: string): Promise<CloudUser>;
  signIn(email: string, password: string): Promise<CloudUser>;
  signInGoogle(): Promise<CloudUser>;
  signInApple(): Promise<CloudUser>;
  /** Reenvia o e-mail de confirmação da conta com senha. */
  sendVerificationEmail(): Promise<void>;
  /** Recarrega a conta para saber se o e-mail já foi confirmado. Devolve o usuário atualizado. */
  refreshUser(): Promise<CloudUser | null>;
  /** Troca a senha de uma conta com e-mail e senha, confirmando a senha atual. */
  changePassword(current: string, next: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  /** Confirma a identidade antes de apagar. Com senha para e-mail, sem argumento para Google e Apple. */
  reauthenticate(password?: string): Promise<void>;
  /** Apaga o backup e a conta. Chame `reauthenticate` antes. */
  deleteAccount(): Promise<void>;
  getSnapshot(uid: string): Promise<Snapshot | null>;
  putSnapshot(uid: string, snapshot: Snapshot): Promise<void>;
}
