import type { Profile } from '@/store/types';

// Preferências guardadas como chaves neutras; o texto vem de i18n (profile.* e pref.*).
export const ROASTS = ['light', 'medium', 'dark'] as const;
export const GRINDS = ['extraFine', 'fine', 'medium', 'coarse'] as const;
export const BODIES = ['light', 'medium', 'full'] as const;
export const ACIDITIES = ['low', 'medium', 'high'] as const;
export const FLAVORS = ['fruity', 'chocolate', 'caramel', 'nutty', 'floral', 'citrus'] as const;

export const AGE_MIN = 10;
export const AGE_MAX = 120;
const NAME_MAX = 60;
const FAVORITE_MAX = 80;
const PHONE_MAX = 24;

const oneOf = (list: readonly string[], v: unknown): string | undefined => (typeof v === 'string' && list.includes(v) ? v : undefined);
const text = (v: unknown, max: number): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const s = v.trim().slice(0, max);
  return s || undefined;
};

/** Telefone: só dígitos, espaço, +, - e parênteses, com 8 a 15 dígitos. Vazio é válido (o campo é opcional). */
export function isPhoneValid(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  if (!/^[0-9+\-()\s]+$/.test(s)) return false;
  const digits = s.replace(/\D/g, '').length;
  return digits >= 8 && digits <= 15;
}

/** Idade como número inteiro entre 10 e 120; vazio é válido. Devolve undefined quando vazio e null quando inválido. */
export function parseAge(raw: string): number | undefined | null {
  const s = raw.trim();
  if (!s) return undefined;
  if (!/^\d{1,3}$/.test(s)) return null;
  const n = parseInt(s, 10);
  return n >= AGE_MIN && n <= AGE_MAX ? n : null;
}

/** Deixa só o que é conhecido e válido; o que sobra é o que vai para o estado e para o backup. */
export function cleanProfile(p: unknown): Profile {
  const r = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
  const out: Profile = {};
  const name = text(r.name, NAME_MAX);
  if (name) out.name = name;
  const phone = text(r.phone, PHONE_MAX);
  if (phone && isPhoneValid(phone)) out.phone = phone;
  if (typeof r.age === 'number' && Number.isInteger(r.age) && r.age >= AGE_MIN && r.age <= AGE_MAX) out.age = r.age;
  const favorite = text(r.favorite, FAVORITE_MAX);
  if (favorite) out.favorite = favorite;
  const roast = oneOf(ROASTS, r.roast);
  if (roast) out.roast = roast;
  const grind = oneOf(GRINDS, r.grind);
  if (grind) out.grind = grind;
  const body = oneOf(BODIES, r.body);
  if (body) out.body = body;
  const acidity = oneOf(ACIDITIES, r.acidity);
  if (acidity) out.acidity = acidity;
  if (Array.isArray(r.flavors)) {
    const flavors = [...new Set(r.flavors.filter((f): f is string => typeof f === 'string' && (FLAVORS as readonly string[]).includes(f)))];
    if (flavors.length) out.flavors = flavors;
  }
  return out;
}

export const hasProfile = (p: Profile) => Object.keys(cleanProfile(p)).length > 0;

/** Alterna uma preferência de escolha única: tocar de novo na escolhida a limpa. */
export const toggleChoice = (current: string | undefined, value: string): string | undefined => (current === value ? undefined : value);

/** Alterna um sabor na lista, sem repetir. */
export const toggleFlavor = (flavors: string[] | undefined, value: string): string[] => {
  const list = flavors ?? [];
  return list.includes(value) ? list.filter((f) => f !== value) : [...list, value];
};
