import { NativeModule, requireOptionalNativeModule } from 'expo';

/** `locks` só vem em builds nativos novos; sem ele, a camada JS assume 0. */
export type NativeDailyUsage = { dayStart: number; unlocks: number; locks?: number; screenMs: number };

declare class UsageStatsModule extends NativeModule<Record<string, never>> {
  hasUsageStatsPermission(): boolean;
  requestUsageStatsPermission(): void;
  getDailyUsage(days: number): NativeDailyUsage[];
}

export default requireOptionalNativeModule<UsageStatsModule>('UsageStats');
