import type { Quality } from '@/lib/brew';

export type Session = {
  id: string;
  brewerId: string;
  cupId: string;
  startedAt: number;
  elapsedMs: number;
  targetMs: number;
  status: 'done' | 'interrupted';
  coins: number;
  quality: Quality;
  trigger?: string; // chave neutra: notification, boredom, work, habit ou other
  mood?: number;
};

/** Check-in diário: energia do dia em xícaras de café, de 1 (vazia) a 5 (cheia). Um por dia. */
export type Checkin = { day: string; energy: number; at: number };

/**
 * Perfil opcional da pessoa. Tudo é facultativo; as preferências de café são chaves neutras (nunca texto traduzido).
 * Fica no aparelho e, com conta, vai no backup junto com o progresso.
 */
export type Profile = {
  name?: string;
  phone?: string;
  age?: number;
  /** café favorito, em texto livre */
  favorite?: string;
  /** método de preparo preferido (chave de lib/profile.ts) */
  method?: string;
  roast?: string;
  grind?: string;
  body?: string;
  acidity?: string;
  flavors?: string[];
};

export type ActiveBrew = { brewerId: string; cupId: string; /** ausente em copos iniciados antes dos pacotes de café */ packId?: string; startedAt: number; targetMs: number };

export type ThemeMode = 'system' | 'light' | 'dark';
export type Language = 'pt' | 'en' | 'es';

export type Settings = {
  language: Language;
  goalMin: number;
  themeMode: ThemeMode;
  /** iniciar o copo ao virar o celular para baixo na tela Início */
  autoStart: boolean;
  /** copos de 1 minuto, para testar */
  quickBrew: boolean;
  /** mostra as ferramentas de teste em Ajustes (toque 7 vezes na versão) */
  devTools: boolean;
  /** aviso silencioso quando o copo enche */
  notifyOnDone: boolean;
  /** +1 ou -1 quando o eixo z do acelerômetro aponta para cima; 0 usa o padrão da plataforma */
  faceUpSign: -1 | 0 | 1;
};
