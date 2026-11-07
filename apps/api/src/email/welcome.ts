import type { Language } from '../shared';
import type { EmailMessage } from './provider';

const TEXT: Record<Language, { subject: string; title: string; lines: string[]; sign: string }> = {
  pt: {
    subject: 'Bem-vindo ao Flip & Brew',
    title: 'Bem-vindo ao Flip & Brew',
    lines: [
      'Que bom ter você por aqui. O Flip & Brew existe para o contrário de prender a sua atenção: você larga o celular, o café se faz, e o tempo vai para o que importa fora da tela.',
      'Vire o celular para baixo para começar um copo, faça o check-in de energia e, se quiser, chame amigos para competir em quem usa menos o celular.',
    ],
    sign: 'Boa travessia,\nAndré Luis',
  },
  en: {
    subject: 'Welcome to Flip & Brew',
    title: 'Welcome to Flip & Brew',
    lines: [
      'Glad to have you here. Flip & Brew exists for the opposite of holding your attention: you put the phone down, the coffee brews, and your time goes to what matters off the screen.',
      'Turn your phone face down to start a cup, do the energy check-in and, if you like, invite friends to compete on who uses the phone least.',
    ],
    sign: 'Good journey,\nAndré Luis',
  },
  es: {
    subject: 'Bienvenido a Flip & Brew',
    title: 'Bienvenido a Flip & Brew',
    lines: [
      'Qué bueno tenerte aquí. Flip & Brew existe para lo contrario de retener tu atención: dejas el móvil, el café se hace y el tiempo va a lo que importa fuera de la pantalla.',
      'Pon el móvil boca abajo para empezar una taza, haz el check-in de energía y, si quieres, invita a amigos a competir por quién usa menos el móvil.',
    ],
    sign: 'Buen camino,\nAndré Luis',
  },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** E-mail de boas-vindas. Texto fixo (nada vindo do usuário entra no HTML), no idioma escolhido. */
export function welcomeEmail(to: string, lang: Language = 'pt'): EmailMessage {
  const t = TEXT[lang];
  const html = `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:24px;color:#2b1a12"><h1 style="font-size:24px">${esc(t.title)}</h1>${t.lines
    .map((l) => `<p style="font-size:16px;line-height:1.5">${esc(l)}</p>`)
    .join('')}<p style="font-size:16px;line-height:1.5">${esc(t.sign).replace(/\n/g, '<br>')}</p></div>`;
  const text = `${t.title}\n\n${t.lines.join('\n\n')}\n\n${t.sign}`;
  return { to, subject: t.subject, html, text };
}
