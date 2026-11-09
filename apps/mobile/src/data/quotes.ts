import { CONTENT, type QuoteText } from './content';
import type { Lang } from '@/i18n';
import { appStorage } from '@/store/storage';

export type Quote = QuoteText & { id: string };

/** As 9 frases que vêm dentro do app, com contexto e sugestões. Funcionam sem internet e sem conta. */
export const QUOTE_IDS = ['sq-13', 'ma-520', 'ep-5', 'ep-1', 'sq-1', 'sq-brev', 'ma-847', 'ep-8', 'nt-vento'] as const;

/** Frase vinda do servidor (`GET /v1/quotes`): o texto de cada idioma, com contexto e sugestões só se houver. */
export type RemoteQuote = { id: string; content: Record<Lang, { text: string; author: string; source?: string; context?: string; tryToday?: string[] }> };

const REMOTE_KEY = 'flip-and-brew-remote-quotes';
let remote: RemoteQuote[] | null = null;

const isText = (x: unknown): x is { text: string; author: string } => !!x && typeof (x as { text?: unknown }).text === 'string' && typeof (x as { author?: unknown }).author === 'string';

/** Só entra o que tem id novo e texto nos três idiomas: lixo no armazenamento ou resposta torta não derruba a tela. */
function sane(list: unknown): RemoteQuote[] {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>(QUOTE_IDS);
  const out: RemoteQuote[] = [];
  for (const q of list as RemoteQuote[]) {
    if (!q || typeof q.id !== 'string' || seen.has(q.id) || !q.content || !isText(q.content.pt) || !isText(q.content.en) || !isText(q.content.es)) continue;
    seen.add(q.id);
    out.push(q);
  }
  return out;
}

function remoteList(): RemoteQuote[] {
  if (remote) return remote;
  try {
    const raw = appStorage.getItem(REMOTE_KEY);
    remote = typeof raw === 'string' ? sane(JSON.parse(raw)) : [];
  } catch {
    remote = [];
  }
  return remote;
}

/** Guarda a lista do servidor no aparelho (ela vale mesmo sem internet no dia seguinte). */
export function setRemoteQuotes(list: unknown): void {
  remote = sane(list);
  try {
    appStorage.setItem(REMOTE_KEY, JSON.stringify(remote));
  } catch {
    // sem armazenamento, a lista vale só até fechar o app
  }
}

const fromRemote = (lang: Lang, q: RemoteQuote): Quote => {
  const c = q.content[lang] ?? q.content.pt;
  return { id: q.id, text: c.text, author: c.author, source: c.source ?? '', context: c.context ?? '', tryToday: c.tryToday ?? [] };
};

/** As 9 de dentro do app, depois as do servidor, na ordem do rodízio. */
export const getQuotes = (lang: Lang): Quote[] => [...QUOTE_IDS.map((id) => ({ id, ...CONTENT[lang].quotes[id] })), ...remoteList().map((q) => fromRemote(lang, q))];
export const quoteById = (lang: Lang, id: string): Quote | undefined => getQuotes(lang).find((q) => q.id === id);

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  return Math.floor((date.getTime() - start) / 86400000);
}

/** Frase do dia: muda a cada dia, igual para todo mundo, e é a mesma frase em todos os idiomas. */
export function quoteOfDay(lang: Lang, date = new Date()): Quote {
  const list = getQuotes(lang);
  return list[dayOfYear(date) % list.length];
}
