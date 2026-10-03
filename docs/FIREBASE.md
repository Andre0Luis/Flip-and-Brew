# Configurar contas, login com Google e backup

> Para o guia completo (Expo, Google Play, RevenueCat e a ordem certa), veja `docs/MANUAL-CONFIGURACAO.md`. Este arquivo é o detalhe do Firebase.

O app já traz tudo pronto. Falta só criar o projeto no Firebase e preencher o `.env` (modelo em `.env.example`).
Sem essas chaves o app funciona normalmente, offline, e a opção de Conta não aparece.

## 1. Criar o projeto
1. Em <https://console.firebase.google.com>, crie um projeto (pode desligar o Google Analytics).
2. Em **Configurações do projeto › Seus apps**, adicione um app **Web** (`</>`). Dê qualquer apelido.
3. Copie os valores do `firebaseConfig` para o `.env`:

| `.env` | Campo do Firebase |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` |

## 2. Ativar os logins
Em **Authentication › Método de login**:
- Ative **E-mail/senha**.
- Ative **Google** e escolha um e-mail de suporte.

## 3. Login com o Google no Android
1. Em **Authentication › Método de login › Google**, expanda “Configuração do SDK da Web” e copie o **ID do cliente da Web**. Ele vai em `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
2. No **Google Cloud Console** (mesmo projeto) › **APIs e serviços › Credenciais**, crie um **ID do cliente OAuth do tipo Android** com:
   - nome do pacote: `com.andre0luis.FlipAndBrew`
   - **impressão digital SHA-1** da chave que assina o app. Você precisa de uma por tipo de build:
     - debug local: `cd android && ./gradlew signingReport` (depois de `npx expo run:android`)
     - EAS (preview e production): `eas credentials` mostra o SHA-1 do keystore
     - Google Play (quando usar “Assinatura de app do Google Play”): copie o SHA-1 em **Play Console › Integridade do app**
3. O cliente Android não vai no `.env`. Basta existir, com o pacote e o SHA-1 certos, no mesmo projeto do cliente Web.

Se o botão do Google abrir e voltar com erro `DEVELOPER_ERROR`, quase sempre o SHA-1 ou o nome do pacote está diferente do build que você está rodando.

## 4. Banco do backup (Firestore)
1. **Firestore Database › Criar banco de dados**, no modo de produção.
2. Publique as regras deste repositório (cada pessoa só acessa o próprio documento):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project SEU_PROJECT_ID
   ```
   As regras estão em `firebase/firestore.rules`. Sem elas o banco fica fechado e o backup falha.

## 5. Variáveis no build
- Desenvolvimento local: copie `.env.example` para `.env` e preencha. **Rebuilde** (`npx expo run:android`), porque os valores são embutidos no app. Se mudar o `.env` depois, limpe o cache do Metro (`npx expo start --clear`, ou `--clear` no `expo export`); sem isso o app pode continuar com os valores antigos.
- EAS: cadastre cada variável com `eas env:create` (ou no painel do EAS) para os ambientes `preview` e `production`.

## 6. Testar sem chaves
Em desenvolvimento, `EXPO_PUBLIC_AUTH_MODE=mock` troca o Firebase por um servidor falso na memória, só para ver as telas de conta, cadastro, backup e exclusão. Nunca vale em build de produção.

## O que o app guarda na nuvem
Um único documento `users/{uid}` com o progresso (copos, moedas, itens, humor, artigos lidos e preferências de meta, idioma e tema), até as 1500 sessões mais recentes. Não vão para a nuvem a calibração do sensor, as ferramentas de teste nem o copo em andamento.

## Exclusão de conta
Conta › Excluir conta pede a senha (ou a confirmação do Google), apaga o documento `users/{uid}` e depois a conta no Firebase Authentication. Os dados do aparelho continuam até a pessoa apagá-los em Ajustes. Veja também `docs/ACCOUNT-DELETION.md`.


## Entrar com a Apple (iOS)

Obrigatório na App Store quando há login com o Google (diretriz 4.8). No código está pronto (`expo-apple-authentication`, botão oficial, nonce com SHA-256, revogação do token ao excluir a conta). Falta configurar nas contas:

1. **Apple Developer** > Certificates, Identifiers & Profiles > Identifiers > o App ID `com.andre0luis.FlipAndBrew` > marque **Sign In with Apple**.
2. Crie uma **Service ID** (para o Firebase) e uma **chave** (Keys > Sign in with Apple), anote o Key ID e baixe o `.p8`.
3. **Firebase Console** > Authentication > Método de login > **Apple** > ativar e colar o Service ID, o Team ID, o Key ID e a chave privada.
4. Rebuild do app de iOS (`eas build -p ios`), porque o `app.json` ganhou `usesAppleSignIn` e o plugin.

## Contas com e-mail e senha

- **Esqueci a senha:** `Entrar` > "Esqueci a senha" > e-mail > o Firebase envia o link. A tela sempre responde "se existir uma conta...", para não revelar quais e-mails estão cadastrados.
- **Confirmar e-mail:** o cadastro envia o e-mail de confirmação; em Conta há "Reenviar" (com espera de 60 s) e "Já confirmei".
- **Alterar senha:** em Conta, pede a senha atual e a nova duas vezes (mínimo de 8 caracteres).
- **Modelos de e-mail:** Firebase Console > Authentication > Templates. Ajuste o nome do remetente, o idioma (português) e o assunto da confirmação e da redefinição de senha. Sem isso, os e-mails saem em inglês e com o nome do projeto.
- **Política de senha:** em Authentication > Configurações > Política de senha, exija o mesmo mínimo de 8 caracteres.
