// Avatar do perfil: um dos 5 desenhos do app ou uma foto da galeria (copiada para a pasta do app).
// Fica só no aparelho: não entra no perfil que vai para o backup.
export const AVATAR_IDS = ['bean', 'cup', 'dripper', 'press', 'moka'] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];
export type Avatar = { kind: 'preset'; id: AvatarId } | { kind: 'photo'; uri: string };

export const DEFAULT_AVATAR: Avatar = { kind: 'preset', id: 'bean' };

/** Aceita só o que o app mesmo grava: um desenho conhecido ou o arquivo da foto na pasta do app. */
export function cleanAvatar(v: unknown): Avatar | null {
  if (!v || typeof v !== 'object') return null;
  const r = v as Record<string, unknown>;
  if (r.kind === 'preset' && typeof r.id === 'string' && (AVATAR_IDS as readonly string[]).includes(r.id)) return { kind: 'preset', id: r.id as AvatarId };
  if (r.kind === 'photo' && typeof r.uri === 'string' && r.uri.startsWith('file://') && r.uri.length <= 500) return { kind: 'photo', uri: r.uri };
  return null;
}

/** Primeiro nome para o chip do topo; corta nomes muito longos. */
export function firstName(name: string | undefined, max = 14): string {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  return first.length > max ? `${first.slice(0, max - 1)}…` : first;
}

/**
 * Emoji do chip, pelo método de preparo preferido no perfil:
 * filtrado (coador, pano, gotejador, sifão, phin) é a xícara; pressão e cápsula (espresso, moka, AeroPress, cápsula) é o grão;
 * imersão (prensa, café turco) é o bule; cold brew é o gelo. Sem método, a xícara.
 */
export function coffeeEmoji(method: string | undefined): string {
  switch (method) {
    case 'espresso':
    case 'moka':
    case 'aeropress':
    case 'capsule':
      return '\u{1FAD8}'; // 🫘
    case 'press':
    case 'turkish':
      return '\u{1FAD6}'; // 🫖
    case 'coldbrew':
      return '\u{1F9CA}'; // 🧊
    default:
      return '\u2615'; // ☕
  }
}
