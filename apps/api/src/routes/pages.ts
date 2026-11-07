import { Hono } from 'hono';
import type { Config } from '../config.js';
import { deletion, support, type Page, type PageLang } from '../pages/content.js';
import { privacy } from '../pages/privacy.generated.js';
import { pickLang, renderPage } from '../pages/render.js';

// Páginas públicas pedidas pelas lojas (URL de suporte, política de privacidade, exclusão de conta). Fora de /v1, sem login.
const CSP = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export function pagesRoutes(cfg: Config) {
  const r = new Hono();
  const page = (paths: string[], pick: (l: PageLang) => Page & { noEmail?: string }) => {
    for (const path of paths) {
      r.get(path, (c) => {
        const lang = pickLang(c.req.query('lang'), c.req.header('accept-language'));
        const p = pick(lang);
        c.header('content-security-policy', CSP);
        c.header('cache-control', 'public, max-age=300');
        c.header('vary', 'accept-language');
        return c.html(renderPage({ lang, path, page: p, email: cfg.supportEmail, noEmail: p.noEmail ?? support[lang].noEmail }));
      });
    }
  };
  page(['/suporte', '/support'], (l) => support[l]);
  page(['/privacidade', '/privacy'], (l) => privacy[l]);
  page(['/excluir-conta', '/delete-account'], (l) => deletion[l]);
  return r;
}
