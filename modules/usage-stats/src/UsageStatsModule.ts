import { NativeModule, requireOptionalNativeModule } from 'expo';

export type NativeDailyUsage = { dayStart: number; unlocks: number; screenMs: number };

declare class UsageStatsModule extends NativeModule<Record<string, never>> {
  hasUsageStatsPermission(): boolean;
  requestUsageStatsPermission(): void;
  getDailyUsage(days: number): NativeDailyUsage[];
}

export default requireOptionalNativeModule<UsageStatsModule>('UsageStats');
