import UsageStatsModule, { type NativeDailyUsage } from './src/UsageStatsModule';

export type DailyUsage = NativeDailyUsage;

/** true só no Android com o módulo nativo compilado no app. */
export const isUsageStatsAvailable = !!UsageStatsModule;

export function hasUsageStatsPermission(): boolean {
  try {
    return UsageStatsModule?.hasUsageStatsPermission() ?? false;
  } catch {
    return false;
  }
}

export function requestUsageStatsPermission(): void {
  try {
    UsageStatsModule?.requestUsageStatsPermission();
  } catch {
    // sem a tela de ajustes do sistema, não há o que fazer
  }
}

export function getDailyUsage(days: number): DailyUsage[] {
  try {
    return UsageStatsModule?.getDailyUsage(days) ?? [];
  } catch {
    return [];
  }
}
