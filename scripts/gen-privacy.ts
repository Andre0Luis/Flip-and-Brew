// Gera docs/PRIVACY.<idioma>.md a partir dos mesmos textos da tela de privacidade do app.
// Rode `npm run docs:privacy` depois de mudar src/i18n/*.ts. Hospede o arquivo (por exemplo no GitHub Pages)
// para ter a URL que as lojas pedem.
import { writeFileSync } from 'node:fs';
import { dictionaries, LANGS, translate } from '../src/i18n';

for (const lang of LANGS) {
  const lines = [`# Flip & Brew · ${translate(lang, 'privacy.title')}`, ''];
  for (const n of [1, 2, 3, 4, 5, 6]) {
    lines.push(`## ${dictionaries[lang][`privacy.h${n}` as 'privacy.h1']}`, '', dictionaries[lang][`privacy.p${n}` as 'privacy.p1'], '');
  }
  writeFileSync(`docs/PRIVACY.${lang}.md`, lines.join('\n'));
}
console.log('docs/PRIVACY.{pt,en,es}.md atualizados');
