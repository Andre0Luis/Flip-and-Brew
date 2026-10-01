import { NativeModule, requireOptionalNativeModule } from 'expo';

declare class UsageStatsModule extends NativeModule<{}> {
  hasUsageStatsPermission(): boolean;
  requestUsageStatsPermission(): void;
  getDailyUnlockCount(): number;
}

export default requireOptionalNativeModule<UsageStatsModule>('UsageStats');
