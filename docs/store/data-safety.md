# Google Play · Segurança dos dados (rascunho)

Respostas sugeridas para o formulário “Segurança dos dados”. Confira com o app final antes de enviar.

| Pergunta | Resposta | Motivo |
| --- | --- | --- |
| O app coleta dados do usuário? | **Sim, só se a pessoa criar uma conta.** Sem conta, nada sai do aparelho. | Com conta, o backup vai para o Firebase (Google). |
| Quais dados, com conta? | **Informações pessoais › Endereço de e-mail** e **Atividade no app › Interações no app** (progresso: copos, moedas, itens, humor, preferências). Com login Google: nome e e-mail do perfil. | Documento `users/{uid}` no Firestore e conta no Firebase Authentication. |
| Para quê? | Funcionalidade do app (conta e backup) e gerenciamento de conta. | Não há publicidade nem análise. |
| Os dados são compartilhados com terceiros? | Não além do processamento pelo Firebase (Google) e, se a compra estiver ativa, RevenueCat e Google Play. | Provedores de serviço. |
| Dados criptografados em trânsito? | **Sim.** | Firebase usa HTTPS/TLS. |
| O usuário pode pedir a exclusão? | **Sim**, dentro do app (Ajustes › Conta › Excluir conta) e por e-mail. | Ver `docs/ACCOUNT-DELETION.md`. Informe também a URL da página pública. |
| Compras no app? | Sim, quando ativadas. | Processadas pela Google Play e pelo RevenueCat. Marcar “Informações de compra” e “Identificadores de dispositivo ou outros” se o RevenueCat estiver ativo. |
| Permissão especial: Acesso ao uso (`PACKAGE_USAGE_STATS`) | Declarar, com justificativa. | Lê desbloqueios e tempo de tela do dia para o painel Bem-estar. Opcional, os números ficam só no aparelho e não são enviados à nuvem. Pode exigir o formulário de permissões sensíveis. |

Classificação etária sugerida: livre, sem conteúdo sensível. Se o app for oferecido a menores, revisar as regras de contas para crianças.
