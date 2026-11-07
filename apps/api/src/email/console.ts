import type { EmailProvider } from './provider';

/** Para desenvolvimento sem chave: só registra que um e-mail sairia (assunto e destinatário, nunca o corpo). */
export function consoleEmail(log: (line: string) => void = console.log): EmailProvider {
  return {
    async send(m) {
      log(`[email] para=${m.to} assunto="${m.subject}"`);
    },
  };
}
