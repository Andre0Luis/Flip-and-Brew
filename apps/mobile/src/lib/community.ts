// Regras puras da Comunidade (apelido, busca, nomes e erros). Sem React, testadas em Node.

export const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

/** Deixa o apelido no formato que a API aceita: minúsculas, sem acento, espaço vira _, só letras, números e _. */
export function sanitizeHandle(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
}

export const isValidHandle = (h: string) => HANDLE_RE.test(h);

/** Sugestão de apelido a partir do nome do perfil ("Ana Maria" vira "ana_maria"); vazio se não der 3 letras. */
export function suggestHandle(name: string | undefined): string {
  const h = sanitizeHandle((name ?? '').trim());
  return isValidHandle(h) ? h : '';
}

/** Termo de busca válido (aceita "@ana"), ou null se tiver menos de 2 letras. */
export function searchTerm(raw: string): string | null {
  const q = sanitizeHandle(raw.trim().replace(/^@/, ''));
  return q.length >= 2 ? q : null;
}

type Named = { displayName: string | null; handle: string | null };

export function personName(p: Named): string {
  return p.displayName?.trim() || (p.handle ? `@${p.handle}` : '?');
}

export function personInitial(p: Named): string {
  const n = p.displayName?.trim() || p.handle || '?';
  return n.charAt(0).toUpperCase();
}

export type CommunityErrorKey = 'handleTaken' | 'handleInvalid' | 'network' | 'tooMany' | 'generic';

/** Traduz um erro da API (`ApiError`: status e código) para a mensagem da tela. */
export function communityErrorKey(e: unknown): CommunityErrorKey {
  const x = e as { status?: number; code?: string } | null;
  if (x?.code === 'handle_taken') return 'handleTaken';
  if (x?.status === 400) return 'handleInvalid';
  if (x?.status === 0) return 'network';
  if (x?.status === 429) return 'tooMany';
  return 'generic';
}
