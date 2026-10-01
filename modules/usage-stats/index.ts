import UsageStatsModule from './src/UsageStatsModule';

export function hasUsageStatsPermission(): boolean {
  return UsageStatsModule?.hasUsageStatsPermission() ?? false;
}

export function requestUsageStatsPermission(): void {
  if (UsageStatsModule) {
    UsageStatsModule.requestUsageStatsPermission();
  }
}

export function getDailyUnlockCount(): number {
  return UsageStatsModule?.getDailyUnlockCount() ?? 0;
}

export const isUsageStatsAvailable = !!UsageStatsModule;
