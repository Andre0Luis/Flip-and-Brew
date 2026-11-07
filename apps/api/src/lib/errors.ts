import type { Context } from 'hono';
import type { ZodType } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: 400 | 401 | 403 | 404 | 409 | 413 | 429 | 500 | 501 | 502,
    public code: string,
    message?: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message ?? code);
  }
}

/** Valida com Zod e devolve o dado já tipado; entrada inválida vira 400 sem vazar nada interno. */
export function parse<T>(schema: ZodType<T>, input: unknown): T {
  const r = schema.safeParse(input);
  if (!r.success) {
    throw new HttpError(400, 'invalid_input', r.error.issues.map((i) => `${i.path.join('.') || 'corpo'}: ${i.message}`).join('; '));
  }
  return r.data;
}

export async function jsonBody(c: Context): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    throw new HttpError(400, 'invalid_json', 'O corpo precisa ser JSON.');
  }
}
