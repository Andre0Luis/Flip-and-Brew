# Comunidade: registro para fazer depois

Status: **adiada**. No app existe só a aba "Comunidade" com o aviso "Em breve" (`src/app/(tabs)/comunidade.tsx`). Este arquivo guarda o que foi pedido e o plano, para retomar sem perder nada.

## O que foi pedido
- Uma seção de **administrador** que mostra os usuários cadastrados e as **preferências de café** deles.
- **Mensagens** do administrador para os usuários e dos usuários para o administrador, como uma comunidade.

## Por que não dá para fazer só com o que existe
Hoje cada pessoa só lê o próprio documento (`users/{uid}`, regras em `firebase/firestore.rules`) e a política de privacidade promete isso. Ver "todos os usuários" exige:
1. Dados que o administrador **possa** ler: uma coleção própria, não o backup.
2. **Consentimento** de quem aparece nela.
3. Regras novas no Firestore e uma forma **segura** de saber quem é o administrador (não basta o e-mail no app, que é só uma trava de interface).
4. Moderação, porque mensagens entre pessoas são conteúdo gerado por usuário.

## Decisões propostas (a confirmar)
- **Opt-in:** só entra na comunidade quem ligar "Participar". Quem não ligar não aparece.
- **O que aparece:** nome de exibição, café favorito, método preferido, torra e sabores. **Nunca** telefone, idade, e-mail ou progresso.
- **Mensagens:** conversa direta entre cada pessoa e o administrador (uma "caixa" por usuário). Conversa entre usuários fica para uma segunda fase.
- **Denunciar e bloquear:** obrigatório na Play Store e na App Store para conteúdo de usuários; termos de uso e canal de contato.
- **Excluir a conta** apaga também o perfil público e as mensagens da pessoa.

## Desenho técnico (rascunho)
Coleções do Firestore:
- `community/{uid}`: perfil público (campos acima), `joinedAt`, `blocked`.
- `threads/{uid}/messages/{id}`: `from` (`user` ou `admin`), `text` (até 1000 caracteres), `at`, `readAt`.
- `reports/{id}`: denúncias.
- `admins/{uid}`: quem é administrador (documento criado só pelo console; ninguém grava pelo app).

Regras (ideia):
- `community/{uid}`: o dono lê e grava o próprio; quem é administrador lê todos.
- `threads/{uid}/messages`: o dono e os administradores leem e criam; ninguém edita nem apaga mensagem alheia; limite de tamanho e de frequência.
- `isAdmin()` = `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` e e-mail verificado.

Entrega de mensagens: no começo, só dentro do app (o app lê a conversa ao abrir). Notificação push (FCM) fica para depois, porque o princípio do app é não puxar a pessoa de volta.

## Antes de começar
- Escrever o **ADR** (próximo número livre) e atualizar a política de privacidade nos três idiomas, a página de exclusão de conta e o formulário de Segurança dos dados da Play Store.
- Ativar o **App Check** no Firebase, para o Firestore só aceitar pedidos vindos do app verdadeiro.
- Criar a tela de administrador em `src/app/admin/` e o item de Ajustes, visíveis só para administrador.
- Testar as regras no emulador do Firestore (hoje nenhuma regra foi testada no emulador, ADR-0017).
