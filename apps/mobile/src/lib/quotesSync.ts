import { getBackend } from '@/lib/cloud';
import { setRemoteQuotes } from '@/data/quotes';
import { scheduleWidgetSync } from '@/lib/widgets';

const EVERY_MS = 6 * 3_600_000;
let last = 0;

/** Baixa as frases do dia do servidor e guarda no aparelho. No máximo uma vez a cada 6 horas; sem conta ou sem internet, não faz nada. */
export async function refreshQuotes(now = Date.now(), force = false): Promise<boolean> {
  const api = getBackend()?.community;
  if (!api || (!force && now - last < EVERY_MS)) return false;
  last = now;
  try {
    const list = await api.quotes();
    if (!list.length) return false;
    setRemoteQuotes(list);
    scheduleWidgetSync(500);
    return true;
  } catch {
    last = 0; // falhou (sem internet ou sem sessão): tenta de novo na próxima abertura
    return false;
  }
}
