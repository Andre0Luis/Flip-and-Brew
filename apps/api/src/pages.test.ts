import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { privacy } from './pages/privacy.generated.js';
import { pickLang, renderPage } from './pages/render.js';
import { testApp } from './test/helpers.js';

const get = async (t: Awaited<ReturnType<typeof testApp>>, path: string, headers: Record<string, string> = {}) => {
  const res = await t.app.request(path, { headers });
  return { res, html: await res.text() };
};

test('suporte, privacidade e exclusão de conta são HTML público, sem login, em três idiomas', async () => {
  const t = await testApp({ supportEmail: 'ajuda@exemplo.com' });
  for (const path of ['/suporte', '/support', '/privacidade', '/privacy', '/excluir-conta', '/delete-account']) {
    const { res, html } = await get(t, path);
    assert.equal(res.status, 200, path);
    assert.match(res.headers.get('content-type') ?? '', /text\/html/);
    assert.match(res.headers.get('content-security-policy') ?? '', /default-src 'none'/);
    assert.match(html, /<h1>/);
  }
  assert.match((await get(t, '/suporte')).html, /<html lang="pt">/);
  assert.match((await get(t, '/suporte', { 'accept-language': 'es-AR,es;q=0.9' })).html, /<html lang="es">/);
  assert.match((await get(t, '/suporte?lang=en', { 'accept-language': 'es' })).html, /<html lang="en">/);
  await t.close();
});

test('o e-mail de suporte vem da configuração, aparece como link e a página avisa quando falta', async () => {
  const t = await testApp({ supportEmail: 'ajuda@exemplo.com' });
  assert.match((await get(t, '/suporte')).html, /href="mailto:ajuda@exemplo\.com"/);
  assert.match((await get(t, '/excluir-conta')).html, /href="mailto:ajuda@exemplo\.com"/);
  await t.close();
  const sem = await testApp();
  const { res, html } = await get(sem, '/suporte');
  assert.equal(res.status, 200);
  assert.doesNotMatch(html, /mailto:/);
  assert.match(html, /ainda não foi configurado/);
  await sem.close();
});

test('a página escapa HTML e só liga caminhos conhecidos', () => {
  const html = renderPage({ lang: 'pt', path: '/x', page: { title: '<b>t</b>', sections: [{ title: 's', body: ['<script>alert(1)</script> veja /privacidade.'] }] } });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<a href="\/privacidade">\/privacidade<\/a>\./);
  assert.equal(pickLang('xx', 'fr, en;q=0.8'), 'en');
  assert.equal(pickLang(undefined, undefined), 'pt');
});

test('a política servida é a mesma de docs/PRIVACY.<idioma>.md (que sai dos textos do app)', () => {
  for (const lang of ['pt', 'en', 'es'] as const) {
    const md = readFileSync(resolve(import.meta.dirname, '..', '..', '..', 'docs', `PRIVACY.${lang}.md`), 'utf8');
    const served = [`# Flip & Brew · ${privacy[lang].title}`, '', ...privacy[lang].sections.flatMap((s) => [`## ${s.title}`, '', ...s.body, ''])].join('\n');
    assert.equal(served.trim(), md.trim(), `rode npm run docs:privacy em apps/mobile (${lang})`);
  }
});
