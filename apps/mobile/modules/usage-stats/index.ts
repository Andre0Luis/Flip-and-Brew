import { Platform } from 'react-native';
import UsageStatsModule, { type NativeDailyUsage, type PickerLabels } from './src/UsageStatsModule';

export type DailyUsage = NativeDailyUsage;
export type { PickerLabels };

/** true no Android e no iPhone com o módulo nativo compilado no app. */
export const isUsageStatsAvailable = !!UsageStatsModule;

/** false no iPhone: o Tempo de Uso só dá uma estimativa do tempo de tela, sem desbloqueios nem bloqueios. */
export const countsUnlocks = UsageStatsModule?.countsUnlocks ?? true;

export function hasUsageStatsPermission(): boolean {
  try {
    return UsageStatsModule?.hasUsageStatsPermission() ?? false;
  } catch {
    return false;
  }
}

/** Android abre a tela do sistema; iPhone pede o Tempo de Uso e espera a pessoa escolher os apps. */
export async function requestUsageStatsPermission(labels: PickerLabels): Promise<void> {
  try {
    if (Platform.OS === 'ios') await UsageStatsModule?.requestUsageStatsPermission(labels);
    else UsageStatsModule?.requestUsageStatsPermission();
  } catch {
    // sem a tela do sistema, não há o que fazer
  }
}

export function getDailyUsage(days: number): DailyUsage[] {
  try {
    return UsageStatsModule?.getDailyUsage(days) ?? [];
  } catch {
    return [];
  }
}
