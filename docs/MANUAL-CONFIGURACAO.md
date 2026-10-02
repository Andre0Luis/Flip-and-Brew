# Manual de configuração: contas, acessos e credenciais

Este é o guia único para colocar o Flip & Brew no ar. Ele diz **quais contas criar**, **onde pegar cada credencial** e **onde colocá-la** (`.env`, EAS ou Play Console), na ordem certa.

> **Resumo.** O app já funciona sem nenhuma conta externa. Cada item abaixo liga uma parte: contas e backup (Firebase), login com Google (Google Cloud), build e envio (Expo EAS), publicação (Google Play) e compra de moedas (RevenueCat).
> Valores, limites de plano e regras das lojas mudam. Onde isto importa, o manual diz **"confira"**: veja a página oficial antes de decidir.

---

## 1. Contas que você precisa

| Conta | Para quê | Custo | Obrigatória? |
| --- | --- | --- | --- |
| **Conta Google** (Gmail) | Base de tudo: Firebase, Google Cloud e Play Console usam a mesma | Grátis | Sim |
| **Expo** (expo.dev) | Gerar o app (EAS Build), guardar variáveis de ambiente, enviar à loja | Plano gratuito com cota mensal de builds (confira) | Sim, para gerar o app instalável |
| **Firebase / Google Cloud** | Cadastro, login com Google, backup na nuvem | Plano gratuito Spark cobre o uso inicial (confira as cotas) | Só se quiser contas e backup |
| **Google Play Console** | Publicar na Play Store | Taxa única de cadastro (hoje US$ 25; confira) | Só para publicar |
| **RevenueCat** | Compra de moedas dentro do app | Plano gratuito inicial (confira limites) | Só se for vender moedas |
| **GitHub** (você já tem) | Código, CI e, se quiser, a página da política de privacidade | Grátis | Já existe |
| **E-mail de contato** | Suporte e pedidos de exclusão de conta | Grátis | Sim, para publicar |
| Apple Developer | App na App Store | US$ 99 por ano (confira) | **Não agora.** O foco é Android |

Antes de começar, tenha à mão: um e-mail Google que você acessa sempre, um cartão (a Play Console cobra a taxa; o Google Cloud pede cartão para verificar a conta, mesmo no plano gratuito) e um documento de identidade (a Play Console verifica a identidade do desenvolvedor).

---

## 2. Ordem recomendada

1. [Testar sem nenhuma conta](#3-testar-sem-nenhuma-conta-usuário-de-teste) (5 minutos)
2. [Expo e EAS](#4-expo-e-eas)
3. [Firebase: contas e backup](#5-firebase-contas-e-backup)
4. [Login com Google](#6-login-com-google)
5. [Usuário de teste no Firebase](#7-usuário-de-teste-no-firebase-de-verdade)
6. [Primeiro build no aparelho e validação](#8-primeiro-build-e-validação)
7. [RevenueCat (opcional)](#9-revenuecat-compra-de-moedas-opcional)
8. [Páginas públicas: privacidade e exclusão de conta](#10-páginas-públicas)
9. [Google Play Console](#11-google-play-console)
10. [Variáveis: tabela completa](#12-todas-as-variáveis-de-ambiente)
11. [Problemas comuns](#13-problemas-comuns)

Os passos 4 a 7 podem esperar: o app roda sem eles. Comece pelo 1, 2 e 6.

---

## 3. Testar sem nenhuma conta (usuário de teste)

Você não precisa de Firebase para ver as telas de conta e o app cheio.

### Usuário de teste no app (qualquer build de desenvolvimento)
1. Abra **Ajustes** (engrenagem no Início). Em build de desenvolvimento as ferramentas de teste já aparecem; em outro build, toque **7 vezes na versão**, no fim da tela.
2. Toque em **Carregar usuário de teste**. Você ganha:
   - **50.000 moedas**
   - **todas** as cafeteiras e xícaras (Chemex e Coleção Estoica incluídas)
   - **90 dias** de histórico (cerca de 230 copos), com interrupções, humor e gatilhos
   - artigos lidos e práticas feitas
3. Também há **Ganhar 500 moedas**, **Ganhar 10.000 moedas** e **Carregar 4 semanas de dados de exemplo**. **Copos de 1 minuto** deixa o fluxo do copo rápido.

### Conta de teste para as telas de login (servidor falso)
Para ver cadastro, login, backup e exclusão sem Firebase, rode em desenvolvimento com o servidor falso:

```bash
# no .env
EXPO_PUBLIC_AUTH_MODE=mock
```
```bash
npx expo start --clear
```

Já existe uma conta pronta, com o progresso farto acima:

| | |
| --- | --- |
| **E-mail** | `teste@flipandbrew.app` |
| **Senha** | `Teste@12345` |

Na tela **Conta**, o botão **Preencher conta de teste** digita os dois campos. Entrar com ela restaura as 50.000 moedas e o histórico. Cadastro, "esqueci a senha", Google (finge uma conta) e exclusão funcionam contra esse servidor falso. Ele só existe em desenvolvimento, fica no armazenamento do aparelho e **nunca fala com a internet nem vale em build de produção**.

---

## 4. Expo e EAS

O EAS gera o app instalável (APK para testar, AAB para a Play Store).

1. Crie a conta em <https://expo.dev/signup>. O projeto já tem `owner: andre0luis` e `projectId` no `app.json`; use a mesma conta ou rode `eas init` para recriar.
2. Instale e entre:
   ```bash
   npm install -g eas-cli
   eas login
   eas whoami
   ```
3. Confira os perfis em `eas.json`:
   - `development`: app de desenvolvimento com o dev client, APK interno
   - `preview`: APK interno para testar
   - `production`: AAB para a Play Store, com `versionCode` automático
4. Build de teste no aparelho (gera um APK que você instala):
   ```bash
   eas build --platform android --profile preview
   ```
   Na primeira vez o EAS pergunta se pode gerar e guardar a **keystore** (chave de assinatura). Responda que sim: ele cuida disso e você pode baixar depois com `eas credentials`.
5. **Variáveis de ambiente do build.** Tudo o que está no `.env` precisa existir também no EAS, porque o EAS não lê o seu `.env`:
   ```bash
   eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "..." --environment preview --visibility plaintext
   ```
   Repita para cada variável e para os ambientes `preview` e `production`. Ou cadastre pelo painel em expo.dev › seu projeto › Environment variables. As `EXPO_PUBLIC_*` vão **dentro do app**: não são segredos (veja a seção 14).

Credenciais que o EAS cria e guarda para você: keystore de assinatura. Credenciais que você cria e **não** vão para o `.env` nem para o git: chave de conta de serviço do Google Play (seção 11).

---

## 5. Firebase: contas e backup

Recomendação: **dois projetos**, `flipandbrew-dev` (para testes e o usuário de teste) e `flipandbrew` (produção). Assim a conta de teste, com senha conhecida, nunca existe no projeto real.

1. Entre em <https://console.firebase.google.com> com a conta Google.
2. **Criar projeto** › nome › pode desligar o Google Analytics.
3. **Configurações do projeto (engrenagem) › Seus apps › Web (`</>`)** › registre um app com qualquer apelido › copie o `firebaseConfig`:

   | `.env` | Campo |
   | --- | --- |
   | `EXPO_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
   | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
   | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` |

   O app Android **não** precisa de `google-services.json`: o código usa o SDK web do Firebase.
4. **Authentication › Começar › Método de login**: ative **E-mail/senha** e **Google** (escolha o e-mail de suporte do projeto).
5. **Firestore Database › Criar banco de dados**: modo **produção**, região perto dos usuários (por exemplo `southamerica-east1`).
6. **Publique as regras** do repositório (cada pessoa acessa só o próprio documento):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project SEU_PROJECT_ID
   ```
   Sem isso o banco fica fechado e o backup falha com `permission-denied`.
7. Preencha o `.env` (copie de `.env.example`) e **limpe o cache** ao rodar: `npx expo start --clear`. O Expo guarda os valores antigos em cache.

Mais detalhes e o que o app guarda na nuvem: `docs/FIREBASE.md`.

---

## 6. Login com Google

Precisa do passo 5 feito (o Firebase cria o projeto do Google Cloud junto).

1. **ID do cliente da Web** (vai no `.env`):
   - Firebase › Authentication › Método de login › Google › "Configuração do SDK da Web" › copie o **ID do cliente da Web** (termina em `.apps.googleusercontent.com`).
   - Coloque em `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
2. **Tela de consentimento** (<https://console.cloud.google.com> › o projeto › **Google Auth Platform**, ou "APIs e serviços › Tela de permissão OAuth"):
   - Nome do app: Flip & Brew. E-mail de suporte e e-mail de contato do desenvolvedor.
   - Escopos: os básicos (`email`, `profile`, `openid`) bastam; o app não pede mais nada.
   - **Público/status**: enquanto estiver em **Teste**, só os e-mails que você cadastrar como "usuários de teste" conseguem entrar. Para qualquer pessoa entrar, **publique o app** (status "Em produção"). Com só os escopos básicos, normalmente não precisa de verificação do Google (confira).
3. **Cliente OAuth do tipo Android** (no mesmo projeto, **Credenciais › Criar credenciais › ID do cliente OAuth › Android**):
   - Nome do pacote: `com.andre0luis.FlipAndBrew`
   - **SHA-1** da chave que assina o build. É preciso **um cliente (ou uma impressão digital) para cada chave de assinatura diferente**:

   | Build | De onde vem o SHA-1 |
   | --- | --- |
   | Debug local (`npx expo run:android`) | depois do primeiro build: `cd android && ./gradlew signingReport` e copie o SHA1 de `debug` |
   | EAS (`preview` e `production`) | `eas credentials` › Android › o perfil › mostra o SHA-1 do keystore |
   | Instalado pela Play Store | Play Console › seu app › **Integridade do app** › "Assinatura de app" › SHA-1 do certificado de **assinatura de app** |

   Esse cliente Android **não** vai no `.env`. Ele só precisa existir, com o pacote e o SHA-1 certos, no mesmo projeto do cliente Web.
4. Rebuilde o app. Mudar SHA-1 não exige novo código, mas o Google leva alguns minutos para propagar.

Se aparecer `DEVELOPER_ERROR` ao tocar em "Continuar com o Google", o SHA-1 ou o nome do pacote não bate com o build que está rodando.

---

## 7. Usuário de teste no Firebase de verdade

Faça num projeto de **desenvolvimento** (seção 5), nunca no de produção.

1. No `.env`, além das chaves do Firebase, defina:
   ```bash
   TEST_USER_EMAIL=teste@flipandbrew.app
   TEST_USER_PASSWORD=Teste@12345      # escolha a sua
   ```
2. Simule primeiro (não usa rede):
   ```bash
   npm run seed:test-user:dry
   ```
3. Crie de verdade:
   ```bash
   npm run seed:test-user
   ```
   O script cria o usuário (ou entra, se já existir) e grava o progresso farto em `users/{uid}`: 50.000 moedas, todos os itens e 90 dias de histórico. Se algo estiver errado ele diz o quê (método E-mail/senha desligado, regras não publicadas, chave inválida).
4. No app, **Conta › Entrar** com esse e-mail e senha: o app restaura o progresso.

Para apagar: Firebase › Authentication › Usuários, e Firestore › `users/{uid}`.

---

## 8. Primeiro build e validação

```bash
npm install
npm run check                    # typecheck, lint e testes
npx expo run:android             # compila e instala no aparelho conectado (USB, depuração ligada)
```

Pré-requisitos locais para `run:android`: Android Studio (ou apenas o SDK e o JDK 17), um celular com **Opções do desenvolvedor › Depuração USB** ligada. O primeiro build demora.

Depois siga **`docs/VALIDATION.md`**, em checklist: sensor de virar o celular, segundo plano, uso do sistema, notificação, conta e backup. O módulo nativo `usage-stats` nunca foi compilado antes; se o build falhar nele, me mande o erro.

---

## 9. RevenueCat: compra de moedas (opcional)

Só se for vender moedas. Sem isto o app mostra que a compra não está ativa.

1. Conta em <https://app.revenuecat.com>. Crie um **projeto**.
2. **Play Console**: crie os **produtos no app** (Monetizar › Produtos › Produtos no app) do tipo consumível, com identificadores que **terminem no número de moedas**: `coins_100`, `coins_500`, `coins_1000`, `coins_5000`. O app lê o número do identificador.
3. **RevenueCat › Apps › + New › Google Play Store**: informe o pacote `com.andre0luis.FlipAndBrew` e envie a **credencial de conta de serviço** do Google Play (o RevenueCat tem um guia passo a passo; é o mesmo tipo de chave da seção 11).
4. **Products**: importe os produtos criados. **Offerings**: crie a offering `default`, marque como atual e inclua um pacote por produto.
5. Copie a **chave pública do SDK Android** (começa com `goog_`) para `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
6. Rebuilde. A tela **Guia** passa a listar os pacotes, e a compra soma as moedas.

Atenção: as moedas são creditadas no aparelho depois da compra, **sem validação em servidor**. Antes de vender de verdade, considere um webhook do RevenueCat gravando o crédito no Firestore.

---

## 10. Páginas públicas

A Play Store exige uma **URL da política de privacidade** e uma **URL de exclusão de conta**.

1. Os textos já existem: `docs/PRIVACY.pt.md` (e `.en`, `.es`), gerados do próprio app (`npm run docs:privacy`), e `docs/ACCOUNT-DELETION.md`. Troque `[E-MAIL DE CONTATO]` neste último pelo seu e-mail.
2. Onde hospedar (escolha uma):
   - **GitHub Pages**: repositório › Settings › Pages › Deploy from a branch › `main` › `/docs`. Em repositório **privado** isso depende do plano do GitHub (confira). A URL costuma ser `https://andre0luis.github.io/Flip-and-Brew/PRIVACY.pt.html`; confira a gerada.
   - **Firebase Hosting** (gratuito, usa o mesmo projeto): `firebase init hosting`, publique uma pasta com as páginas.
   - Qualquer página pública que você já tenha.
3. Guarde as duas URLs: elas vão no Play Console (seção 11).

---

## 11. Google Play Console

1. Crie a conta em <https://play.google.com/console/signup>, tipo **Pessoal** ou **Organização**. Pague a taxa de cadastro e conclua a **verificação de identidade** (pode levar dias).
   - Contas pessoais novas costumam precisar de um **teste fechado** com um número mínimo de testadores por um período antes de liberar a produção. Confira a regra atual no Play Console, porque ela já mudou.
2. **Criar app**: nome Flip & Brew, idioma padrão português (Brasil), app (não jogo), gratuito.
3. **Ficha da loja** (Crescer › Presença na loja): use os textos prontos em `docs/store/pt.md`, `en.md`, `es.md`. Faltam as **capturas de tela do aparelho** (mínimo de 2), o **ícone de 512×512** (reduza `assets/images/icon.png`) e a **imagem de destaque** (1024×500).
4. **Conteúdo do app** (Política › Conteúdo do app):
   - **Política de privacidade**: a URL da seção 10.
   - **Exclusão de conta**: a URL da seção 10 e a explicação do caminho no app.
   - **Anúncios**: o app não tem.
   - **Acesso ao app**: tudo funciona sem login; a conta é opcional.
   - **Classificação de conteúdo**: responda o questionário (sem conteúdo sensível).
   - **Segurança dos dados**: use `docs/store/data-safety.md` como base.
   - **Permissões sensíveis**: `PACKAGE_USAGE_STATS` (Acesso ao uso). Se o Play Console pedir uma declaração, justifique: lê desbloqueios e tempo de tela do dia para o painel de bem-estar, só no aparelho, opcional.
5. **Enviar o app**. Duas formas:
   - **Manual**: `eas build --platform android --profile production` gera o `.aab`; baixe e envie em Teste › Teste interno › Criar versão.
   - **Automática** (`eas submit`): precisa de uma **conta de serviço** do Google:
     1. Google Cloud › IAM › Contas de serviço › criar › crie uma **chave JSON** e baixe.
     2. Play Console › Configurações › **Acesso à API** (ou Usuários e permissões) › convide o e-mail da conta de serviço com permissão para publicar nos apps.
     3. **Não coloque o JSON no git.** Guarde fora do repositório e aponte `submit.production.android.serviceAccountKeyPath` em `eas.json`, ou cadastre-o como arquivo de segredo no EAS. O `.gitignore` já bloqueia `*service-account*.json`.
     4. `eas submit --platform android --profile production`.
6. **Assinatura de app do Google Play**: aceite o padrão. O SHA-1 de **assinatura de app** (Integridade do app) é o que vai no cliente Android do Google (seção 6, linha "Instalado pela Play Store").
7. Fluxo: **Teste interno** → **Teste fechado** → **Produção**.

---

## 12. Todas as variáveis de ambiente

Copie `.env.example` para `.env`. Para o build no EAS, cadastre as mesmas variáveis (seção 4).

| Variável | De onde vem | Para quê | Sem ela |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase › app Web › `apiKey` | Contas e backup | A Conta não aparece |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` | idem | idem |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` | idem | idem |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` | idem | idem |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | idem | idem |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` | idem | idem |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Firebase › Authentication › Google › ID do cliente da Web | Login com Google | O botão do Google não aparece |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat › chave pública do SDK (`goog_…`) | Compra de moedas | A loja explica que a compra não está ativa |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat (`appl_…`) | Compra no iOS | Só importa se for lançar no iOS |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Você escolhe | Só o script `seed:test-user` | O script recusa rodar |
| `EXPO_PUBLIC_AUTH_MODE=mock` | Você liga | Servidor falso, só em desenvolvimento | Usa o Firebase real, se houver chaves |

Regras: toda `EXPO_PUBLIC_*` é **embutida no app** e visível para quem baixa o APK, então não ponha segredo nelas. Mudou o `.env`? Rebuilde e use `npx expo start --clear`.

Segredos de verdade (nunca no repositório nem no `.env`): chave JSON da conta de serviço do Play, keystore, senhas.

---

## 13. Problemas comuns

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| A Conta não aparece em Ajustes | Faltam as chaves do Firebase, ou cache antigo | Preencha o `.env` e rode `npx expo start --clear`; no EAS, cadastre as variáveis |
| "Continuar com o Google" não aparece | Falta `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, ou está na web | Preencha o ID do cliente Web; o botão só existe no Android/iOS |
| `DEVELOPER_ERROR` no Google | SHA-1 ou pacote do cliente Android não bate | Confira o SHA-1 do build que está rodando (seção 6) |
| Google diz "acesso bloqueado" | Tela de consentimento em Teste e seu e-mail não é testador | Adicione-se como usuário de teste ou publique o app |
| `auth/operation-not-allowed` | Método de login desligado | Ative E-mail/senha (e Google) em Authentication |
| `permission-denied` no backup | Regras do Firestore não publicadas | `firebase deploy --only firestore:rules` |
| "Sem conexão com a internet" ao entrar | Sem rede, ou chave de API inválida | Teste a rede; confira `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `auth/requires-recent-login` ao excluir | Sessão antiga | Entre de novo; o app já pede a senha ou o Google ao excluir |
| O build Android falha no módulo `usage-stats` | O Kotlin nunca foi compilado antes | Copie o erro e mande para eu corrigir |
| Moedas compradas não aparecem | Offering sem pacote atual, ou produto sem número no identificador | Confira a seção 9 |
| Os valores do `.env` não mudam | Cache do Metro | `npx expo start --clear` |

---

## 14. Segurança, em poucas linhas

- **Separe dev e produção** no Firebase. O usuário de teste só vale no de desenvolvimento.
- A chave `apiKey` do Firebase **não é um segredo**; quem protege os dados são as **regras do Firestore** (já no repositório). Mesmo assim, no Google Cloud › Credenciais você pode restringir a chave ao pacote Android e ao SHA-1.
- Ative o **App Check** quando o app estiver em produção, para o backend aceitar só o seu app (fica para depois).
- Nunca comite `.env`, o JSON de conta de serviço ou o keystore. O `.gitignore` já cobre `.env` e arquivos de conta de serviço.
- Ao trocar de projeto Firebase, atualize as seis variáveis, o cliente Web do Google e republique as regras.
