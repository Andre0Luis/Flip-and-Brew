import { CATALOG } from '@/data/catalog';
import { ARTICLE_BASE } from '@/data/articles';
import { makeDemoSessions } from './demo';
import { dayKey } from './stats';
import type { LocalData } from './cloud/snapshot';

/**
 * Usuário de teste: um progresso farto para testar a loja, a coleção, o Bem-estar e o backup sem esperar copos.
 * Os dados são fictícios. A conta de teste do servidor falso usa estas credenciais (a do Firebase real usa as do .env).
 */
export const TEST_EMAIL = 'teste@flipandbrew.app';
export const TEST_PASSWORD = 'Teste@12345';
export const TEST_COINS = 50_000;
export const TEST_HISTORY_DAYS = 90;

export function makeTestData(now = Date.now()): Omit<LocalData, 'settings'> {
  const practicesDone = Array.from({ length: 9 }, (_, i) => dayKey(now - (i + 1) * 86_400_000));
  return {
    coins: TEST_COINS,
    owned: CATALOG.map((i) => i.id), // todas as cafeteiras e xícaras, inclusive a Chemex e a Coleção Estoica
    brewerId: 'chemex',
    cupId: 'stoic-ep',
    sessions: makeDemoSessions(now, TEST_HISTORY_DAYS),
    practiceAccepted: null,
    practicesDone,
    articlesRead: ARTICLE_BASE.slice(0, 6).map((a) => a.id),
  };
}
