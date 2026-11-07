/** Textos das páginas públicas de suporte e exclusão de conta. A política de privacidade vem de `privacy.generated.ts`. */
export type PageLang = 'pt' | 'en' | 'es';
export const PAGE_LANGS: PageLang[] = ['pt', 'en', 'es'];

export type Section = { title: string; body: string[] };
export type Page = { title: string; sections: Section[] };

/** `{email}` vira o e-mail de suporte; sem ele a página diz que o contato ainda não foi configurado. */
export const support: Record<PageLang, Page & { noEmail: string }> = {
  pt: {
    title: 'Suporte',
    noEmail: 'O e-mail de suporte ainda não foi configurado.',
    sections: [
      { title: 'Fale com a gente', body: ['Dúvidas, problemas ou sugestões sobre o Flip & Brew: escreva para {email}. Conte o que aconteceu e o modelo do celular; isso ajuda a achar o problema.'] },
      { title: 'Esqueci a senha', body: ['Na tela de login (Ajustes › Conta e backup), toque em “Esqueci a senha”. Enviamos um link para o e-mail da conta.'] },
      { title: 'Meus dados sumiram', body: ['Sem conta, os dados ficam só no celular e saem junto com o app. Com conta, entre de novo em Ajustes › Conta e backup para recuperar o backup.'] },
      { title: 'Excluir a conta', body: ['Veja como excluir a conta e os dados em /excluir-conta.'] },
      { title: 'Compras e anúncios', body: ['Pagamentos e reembolsos são feitos pela App Store ou pela Google Play. O app não vê dados de cartão.'] },
      { title: 'Privacidade', body: ['A política de privacidade está em /privacidade.'] },
    ],
  },
  en: {
    title: 'Support',
    noEmail: 'The support e-mail has not been set up yet.',
    sections: [
      { title: 'Contact us', body: ['Questions, problems or suggestions about Flip & Brew: write to {email}. Tell us what happened and your phone model; it helps us find the problem.'] },
      { title: 'Forgot my password', body: ['On the sign-in screen (Settings › Account and backup), tap “Forgot password”. We send a link to the account e-mail.'] },
      { title: 'My data is gone', body: ['Without an account, data stays only on the phone and leaves with the app. With an account, sign in again under Settings › Account and backup to recover your backup.'] },
      { title: 'Delete my account', body: ['See how to delete your account and data at /delete-account.'] },
      { title: 'Purchases and ads', body: ['Payments and refunds go through the App Store or Google Play. The app never sees card details.'] },
      { title: 'Privacy', body: ['The privacy policy is at /privacy.'] },
    ],
  },
  es: {
    title: 'Soporte',
    noEmail: 'El correo de soporte aún no está configurado.',
    sections: [
      { title: 'Contáctanos', body: ['Dudas, problemas o sugerencias sobre Flip & Brew: escribe a {email}. Cuéntanos qué pasó y el modelo de tu teléfono; nos ayuda a encontrar el problema.'] },
      { title: 'Olvidé mi contraseña', body: ['En la pantalla de acceso (Ajustes › Cuenta y copia), toca “Olvidé mi contraseña”. Enviamos un enlace al correo de la cuenta.'] },
      { title: 'Mis datos desaparecieron', body: ['Sin cuenta, los datos quedan solo en el teléfono y se van con la app. Con cuenta, vuelve a entrar en Ajustes › Cuenta y copia para recuperar la copia.'] },
      { title: 'Eliminar la cuenta', body: ['Mira cómo eliminar la cuenta y los datos en /delete-account.'] },
      { title: 'Compras y anuncios', body: ['Los pagos y reembolsos pasan por la App Store o Google Play. La app nunca ve los datos de la tarjeta.'] },
      { title: 'Privacidad', body: ['La política de privacidad está en /privacy.'] },
    ],
  },
};

export const deletion: Record<PageLang, Page> = {
  pt: {
    title: 'Excluir a conta',
    sections: [
      { title: 'No app (recomendado)', body: ['1. Abra Ajustes › Conta e backup › Abrir.', '2. Role até “Excluir conta” e toque em “Excluir minha conta”.', '3. Confirme com a sua senha (ou com o Google ou a Apple, se entrou com eles) e toque em “Excluir definitivamente”.'] },
      { title: 'O que é apagado', body: ['A sua conta e o backup do seu progresso na nuvem (copos, moedas, itens, humor, energia diária, perfil e preferências), de forma permanente.'] },
      { title: 'O que continua', body: ['Os dados guardados no seu celular. Para removê-los, use Ajustes › Apagar todos os dados ou desinstale o app.'] },
      { title: 'Sem acesso ao app?', body: ['Escreva para {email} a partir do e-mail da conta, pedindo a exclusão. Atendemos em até 30 dias.'] },
    ],
  },
  en: {
    title: 'Delete your account',
    sections: [
      { title: 'In the app (recommended)', body: ['1. Open Settings › Account and backup › Open.', '2. Scroll to “Delete account” and tap “Delete my account”.', '3. Confirm with your password (or with Google or Apple, if you signed in with them) and tap “Delete permanently”.'] },
      { title: 'What is deleted', body: ['Your account and the cloud backup of your progress (cups, coins, items, mood, daily energy, profile and preferences), permanently.'] },
      { title: 'What stays', body: ['The data stored on your phone. To remove it, use Settings › Erase all data or uninstall the app.'] },
      { title: 'No access to the app?', body: ['Write to {email} from the account e-mail asking for deletion. We handle requests within 30 days.'] },
    ],
  },
  es: {
    title: 'Eliminar la cuenta',
    sections: [
      { title: 'En la app (recomendado)', body: ['1. Abre Ajustes › Cuenta y copia › Abrir.', '2. Baja hasta “Eliminar cuenta” y toca “Eliminar mi cuenta”.', '3. Confirma con tu contraseña (o con Google o Apple, si entraste con ellos) y toca “Eliminar definitivamente”.'] },
      { title: 'Qué se borra', body: ['Tu cuenta y la copia en la nube de tu progreso (vasos, monedas, objetos, ánimo, energía diaria, perfil y preferencias), de forma permanente.'] },
      { title: 'Qué permanece', body: ['Los datos guardados en tu teléfono. Para quitarlos, usa Ajustes › Borrar todos los datos o desinstala la app.'] },
      { title: 'Sin acceso a la app', body: ['Escribe a {email} desde el correo de la cuenta pidiendo la eliminación. Atendemos en hasta 30 días.'] },
    ],
  },
};
