import { NativeModule, requireOptionalNativeModule } from 'expo';

/**
 * `locks` só vem em builds nativos novos; sem ele, a camada JS assume 0.
 * `tracked` só vem do iPhone: o monitor do Tempo de Uso acompanhou o dia, mesmo com zero minutos de tela.
 */
export type NativeDailyUsage = { dayStart: number; unlocks: number; locks?: number; screenMs: number; tracked?: boolean };

/** Textos da lista de apps do iPhone, que é nativa e não passa pelas traduções do app. */
export type PickerLabels = { title: string; done: string; cancel: string };

declare class UsageStatsModule extends NativeModule<Record<string, never>> {
  /** Só o iPhone define, como `false`: lá não há contagem de desbloqueios nem de bloqueios. */
  countsUnlocks?: boolean;
  hasUsageStatsPermission(): boolean;
  /** Android abre a tela do sistema (sem argumentos); iPhone pede o Tempo de Uso e abre a lista de apps. */
  requestUsageStatsPermission(labels?: PickerLabels): void | Promise<boolean>;
  getDailyUsage(days: number): NativeDailyUsage[];
}

export default requireOptionalNativeModule<UsageStatsModule>('UsageStats');
