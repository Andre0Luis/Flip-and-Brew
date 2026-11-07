import type { EmailMessage, EmailProvider } from './provider.js';

const ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * Brevo pela API HTTP, como no backend do Clube Quinze (sem SDK: um POST com o cabeçalho `api-key`).
 * Sem domínio próprio, o remetente precisa ser um endereço já verificado na conta da Brevo.
 */
export function brevoEmail(o: { apiKey: string; fromEmail: string; fromName: string; fetchFn?: typeof fetch }): EmailProvider {
  const doFetch = o.fetchFn ?? fetch;
  return {
    async send(m: EmailMessage) {
      const res = await doFetch(ENDPOINT, {
        method: 'POST',
        headers: { 'api-key': o.apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          sender: { name: o.fromName, email: o.fromEmail },
          to: [{ email: m.to }],
          subject: m.subject,
          htmlContent: m.html,
          textContent: m.text,
        }),
        // Em serverless a função não pode ficar pendurada esperando um provedor lento.
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`Brevo respondeu ${res.status}`);
    },
  };
}
