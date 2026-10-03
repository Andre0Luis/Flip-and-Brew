/**
 * Gera as capturas de tela das lojas nos tamanhos exigidos, a partir da versão web do app.
 *
 *   npx expo export -p web --output-dir dist-web
 *   npm run store:screenshots -- --dist dist-web --out store-assets/screenshots
 *
 * Usa o Chrome instalado (puppeteer-core, sem baixar navegador) e dados de teste do próprio app (loadTestUser).
 * É uma simulação: a versão web não mostra a barra de status do celular. Para capturas 100% reais, use o aparelho.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { launch, type Page } from 'puppeteer-core';
import { useApp } from '../src/store/useApp';
import { appStorage } from '../src/store/storage';
import { dictionaries, LANGS } from '../src/i18n';

const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const DIST = path.resolve(arg('dist', 'dist-web'));
const OUT = path.resolve(arg('out', 'store-assets/screenshots'));
const CHROME = arg('chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const TABLETS = process.argv.includes('--tablets');

// Tamanho final em pixels = largura x altura CSS x escala.
const DEVICES = [
  { id: 'ios-6.9pol-1320x2868', w: 440, h: 956, scale: 3 },
  { id: 'ios-6.5pol-1284x2778', w: 428, h: 926, scale: 3 },
  { id: 'android-celular-1080x2160', w: 360, h: 720, scale: 3 },
  ...(TABLETS
    ? [
        { id: 'android-tablet-7pol-1200x1920', w: 600, h: 960, scale: 2 },
        { id: 'android-tablet-10pol-1600x2560', w: 800, h: 1280, scale: 2 },
      ]
    : []),
];

const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

/** Servidor estático com volta para o index.html (as rotas do app são resolvidas no cliente). */
function serve(): Promise<{ url: string; close: () => void }> {
  const server = http.createServer((req, res) => {
    const clean = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = path.join(DIST, clean);
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
    res.setHeader('content-type', MIME[path.extname(file)] ?? 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${(server.address() as { port: number }).port}`, close: () => server.close() })));
}

/** Estado salvo do app com muito progresso, para as telas aparecerem cheias. */
function seedState(lang: (typeof LANGS)[number]): string {
  const s = useApp.getState();
  s.loadTestUser();
  useApp.setState({
    settings: { ...useApp.getState().settings, language: lang, themeMode: 'light', faceUpSign: 1 },
    brewerId: 'v60',
    cupId: 'stoic-ep',
    packId: 'pack-especial',
    coins: 4280,
    onboarded: true,
  });
  const raw = appStorage.getItem('flip-and-brew-v2');
  if (!raw) throw new Error('O estado de teste não foi salvo');
  return raw;
}

// Na web o MMKV guarda no localStorage com o prefixo "<id>\\".
const WEB_KEY = 'flip-and-brew\\flip-and-brew-v2';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function open(page: Page, url: string, route: string) {
  await page.goto(`${url}${route}`, { waitUntil: 'networkidle0' });
  await wait(1800); // fontes e ilustrações
}

async function clickByText(page: Page, text: string) {
  const ok = await page.evaluate((label) => {
    const el = [...document.querySelectorAll('[role="button"], button, div')].find((n) => n.children.length < 4 && n.textContent?.trim() === label);
    (el as HTMLElement | undefined)?.click();
    return !!el;
  }, text);
  if (!ok) throw new Error(`Botão não encontrado: ${text}`);
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error(`Rode antes: npx expo export -p web --output-dir ${path.basename(DIST)}`);
  const { url, close } = await serve();
  const browser = await launch({ executablePath: CHROME, headless: true });
  let count = 0;
  try {
    for (const lang of LANGS) {
      const state = seedState(lang);
      for (const d of DEVICES) {
        const dir = path.join(OUT, d.id, lang);
        fs.mkdirSync(dir, { recursive: true });
        const page = await browser.newPage();
        await page.setViewport({ width: d.w, height: d.h, deviceScaleFactor: d.scale, isMobile: true, hasTouch: true });
        await page.evaluateOnNewDocument((KEY: string, raw: string) => {
          localStorage.setItem(KEY, raw);
          // Relógio ajustável: usado na tela do copo para mostrar um copo já a meio caminho.
          const real = Date.now.bind(Date);
          (window as unknown as { __off: number }).__off = 0;
          Date.now = () => real() + (window as unknown as { __off: number }).__off;
        }, WEB_KEY, state);

        const shot = async (n: string) => {
          await page.screenshot({ path: path.join(dir, `${n}.png`) });
          count++;
        };
        await open(page, url, '/');
        await shot('01-inicio');

        // Copo em andamento: inicia e adianta o relógio em 17 minutos.
        await clickByText(page, dictionaries[lang]['home.start']);
        await wait(900);
        await page.evaluate(() => ((window as unknown as { __off: number }).__off = 17 * 60_000 + 20_000));
        await wait(1800);
        await shot('02-copo-enchendo');

        for (const [n, route] of [
          ['03-bem-estar', '/bem-estar'],
          ['04-colecao', '/colecao'],
          ['05-loja', '/guia'],
        ] as const) {
          // Recarrega sem copo em andamento para as demais telas ficarem limpas.
          await page.evaluate((KEY: string, raw: string) => localStorage.setItem(KEY, raw), WEB_KEY, state);
          await open(page, url, route);
          await shot(n);
        }
        await page.close();
      }
    }
  } finally {
    await browser.close();
    close();
  }
  console.log(`${count} capturas em ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
