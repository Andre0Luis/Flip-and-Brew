import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDailyUsage, hasUsageStatsPermission, isUsageStatsAvailable, requestUsageStatsPermission } from '../../modules/usage-stats';
import type { UsageDay } from '@/lib/usage';

/** Uso do sistema (desbloqueios e tempo de tela). Só existe no Android, depois que a pessoa autoriza. */
export function useSystemUsage(days = 7) {
  const [permitted, setPermitted] = useState(false);
  const [data, setData] = useState<UsageDay[]>([]);

  const refresh = useCallback(() => {
    if (!isUsageStatsAvailable) return;
    const ok = hasUsageStatsPermission();
    setPermitted(ok);
    setData(ok ? getDailyUsage(days).map((d) => ({ ...d, locks: d.locks ?? 0 })) : []);
  }, [days]);

  useFocusEffect(refresh);

  // Voltar da tela de autorização do sistema, ou reabrir o app, atualiza os números.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => sub.remove();
  }, [refresh]);

  return { available: isUsageStatsAvailable, permitted, days: data, refresh, request: requestUsageStatsPermission };
}
