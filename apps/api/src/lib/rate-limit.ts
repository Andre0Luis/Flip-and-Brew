import type { MiddlewareHandler } from 'hono';
import { HttpError } from './errors.js';

/**
 * Limite de pedidos por chave numa janela de tempo, na memória do processo.
 * Em serverless cada instância tem a sua contagem, então isto só barra abuso grosseiro; o limite de verdade
 * (Upstash ou o firewall da Vercel) entra na fase de endurecimento.
 */
export function rateLimit(opts: { windowMs: number; max: number; key: (c: Parameters<MiddlewareHandler>[0]) => string }): MiddlewareHandler {
  const hits = new Map<string, number[]>();
  return async (c, next) => {
    const now = Date.now();
    const k = opts.key(c);
    const recent = (hits.get(k) ?? []).filter((t) => now - t < opts.windowMs);
    if (recent.length >= opts.max) throw new HttpError(429, 'too_many_requests', 'Muitos pedidos. Tente de novo em instantes.');
    recent.push(now);
    hits.set(k, recent);
    if (hits.size > 10_000) for (const [key, v] of hits) if (!v.some((t) => now - t < opts.windowMs)) hits.delete(key);
    await next();
  };
}
