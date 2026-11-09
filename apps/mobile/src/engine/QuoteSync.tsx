import { useEffect } from 'react';
import { AppState } from 'react-native';
import { refreshQuotes } from '@/lib/quotesSync';

/** Atualiza as frases do dia ao abrir o app e ao voltar para o primeiro plano. Não desenha nada. */
export function QuoteSync() {
  useEffect(() => {
    void refreshQuotes();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && void refreshQuotes());
    return () => sub.remove();
  }, []);
  return null;
}
