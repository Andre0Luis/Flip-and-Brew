import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { countsUnlocks, getDailyUsage, hasUsageStatsPermission, isUsageStatsAvailable, requestUsageStatsPermission } from '../../modules/usage-stats';
import { useI18n } from '@/i18n';
import type { UsageDay } from '@/lib/usage';

/**
 * Uso do sistema, depois que a pessoa autoriza. No Android: desbloqueios, bloqueios e tempo de tela.
 * No iPhone (`ios`): só o tempo de tela estimado pelo Tempo de Uso (ADR-0029).
 */
export function useSystemUsage(days = 7) {
  const { t } = useI18n();
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

  const request = useCallback(async () => {
    await requestUsageStatsPermission({ title: t('usage.picker.title'), done: t('usage.picker.done'), cancel: t('usage.picker.cancel') });
    refresh();
  }, [refresh, t]);

  return { available: isUsageStatsAvailable, permitted, days: data, refresh, request, countsUnlocks, ios: Platform.OS === 'ios' };
}
