// Gera docs/PRIVACY.<idioma>.md a partir dos mesmos textos da tela de privacidade do app.
// Rode `npm run docs:privacy` depois de mudar src/i18n/*.ts. Hospede o arquivo (por exemplo no GitHub Pages)
// para ter a URL que as lojas pedem.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dictionaries, LANGS, translate } from '../src/i18n';

// Roda a partir de apps/mobile (npm run docs:privacy); os documentos ficam em docs/, na raiz do repositório.
const DOCS = resolve('..', '..', 'docs');
// A API serve a mesma política em /privacidade; o texto vem daqui para não ter duas fontes.
const API_PAGES = resolve('..', 'api', 'src', 'pages');
const forApi: Record<string, { title: string; sections: { title: string; body: string[] }[] }> = {};

for (const lang of LANGS) {
  const lines = [`# Flip & Brew · ${translate(lang, 'privacy.title')}`, ''];
  // Todas as seções que a tela de privacidade tem (privacy.h1, h2, ...): acrescentar uma seção não exige mexer aqui.
  const sections = Object.keys(dictionaries[lang]).flatMap((k) => (/^privacy\.h(\d+)$/.test(k) ? [Number(k.slice(9))] : [])).sort((a, b) => a - b);
  for (const n of sections) {
    lines.push(`## ${dictionaries[lang][`privacy.h${n}` as 'privacy.h1']}`, '', dictionaries[lang][`privacy.p${n}` as 'privacy.p1'], '');
  }
  forApi[lang] = {
    title: translate(lang, 'privacy.title'),
    sections: sections.map((n) => ({ title: dictionaries[lang][`privacy.h${n}` as 'privacy.h1'], body: dictionaries[lang][`privacy.p${n}` as 'privacy.p1'].split('\n').filter((l) => l.trim()) })),
  };
  writeFileSync(`${DOCS}/PRIVACY.${lang}.md`, lines.join('\n'));
}
writeFileSync(
  `${API_PAGES}/privacy.generated.ts`,
  `// GERADO por \`npm run docs:privacy\` (apps/mobile/scripts/gen-privacy.ts) a partir dos textos do app. Não edite à mão.\nimport type { Page, PageLang } from './content.js';\n\nexport const privacy: Record<PageLang, Page> = ${JSON.stringify(forApi, null, 2)};\n`,
);
console.log('docs/PRIVACY.{pt,en,es}.md e apps/api/src/pages/privacy.generated.ts atualizados');
