import { useEffect } from 'react';
import { startWidgetSync } from '@/lib/widgets';

/** Mantém os widgets da tela inicial e da tela de bloqueio em dia com o app. Não desenha nada. */
export function WidgetSync() {
  useEffect(() => startWidgetSync(), []);
  return null;
}
