// Entrada na Vercel (preset Hono): exporta o app como padrão. O app real depende de conexão com o banco, que é assíncrona,
// então ele nasce no primeiro pedido e a instância seguinte da função reaproveita (a promessa fica guardada).
import { Hono } from 'hono';
import { buildApp } from './build-app.js';

let ready: ReturnType<typeof buildApp> | undefined;

const app = new Hono();
app.all('*', async (c) => {
  ready ??= buildApp();
  try {
    return (await ready).app.fetch(c.req.raw);
  } catch (e) {
    ready = undefined; // configuração ou banco com problema: tenta de novo no próximo pedido
    console.error('[start] falha ao iniciar a API:', (e as Error).message);
    return c.json({ error: { code: 'unavailable', message: 'Serviço indisponível.' } }, 503);
  }
});

export default app;
