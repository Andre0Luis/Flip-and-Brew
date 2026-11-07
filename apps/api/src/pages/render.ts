import { PAGE_LANGS, type Page, type PageLang } from './content.js';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Texto simples para HTML: escapa tudo, troca `{email}` por um link e transforma caminhos como /privacidade em link. */
function inline(text: string, email: string | undefined, noEmail: string): string {
  const mail = email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : esc(noEmail);
  return text
    .split('{email}')
    .map((part) => esc(part).replace(/(^|\s)(\/[a-z-]+)(?=[\s.,]|$)/g, (_m, a: string, p: string) => `${a}<a href="${p}">${p}</a>`))
    .join(mail);
}

export type RenderOptions = { lang: PageLang; path: string; page: Page; email?: string; noEmail?: string };

export function renderPage({ lang, path, page, email, noEmail = '' }: RenderOptions): string {
  const langs = PAGE_LANGS.map((l) => (l === lang ? `<strong>${l.toUpperCase()}</strong>` : `<a href="${path}?lang=${l}">${l.toUpperCase()}</a>`)).join(' · ');
  const body = page.sections
    .map((s) => `<section><h2>${esc(s.title)}</h2>${s.body.map((p) => `<p>${inline(p, email, noEmail)}</p>`).join('')}</section>`)
    .join('');
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Flip &amp; Brew · ${esc(page.title)}</title>
<style>
:root{color-scheme:light dark;--bg:#faf6f0;--fg:#2b211b;--muted:#6f6259;--accent:#8a4b24}
@media(prefers-color-scheme:dark){:root{--bg:#1b1511;--fg:#f1e8de;--muted:#b3a597;--accent:#e0a070}}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:42rem;margin:0 auto;padding:2rem 1.25rem 4rem}
h1{font-size:1.9rem;margin:.2rem 0 1rem}h2{font-size:1.15rem;margin:1.8rem 0 .4rem}
p{margin:.4rem 0}a{color:var(--accent)}nav{color:var(--muted);font-size:.9rem}
</style>
</head>
<body>
<main>
<nav>Flip &amp; Brew · ${langs}</nav>
<h1>${esc(page.title)}</h1>
${body}
</main>
</body>
</html>
`;
}

/** `?lang=` vence; depois o Accept-Language; padrão português. */
export function pickLang(query: string | undefined, acceptLanguage: string | undefined): PageLang {
  if (query && (PAGE_LANGS as string[]).includes(query)) return query as PageLang;
  for (const part of (acceptLanguage ?? '').split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if ((PAGE_LANGS as string[]).includes(code)) return code as PageLang;
  }
  return 'pt';
}
