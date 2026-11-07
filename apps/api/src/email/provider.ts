export type EmailMessage = { to: string; subject: string; html: string; text: string };

/** Enviar um e-mail transacional. Falhar lança erro; quem chama decide se isso bloqueia o pedido. */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}
