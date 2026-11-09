# ADR-0017 · Pendências e riscos conhecidos

**Status:** Aberto (atualize sempre que algo for resolvido ou surgir) · **Última revisão:** 2026-11-07

Este arquivo é a **lista viva do que ainda não está pronto ou verificado**. Quando algo for resolvido, risque aqui e, se mudar uma decisão, escreva um ADR novo.

## Nunca rodou em aparelho (maior risco)
- [ ] **Sensor de virar o celular** (calibração, início automático, encerramento ao pegar). Ver `docs/VALIDATION.md`, seção 1.
- [ ] **Contagem com tela apagada e app em segundo plano.** Depende do comportamento do Android.
- [ ] **Módulo nativo `usage-stats`:** o **Kotlin nunca foi compilado**. O primeiro `npx expo run:android` pode apontar erro de compilação.
- [ ] Notificação silenciosa, haptics e fluidez das animações.
- [ ] **Login com Google** no aparelho (depende do SHA-1 certo; erro típico `DEVELOPER_ERROR`).

## Depende de conta, chave ou console (só o dono do projeto faz)
- [ ] Projetos Firebase (desenvolvimento e produção), logins ligados, Firestore criado e **regras publicadas**.
- [ ] `.env` preenchido (Firebase e Google) e variáveis cadastradas no EAS.
- [ ] Cliente OAuth Android do Google com pacote e **SHA-1 de cada build** (debug, EAS, Play).
- [ ] Usuário de teste no Firebase real (`npm run seed:test-user`, num projeto de desenvolvimento).
- [ ] RevenueCat e produtos `coins_N` no Play Console, se for vender moedas.
- [ ] Play Console: conta, ficha, formulários, teste interno e fechado.
- [ ] Hospedar a política de privacidade e a página de exclusão de conta; trocar o e-mail de contato no modelo.
- [ ] Capturas de tela do aparelho, ícone 512×512 e imagem de destaque da loja.

## Decisões de produto em aberto
- [ ] **Validação das moedas compradas em servidor** (webhook do RevenueCat gravando no Firestore) antes de vender de verdade.
- [ ] **Duas contas no mesmo aparelho:** os dados locais da primeira podem subir para a segunda quando ela não tem backup. Hoje é o comportamento simples.
- [ ] **App Check** do Firebase para produção.
- [ ] Equilíbrio da economia (tempos, preços, bônus) **não foi testado com pessoas**.
- [ ] Restringir a `apiKey` do Firebase por pacote e SHA-1.

## Conteúdo e qualidade
- [ ] **Revisão nativa do inglês e do espanhol** (interface, frases e artigos).
- [ ] **Revisão do conteúdo**, sobretudo o de sono, e das atribuições das frases.
- [ ] Textos de privacidade e de loja **sem revisão jurídica**.
- [ ] Regras do Firestore **não rodaram no emulador**.
- [ ] Contraste e acessibilidade checados só visualmente; falta TalkBack em aparelho.

- [ ] Faixas do desconto (30% check-in + 20% offline) e os preços novos **não foram testados com pessoas** (ADR-0018).
- [ ] Telefone e idade do perfil entram no formulário de Segurança dos dados da Play Store e na revisão da política de privacidade (ADR-0018).
- [x] **Série Cores da Torcida:** só referências de cores, sem nomes nem escudos de clubes (decisão do dono, ADR-0018).
- [x] Código do **Entrar com a Apple**, da redefinição de senha, da confirmação de e-mail e da troca de senha pronto (docs/FIREBASE.md); falta configurar a Apple e o Firebase e testar em aparelho.
- [ ] **App Store (iOS):** oferecer login com o Google exige também oferecer "Entrar com a Apple" (diretriz 4.8) ou ficar só com e-mail e senha; a exclusão de conta já pode ser iniciada em Ajustes (requisito da Apple, diretriz 5.1.1(v)).
- [x] Seção de café em Aprender, widgets de tela inicial e de bloqueio (docs/WIDGETS.md), comunidade em "em breve" (docs/COMUNIDADE.md) e introdução em três passos feitos.
- [ ] **Widgets nunca rodaram num aparelho**; precisam de build novo e teste no Android e no iOS.
- [ ] **Dados de saúde** (Health Connect e Apple Saúde) no widget e no Bem-estar: ainda não existem.

- [ ] **Moedas pelo tempo bloqueado** (ADR-0023): o Kotlin de `usage-stats` nunca foi compilado e a conta depende dele; taxa (1 moeda a cada 10 min), teto (60 por dia) e sono padrão (6 h) **não foram testados com pessoas** nem em aparelho. Dia com leitura parcial do Android (primeiro dia após a permissão) pode render a mais, limitado pelo teto.
- [ ] **Tempo de tela no iPhone** (ADR-0029): o Swift do módulo `usage-stats` e a extensão `ScreenTimeMonitor` compilam, mas **nunca rodaram num iPhone** (o simulador não tem Tempo de Uso). Falta ver se os limites disparam, se o primeiro dia sai certo e se o EAS habilita a Family Controls no identificador da extensão sozinho; se não, habilitar à mão em Certificates, Identifiers & Profiles.
- [ ] **Lembretes diários** (ADR-0022): horários, canal silencioso, toque abrindo o Início, reagendamento ao reabrir e depois de reiniciar o celular não foram validados em aparelho. Acima de 14 dias sem abrir o app, os avisos acabam.
## Anúncios e remoção paga (ADR-0021)
- [ ] **Conta no AdMob:** criar o app Android e o iOS, os blocos de banner, e trocar os IDs de teste do Google em `app.json` (`androidAppId`, `iosAppId`) pelos reais. Sem isso o banner só mostra anúncio de teste.
- [ ] Variáveis `EXPO_PUBLIC_ADMOB_BANNER_ANDROID` e `EXPO_PUBLIC_ADMOB_BANNER_IOS` no EAS (`preview` e `production`). Sem elas o build não mostra banner nem a opção de remover.
- [ ] **Produto `remove_ads`** (não consumível, R$ 19,98) no Play Console e no App Store Connect, entitlement `remove_ads` no RevenueCat. Conferir se o preço existe na grade da Apple.
- [ ] **Mensagem de consentimento (UMP)** criada no AdMob (Privacidade e mensagens); sem ela o formulário não aparece onde a lei exige.
- [ ] Play Console: declarar que o app tem anúncios e o **ID de publicidade**; formulário Segurança dos dados; App Store: rótulos de privacidade e, se mudar para anúncios personalizados, ATT.
- [ ] Banner e compra **nunca rodaram em aparelho**; precisam de build novo (módulo nativo, não roda no Expo Go).
- [ ] Textos antigos "sem anúncios": a apresentação em JPG (`store-assets/`, só local) precisa ser refeita.

## Backend e comunidade (ADR-0024)
- [ ] **GitHub Actions bloqueado por cobrança** ("account is locked due to a billing issue", visto em 2026-11-07): nenhum CI roda, incluindo os novos (`ci-api`, CodeQL, Gitleaks). Resolver em github.com/settings/billing. Até lá, conferir tudo localmente com `npm run check` e `cd apps/api && npm run check`.
- [x] Base da API (`apps/api`): perfil, bootstrap com admin por e-mail verificado, preferências, privacidade, presença, backup, café de verdade, monitoramento e exclusão de conta, com testes. **O app já pode usar a API** quando as 3 variáveis `EXPO_PUBLIC_*` existem (ADR-0027); sem elas segue no Firebase.
- [x] Decididas pelo dono (ADR-0024): idade 18, só ele modera e é o admin, ranking de café "mais" e "menos", e-mail pela **Brevo**, só amizade com aprovação (sem seguir), perfil público e comunidade só entre amigos, mensagens para sempre.
- [x] API de **amizade com aprovação**, bloqueio, busca por apelido e perfil público (`/v1/friend-requests`, `/v1/me/friends`, `/v1/blocks`, `/v1/users`), com testes. **Ainda sem telas no app.**
- [x] Entrada da Vercel (`src/index.ts`, preset Hono), login do **Supabase Auth** (`src/auth/supabase.ts`, a chave `anon` não vale como login) e workflow `vercel-checks.yml`. **Falta no painel da Vercel:** projeto ligado ao repositório, Root Directory `apps/api`, variáveis, e só então exigir o check `lint-gh`.
- [ ] **Aplicar as migrações no Supabase** (`cd apps/api && npm run db:migrate`, com `MIGRATE_DATABASE_URL` no `.env`). O projeto existe e está vazio; a conexão com TLS verificado foi testada. As migrações `0002` (RLS em todas as tabelas) e `0003` (revoga `anon` e `authenticated`) são o que impede que a chave pública `anon` leia o banco.
- [ ] **Girar as credenciais do Supabase** (senha do banco, `service_role`, chave secreta e segredo JWT) se o chat ou o log da sessão em que foram coladas puder ser visto por outras pessoas; a API só precisa da senha do banco.
- [x] **Swagger** (`/docs`, `/openapi.json`) gerado dos esquemas Zod, com teste contra rotas sem documentação. Em produção fica desligado, a menos que `DOCS_ENABLED=true`.
- [x] Deploy na Vercel, dois erros reais corrigidos com guarda em teste: entrada duplicada (`src/app.ts` vs `src/index.ts`) e `TS2688` (`typeRoots`). Terceiro erro real (imports sem `.js`, ERR_MODULE_NOT_FOUND) corrigido na #66; `flip-and-brew.vercel.app` responde 200 em `/health` e `/docs` desde 2026-11-07. Falta o check `lint-gh`.
- [x] App movido para `apps/mobile` e workflows separados (ADR-0025). **Falta:** o primeiro **build EAS** depois da mudança (não testado), e mover os arquivos locais ignorados (`.env`, `node_modules`...) para `apps/mobile/`.
- [ ] **Vulnerabilidade `decode-uri-component` (alta, negação de serviço)**, vinda do `query-string` do `expo-router` 57: a correção é o `expo-router` 58, que é do **Expo SDK 58**. O upgrade do SDK (React, eslint 10 e `eslint-config-expo` 58 vêm juntos) resolve esse e outros avisos de `npm audit` (`expo`/`glob`/`minimatch` indiretos). Enquanto isso o Dependabot ignora o que o SDK fixa.
- [ ] **Domínio próprio** para o e-mail (hoje remetente verificado na Brevo; Gmail pode cair no spam) e para a Cloudflare.
- [ ] Conta e chave da **Brevo**, remetente verificado e `ADMIN_EMAILS` nas variáveis da Vercel (o e-mail do dono não vai para o repositório).
- [ ] Fases seguintes: mover o app para `apps/mobile`, amizade com aprovação, posts e imagens, ranking, mensagens, **Supabase Auth**, e-mail de boas-vindas, deploy na Vercel (plano gratuito só para testes), corte do Firebase, textos "sem conta".
- [ ] **iPhone:** a Family Controls (Distribution) foi aprovada em 2026-11-08 e o tempo de tela estimado já existe no aparelho (ADR-0029), mas ele não pode ir para servidor; o ranking "menos celular" continua só no Android.
- [x] **Kotlin do módulo `usage-stats` compila** (build debug do Android passou em 2026-11-07, `:usage-stats:compileDebugKotlin`). Falta rodar num aparelho ou emulador e ver os números reais.

- [ ] **App com o backend próprio** (ADR-0027): nunca rodou em aparelho. Faltam as 3 variáveis `EXPO_PUBLIC_*` (`apps/mobile/.env` e EAS), configurar o Supabase Auth (e-mail e SMTP da Brevo, Google com "skip nonce check", Apple), revogar o token da Apple na exclusão. A **tela de nova senha** existe (`/nova-senha`, ADR-0027), mas exige `flipandbrew://nova-senha` em Redirect URLs no painel do Supabase e nunca rodou em aparelho.
- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** (Sensitive) na Vercel: sem ela, excluir a conta apaga os dados mas deixa o usuário no Supabase Auth.
- [ ] **Vercel Authentication** barra os domínios `*-andre0luis-projects.vercel.app`; só `flip-and-brew.vercel.app` é público. Conferir qual vai no `EXPO_PUBLIC_API_URL`.

- [ ] **Páginas públicas da API** (`/suporte`, `/privacidade`, `/excluir-conta`): definir `SUPPORT_EMAIL` na Vercel e usar essas URLs na App Store Connect e no Play Console. **A política de privacidade ainda diz que o backup fica no Firebase**: antes de ligar o app ao backend próprio, atualizar os textos `privacy.*` (Supabase, Vercel) e rodar `npm run docs:privacy` em `apps/mobile`.

- [ ] **Login obrigatório** (ADR-0028): implementado, nunca rodou em aparelho com o portão completo. Antes de ligar o backend no `production` do EAS: textos "sem conta" nas lojas e na política de privacidade (que ainda cita só o Firebase), **conta de teste para os revisores**, e "Entrar com a Apple" no iPhone. Confirmação de e-mail do Supabase ficou desligada de propósito.
- [ ] **Lembretes ligados por padrão** só em instalações novas; a permissão de notificações é pedida nos primeiros passos.

## Dívidas técnicas
- [ ] O histórico de uso do sistema é curto (o Android guarda poucos dias).
- [ ] Testes de interface automatizados no aparelho não existem; só o roteiro manual.
- [ ] Hoje o backup limita-se às 1500 sessões mais recentes.

## Já resolvido (para memória)
- [ ] **Escurecer a tela durante o copo** (`src/lib/brightness.ts`, ajuste opcional, desligado por padrão): não validado em aparelho. No iPhone muda o brilho do sistema e o valor anterior fica guardado em disco para restaurar após fechamento forçado.
- [ ] **Compras no iPhone** (RevenueCat): falta o `.p8` de In-App Purchase no painel, os produtos `coins_*` no App Store Connect e o primeiro build de iOS pelo EAS.
- [ ] **Login com Google no iPhone:** cliente OAuth iOS criado e `iosUrlScheme` no `app.json` (2026-11-09); falta testar num iPhone e, no Supabase, pôr o ID iOS em Client IDs e ligar "Skip nonce check".
- [ ] **Workflow `eas-build.yml`** falha por falta do segredo `EXPO_TOKEN` no GitHub.
- [ ] **Capturas das lojas** (`docs/store/screenshots.md`) são simuladas pela versão web; na aba Coleção em inglês, o rótulo "Achievements" encosta na borda em telas de 360 px.
- [ ] **Modo Pomodoro** (ADR-0020): foco de 25 min, pausa de 5 (15 a cada 4 focos) e aviso de fim da pausa não foram validados em aparelho.
- [x] Reinício do projeto, mecânica nova, visual novo.
- [x] Idiomas pt, en e es com dicionários tipados.
- [x] Contas, backup, exclusão e servidor falso.
- [x] Usuário de teste e manual de configuração.
- [x] Testes, lint e CI.
