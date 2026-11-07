# Plano: backend, login obrigatório, comunidade, amigos e ranking

Status: **decisões do dono registradas em 2026-11-07; implementação ainda não começou.** Escrito em 2026-11. Quando aprovado, vira a ADR-0024 e este arquivo fica como roteiro de execução. Pontos marcados com **(confirmar)** são afirmações sobre planos gratuitos e regras de lojas que eu não verifiquei hoje: confira nos sites oficiais antes de decidir.

## 0. Decisões já tomadas (2026-11-07)

| # | Tema | Decisão |
|---|---|---|
| 1 | Login | **Supabase Auth**, mas **por último**: primeiro tudo funciona **em ambiente local** com um login de desenvolvimento (JWT assinado por segredo local, só em `development`); o Supabase Auth entra quando o resto estiver pronto. A API recebe um `AuthProvider` trocável. |
| 2 | Hospedagem | **Vercel**. O plano gratuito (Hobby) é o teste inicial; o plano será trocado antes do lançamento (uso comercial: anúncios e compras). |
| 3 | "Café" no ranking | **Café de verdade.** Nova funcionalidade: o usuário **registra os cafés que bebeu** (ver 6.1). Os copos do app continuam sendo "tempo offline". |
| 4 | Ranking "menos celular" | **Só Android no começo.** No iPhone, ver a nota sobre a permissão da Apple na seção 8. |
| 5 | Amigos | **Pedido com aprovação** (a outra pessoa precisa aceitar). Seguir (um sentido, para ver posts públicos) continua existindo à parte. |
| 6 | Idade mínima | **18 anos** no lançamento, como constante fácil de mudar. O dono considera possível baixar para 16; menores de 18 pedem revisão jurídica (LGPD) antes. **Moderação: só o admin no começo** (assumido; confirmar). |
| 7 | Monorepo | **Mover o app para `apps/mobile`**, depois de mesclar os PRs abertos. |
| 8 | Admin | Tela **dentro do app** agora, painel web depois. |
| 9 | Idade | **18 anos**, fechado. |
| 10 | Moderação e admin | **Só o dono**, que é o único admin (e-mail em `ADMIN_EMAILS`, não no repositório). |
| 11 | Ranking de café | **Mais café e menos café**, os dois. |
| 12 | E-mail | **Brevo** pela API HTTP (como no backend do Clube Quinze), sem domínio próprio por enquanto. |
| 13 | Amizade e visibilidade | **Só amizade com aprovação, sem "seguir"**. **Perfil visível para todos; comunidade (posts, imagens, mensagens) só entre amigos.** |
| 14 | Retenção | Presença 30 dias; **mensagens e posts para sempre**. |

## 1. O que você pediu, em uma página

- **Backend próprio** (Go ou Node/TS), hospedado na Vercel, com o Postgres que já está no Supabase.
- **Login obrigatório**, cadastro, recuperar senha, e-mail de boas-vindas, **roles** (você é `admin`).
- **Preferências e progresso** do usuário salvos no servidor (hoje é o backup no Firebase).
- **Comunidade:** posts, mensagens e imagens compactadas que o app consegue ver.
- **Perfil público:** seu perfil, seus posts, cafés e métodos preferidos, seguidores e amigos.
- **Ranking:** entre amigos (quem tomou mais ou menos café) e **o ranking principal: quem usou menos o celular**.
- **Tela de monitoramento (admin):** quantos usuários ativos agora, quem são, quando se inscreveram.
- **Monorepo** com o app atual + backend, **DevOps** (build automático a cada merge na `main`) e **segurança** com ferramentas gratuitas.

## 2. O que existe hoje (para não refazer à toa)

- **Firebase Auth** (e-mail e senha, Google, Apple) e **um único documento Firestore por pessoa** (`users/{uid}`) com o backup do progresso. Sem Storage, sem push, sem Cloud Functions. Regras em `firebase/firestore.rules`.
- O estado vivo do app é **local** (Zustand + MMKV). A nuvem é só cópia de segurança, sincronizada por `src/lib/cloud/sync.ts`.
- Tudo fica atrás da interface **`CloudBackend`** (`src/lib/cloud/types.ts`), com o Firebase de verdade e um servidor falso. **Isso ajuda muito:** trocar o Firebase pelo backend novo é escrever uma terceira implementação dessa interface, sem reescrever as telas de conta.
- A aba Comunidade é só um aviso "em breve" (`docs/COMUNIDADE.md` tem um rascunho antigo, em Firestore, que este plano substitui).

## 3. Decisões de arquitetura (com recomendação)

### 3.1 Linguagem: **Node + TypeScript** (recomendo)
| | Node + TS | Go |
|---|---|---|
| Vercel | suporte de primeira classe | runtime existe, mas é o caminho menos usado **(confirmar)** |
| Monorepo com o app | **tipos e validações compartilhados** com o app (um `packages/shared`) | duplicar tipos e regras em outra linguagem |
| Regras puras que já temos | reaproveita direto (`stats`, `usage`, `passive`) | reescrever |
| Desempenho/memória | suficiente para este porte | melhor, mas sem ganho que você sinta agora |
| Time | você já mantém TS | segunda linguagem para manter |

Go só compensaria com muito tráfego ou latência crítica. Aqui o gargalo vai ser banco e rede, não CPU. **Stack:** [Hono](https://hono.dev) (leve, roda na Vercel e em qualquer outro lugar), **Zod** para validar toda entrada, **Drizzle ORM** + `drizzle-kit` para migrações. **Testes:** `node:test` (como o resto do projeto) com **PGlite**, um Postgres embutido, em vez de Vitest e contêiner.

### 3.2 Login: **Supabase Auth**, integrado por último (decisão 1)
O Postgres já é do Supabase, e o Supabase Auth entrega pronto: cadastro, confirmação de e-mail, **recuperar senha**, Google e Apple, refresh de sessão. Fazer isso na mão é a parte mais perigosa de um backend (hash de senha, tokens, enumeração de usuários, limites de tentativa).
- O app usa `@supabase/supabase-js` **só para autenticar**. Todo o resto vai para a **nossa API**, que valida o JWT do Supabase (chaves públicas JWKS) a cada pedido.
- **Roles ficam no nosso banco** (`profiles.role`), nunca em campo que o usuário consegue editar. A API lê a role do banco a cada pedido administrativo.
- O e-mail padrão do Supabase tem limite baixo de envio **(confirmar)**: configure **SMTP próprio** (Resend, plano gratuito **(confirmar)**), que também manda o **e-mail de boas-vindas** e os templates de confirmação e recuperação em português.
- **Desenvolvimento local primeiro:** a API define uma interface `AuthProvider` com duas implementações: `devAuth` (aceita um JWT assinado com um segredo local, **só quando `NODE_ENV=development`**, e há um comando para criar usuários e admins de teste) e `supabaseAuth` (valida o JWT do Supabase por JWKS). O Postgres local roda no Docker (ou no Supabase CLI), e o app aponta para `http://localhost`. Trocar para o Supabase é configuração e testes, sem reescrever rotas.
- **Alternativa descartada:** auth próprio (argon2 + JWT + refresh + e-mails): mais código e risco.

### 3.3 Hospedagem: **atenção ao plano Hobby da Vercel**
Pelos termos da Vercel, o plano Hobby é para uso **pessoal e não comercial** **(confirmar)**. **Decisão 2:** usar o Hobby só para testes e trocar o plano **antes de abrir para o público** (o app tem anúncios e compras). O Hono continua portátil: se mudar de ideia, roda igual em Fly.io, Railway, Render ou Cloud Run.

Limites de serverless que moldam o desenho:
- Sem WebSocket de longa duração: o feed e as mensagens começam com **puxar para atualizar** e consulta periódica. Tempo real (Supabase Realtime) fica para depois.
- Conexão com o banco **sempre pelo pooler** do Supabase (modo transação), senão cada função abre uma conexão e esgota o limite.
- Tarefas agendadas (ranking, limpeza) via Vercel Cron, que no plano gratuito é limitado **(confirmar)**; no começo o ranking é calculado na leitura.

### 3.4 Banco: Supabase Postgres, **só a API acessa**
- Todas as tabelas com **RLS ligada e nenhuma policy** (nega tudo) e a **Data API/PostgREST desativada**. O Supabase expõe o banco por HTTP com uma chave pública; sem RLS, qualquer pessoa leria tudo. A API conecta por usuário próprio, fora do RLS.
- Dois projetos: **staging** e **produção** (o plano gratuito deixa criar dois **(confirmar)**). O gratuito pausa o projeto depois de uma semana sem uso e tem limite de 500 MB de banco e 1 GB de arquivos **(confirmar)**: serve para validar, não para lançar.
- Migrações versionadas no repositório (`drizzle-kit`), aplicadas pelo CI, nunca à mão.

### 3.5 Imagens
- O **app comprime antes de enviar** (`expo-image-manipulator`): lado maior 1080 px, WebP ou JPEG com qualidade ~0,7, e uma miniatura de ~320 px. Isso também **remove os dados EXIF** (localização da foto).
- A API entrega uma **URL assinada de envio** (Supabase Storage); o arquivo vai direto do app para o Storage, sem passar pela função (limite de corpo de pedido da Vercel). Tipos permitidos: JPEG, PNG, WebP; limite de tamanho no servidor; nome gerado pelo servidor.
- Leitura por **CDN com bucket público** para fotos de posts públicos e URL assinada para as privadas. O app exibe com `expo-image` (cache em disco).
- Moderação de imagem automática não é gratuita de forma confiável: no começo vale **denunciar + remoção pelo admin**, e limite de posts por dia.

## 4. Mudança de princípio (precisa de ADR)

O app era **offline-first com conta opcional** (ADR-0009, e a regra "o app nunca pode exigir conta" no `CLAUDE.md`). Passa a ser **login obrigatório**. O que continua valendo:
- O **copo, as moedas e o motor continuam locais**: depois de entrar uma vez, a sessão fica guardada e o app funciona sem internet. Só comunidade, amigos e ranking precisam de rede.
- Consequências a aceitar: mais atrito na primeira abertura (queda de instalações que viram usuários), **Google Play e App Store exigem uma conta de teste** para os revisores, e todos os textos "funciona sem conta" mudam (descrições das lojas, introdução, política de privacidade, Segurança dos dados).
- **ADRs afetadas:** 0009 e 0010 (substituídas em parte), 0014 (privacidade), 0018 (perfil). A 0021 (anúncios) ganha idade mínima e consentimento.

## 5. Monorepo

```
/
├─ apps/
│  ├─ mobile/        # o app atual, movido sem alterar código
│  └─ api/           # Hono + Drizzle (Vercel)
├─ packages/
│  └─ shared/        # schemas Zod, tipos da API, regras puras (ranking, validação de sessão)
├─ docs/  .github/  package.json (workspaces)
```
- **npm workspaces** (já usamos npm), sem ferramenta extra. Turborepo é opcional depois, só para cache de CI.
- **Mover o app para `apps/mobile` é a parte arriscada:** mexe em caminhos do `eas.json`, Metro, `tsconfig` (`@/`), CI e nos builds das lojas. Faço em **um PR só de movimentação**, depois de mesclar os PRs abertos (#17 a #20) para não gerar conflito enorme, e testo um build EAS de preview antes de seguir.
- **Alternativa menos arriscada:** deixar o app na raiz e criar só `server/` e `packages/shared/`. Perde a simetria, ganha segurança nos builds. Eu recomendo mover, mas a escolha é sua.

## 6. Modelo de dados (Postgres)

Tudo com `id uuid`, `created_at`, e exclusão em cascata a partir de `profiles` (apagar conta apaga tudo, inclusive arquivos).

**Pessoas e acesso**
- `profiles`: `id` (= usuário do Supabase Auth), `handle` (único, minúsculo), `display_name`, `avatar_path`, `bio`, `role` (`user` | `moderator` | `admin`), `birth_year` (idade mínima), `country`, `welcomed_at`, `last_seen_at`, `banned_at`, `deleted_at`.
- `coffee_prefs`: `user_id`, `favorite_coffees[]`, `methods[]`, `roast`, `flavors[]` (o que hoje está no perfil local, agora público se a pessoa deixar).
- `privacy_settings`: `profile_visibility` (`public` | `friends` | `private`), `show_in_global_ranking`, `show_coffee_prefs`.
- `user_snapshots`: `user_id`, `data jsonb`, `updated_at`, `version`. **É o backup que hoje está no Firestore**, com a mesma lógica de conflito por `updated_at`.

**Social**
- `follows`: `follower_id`, `followee_id` (um sentido, para ver posts públicos).
- `friendships`: `requester_id`, `addressee_id`, `status` (`pending` | `accepted` | `declined`), `created_at`, `responded_at`. **Amizade só existe depois que a outra pessoa aceita** (decisão 5). Ranking entre amigos, posts só para amigos e mensagens usam só `accepted`. Limite de pedidos pendentes por pessoa, para evitar spam.
- `blocks`: `blocker_id`, `blocked_id`. Bloqueio some dos feeds, dos rankings e impede mensagem.
- `posts`: `author_id`, `body` (até 1000), `images jsonb` (caminhos e tamanhos), `visibility`, `deleted_at`.
- `post_likes`, `comments` (`post_id`, `author_id`, `body`, `deleted_at`).
- `conversations` + `conversation_members` + `messages` (`sender_id`, `body`, `image`, `read_at`). **Fase 1: só conversa entre cada pessoa e o admin**; entre usuários só depois de moderação funcionando.
- `reports`: `reporter_id`, `target_type`, `target_id`, `reason`, `status`, `resolved_by`.

**Medição e ranking**
- `coffee_logs`: `user_id`, `at`, `kind` (espresso, coado, cappuccino…), `method`, `size_ml` (opcional), `note`. **Registro de café de verdade** (6.1). Um registro por café, apagável pela pessoa.
- `daily_stats`: `user_id`, `day`, `offline_min`, `cups`, `cups_full`, `screen_min` (nulo no iPhone), `unlocks`, `locked_min`, `platform`. **Enviado pelo app** (uma linha por dia, substituível).
- `leaderboard` calculado **na leitura** a partir de `daily_stats` (índice por `day` e `user_id`); vira tabela agregada só se ficar lento.

**Operação**
- `activity`: `user_id`, `at`, `platform`, `app_version` (pings de presença, com retenção de 30 dias).
- `audit_log`: `actor_id`, `action`, `target`, `at`, `meta` (tudo o que admin e moderador fazem).

### 6.1 Registro de café de verdade (funcionalidade nova)
- Botão "Tomei um café" no Início e no Perfil, com tipo e método (usa as mesmas listas das preferências), horário padrão agora e opção de editar. Desfazer na hora.
- Guardado **primeiro no aparelho** (funciona sem rede) e sincronizado com o servidor; um registro nunca é perdido por falta de conexão.
- Alimenta o ranking "mais café" e "menos café" entre amigos e o perfil ("cafés da semana"). **Cuidado de produto:** premiar "mais café" incentiva beber mais; vale oferecer só "menos café" como competição saudável, ou deixar o dono escolher qual aparece. Anotado para decidir.
- Não é dado de saúde clínico, mas é hábito pessoal: opt-in para aparecer no ranking e na política de privacidade.

## 7. API (`/v1`, JSON, JWT do Supabase)

| Grupo | Rotas principais | Quem |
|---|---|---|
| Saúde | `GET /health` | público |
| Conta | `POST /me/bootstrap` (cria o perfil na 1ª vez e **envia o e-mail de boas-vindas, uma vez**), `GET/PATCH /me`, `DELETE /me` (apaga tudo), `POST /me/ping` (presença) | logado |
| Backup | `GET/PUT /me/snapshot` | logado |
| Perfil | `GET /users/:handle`, `GET /users/:handle/posts`, `PATCH /me/prefs`, `PATCH /me/privacy` | logado |
| Social | `POST/DELETE /follows/:id`, `GET /me/followers`, `GET /me/following`, `GET /me/friends`, `GET /users/search?q=`, `POST/DELETE /blocks/:id` | logado |
| Posts | `GET /feed`, `POST /posts`, `DELETE /posts/:id`, `POST /posts/:id/like`, `GET/POST /posts/:id/comments`, `POST /uploads/sign` | logado |
| Mensagens | `GET /conversations`, `GET/POST /conversations/:id/messages` | logado |
| Café | `POST /me/coffees`, `GET /me/coffees`, `DELETE /me/coffees/:id` | logado |
| Amizade | `POST /friend-requests/:userId`, `GET /me/friend-requests`, `POST /friend-requests/:id/accept` e `/decline`, `DELETE /friends/:userId` | logado |
| Ranking | `POST /me/daily-stats`, `GET /rankings/friends?metric=&period=`, `GET /rankings/global?metric=&period=` | logado |
| Denúncia | `POST /reports` | logado |
| Admin | `GET /admin/overview` (ativos agora, cadastros por dia, totais), `GET /admin/users` (lista paginada), `GET /admin/reports`, `POST /admin/users/:id/ban`, `DELETE /admin/posts/:id`, `PATCH /admin/users/:id/role` | `admin` (moderador só denúncias e posts) |

Regras gerais: **todo corpo validado com Zod**; paginação por cursor; **limite de pedidos** por IP e por usuário; resposta de erro padronizada sem vazar detalhes internos; `403` quando a role não bate, **checada no banco**.

## 8. Ranking

**Métricas** (período: semana ou mês):
1. **Menos tempo de tela** (principal, o objetivo do app). Menor `screen_min` médio por dia. **Só Android no começo** (decisão 4).
2. **Mais tempo offline** (`offline_min`, vem dos copos do app; vale para Android e iPhone).
3. **Mais café** e **menos café** (cafés de verdade, `coffee_logs`), só entre amigos.

Pontos que precisam de decisão (seção 14):
- **Permissão da Apple para tempo de tela (decisão 4).** É a capability **Family Controls** (Screen Time API: `FamilyControls`, `DeviceActivity`). O que a pesquisa de hoje mostrou, sem ser texto oficial da Apple:
  - Para **publicar** (TestFlight e App Store) é preciso pedir a **"Family Controls (Distribution)"** no formulário da Apple (`developer.apple.com/contact/request/family-controls-distribution`, logado na conta de desenvolvedor), **uma vez para o app e uma para cada extensão** que use a API. Para desenvolver, a entitlement de desenvolvimento libera na hora.
  - A resposta é lenta e sem prazo: relatos vão de semanas a meses, sem e-mail de confirmação nem como acompanhar. Há relatos de **negativa para apps que não usam Family Sharing**.
  - **O ponto que mais importa:** os números de uso ficam dentro de uma extensão isolada (`DeviceActivityReport`) feita para **mostrar** o relatório ao próprio usuário. Há relatos e citação do contrato de desenvolvedor de que **não se pode compartilhar dados de uso recebidos pelo Family Controls**. Isso indica que **o app não consegue enviar o tempo de tela do iPhone para o servidor** para montar um ranking. Em outras palavras: mesmo com a permissão aprovada, o ranking de "menos celular" no iPhone provavelmente não é permitido.
  - **Recomendação:** pedir a permissão só se houver um uso local no iPhone (por exemplo, mostrar o tempo de tela do próprio usuário no Bem-estar, sem enviar a ninguém), e manter o ranking do iPhone em "mais tempo offline". Antes de gastar tempo, **confira o formulário atual e os termos do programa de desenvolvedores**.
- **Café = café de verdade** (decisão 3), com o registro da seção 6.1; copos do app seguem como tempo offline.
- **Trapaça:** os números vêm do aparelho. Mitigação razoável, não perfeita: teto de minutos por dia, ignorar dias absurdos, mínimo de dias com dado para entrar no ranking global, e o admin pode remover alguém. O ranking global é **opcional** (`show_in_global_ranking`), com apelido (`handle`), nunca e-mail ou nome real.

## 9. App (o que muda)

- **Portão de login:** troca o `Stack.Protected guard={onboarded}` por sessão válida. Fluxo: introdução → cadastro/login → app. A sessão fica guardada para funcionar offline.
- **Telas novas:** Perfil (avatar, bio, posts, cafés e métodos preferidos, estatísticas, seguidores e seguindo), Comunidade (feed, criar post com imagem, detalhe e comentários), Amigos (buscar por `handle`, seguir), Ranking (amigos e geral, escolher métrica e período), Mensagens com o admin, Denunciar/Bloquear em todo conteúdo.
- **Navegação:** já são 6 abas. Proposta: manter 6, e a aba **Comunidade vira um hub** com Feed | Ranking | Amigos; o **Perfil** abre pelo avatar no cabeçalho. Evita uma barra com 8 itens.
- **Admin dentro do app:** tela "Monitoramento" (só aparece para `role = admin`, e **a API é quem decide**, não a interface): usuários ativos agora (visto nos últimos 5 minutos), lista com quem são e quando se cadastraram, cadastros por dia, denúncias abertas. Se depois você quiser um painel web, é um `apps/admin` pequeno consumindo as mesmas rotas.
- **`CloudBackend`:** nova implementação `apiBackend` (Supabase Auth + nossa API), o servidor falso continua para desenvolver sem chaves. O Firebase sai depois do corte. Como o app ainda não foi lançado, **não vejo usuários reais para migrar** (confirmar).
- Envio de `daily_stats` (e do `ping`) quando o app abre ou volta ao primeiro plano.

## 10. Segurança

**Desenho**
- API valida o JWT em toda rota, **autorização por dono** em toda consulta (`WHERE author_id = :me`), role checada no banco, Zod em toda entrada, CORS restrito, cabeçalhos de segurança, limite de pedidos (Upstash Redis, plano gratuito **(confirmar)**), tamanho máximo de corpo.
- Segredos só em variáveis da Vercel e do GitHub. **O repositório é público:** nunca commitar chave. A chave de serviço do Supabase **jamais** vai para o app.
- Upload só por URL assinada, tipo e tamanho limitados, nome gerado no servidor. Apagar post apaga o arquivo.
- Presença e métricas com retenção curta (30 dias para `activity`).

**Ferramentas gratuitas para este repositório (público)**
| Ferramenta | Para quê |
|---|---|
| **Dependabot** (alertas e atualizações) | dependências vulneráveis, npm e GitHub Actions |
| **CodeQL** (code scanning do GitHub, grátis em repositório público) | falhas no código TS/JS |
| **Secret scanning + push protection** (grátis em público) | impede commitar chaves |
| **Gitleaks** no CI | varre o histórico atrás de segredos |
| **OSV-Scanner** (Google) e `npm audit` | vulnerabilidades conhecidas nas dependências |
| **Semgrep CE** | regras de segurança (injeção, JWT, CORS) |
| **OWASP ZAP baseline** contra o preview | varredura dinâmica da API |
| **OpenSSF Scorecard** | nota de saúde do repositório |
| **Supabase Security Advisor** (no painel) | avisa tabela sem RLS |
| **Cloudflare** (plano gratuito) na frente do domínio da API | WAF básico, proteção de DDoS, DNS |
| **Sentry** (plano gratuito **(confirmar)**) | erros no app e na API |
Também ligar **autenticação em dois fatores** nas contas de GitHub, Vercel, Supabase, Apple e Google, e exigir **PR revisado + CI verde** na `main`.

**Conformidade que vira requisito (conteúdo de usuário)**
- **Apple (diretriz 1.2) e Google Play (política de conteúdo gerado por usuários):** denunciar, bloquear, filtrar conteúdo ofensivo, termos de uso aceitos no cadastro, contato visível e remoção rápida do admin **(confirmar os textos atuais)**.
- **LGPD:** base legal (consentimento/execução do contrato), política atualizada, **exportar e excluir dados**, minimização. **Idade mínima** (13? 16? 18?) precisa de decisão e, para menores no Brasil, revisão jurídica: não é algo que eu resolva sozinho.
- **Anúncios + login:** consentimento (UMP) continua, e a idade mínima vale para o formulário do AdMob.
- O ID de publicidade e os novos dados (e-mail, fotos, posts, mensagens, uso do celular) entram na **Segurança dos dados** da Play e nos rótulos da App Store.

## 11. DevOps e CI/CD

- **Hoje:** `ci.yml` (typecheck, lint, testes, bundle Android) e `eas-build.yml` (precisa do segredo `EXPO_TOKEN`, ainda pendente).
- **Depois do monorepo**, com filtro de caminhos para só rodar o que mudou:
  1. `ci-mobile`: igual ao de hoje, em `apps/mobile` + `packages/shared`.
  2. `ci-api`: typecheck, lint, testes com um **Postgres em container** (service do GitHub Actions) rodando as migrações de verdade, e `drizzle-kit check`.
  3. `security`: CodeQL, Gitleaks, OSV-Scanner, `npm audit`, Semgrep (a cada PR e toda semana).
  4. `deploy-api` **ao mesclar na `main`**: aplica migrações no Supabase (com aprovação manual no ambiente `production`), depois o deploy. A forma mais simples é a **integração Git da Vercel** (preview em todo PR, produção na `main`); se preferir tudo no GitHub Actions, usa `vercel deploy --prebuilt` com token.
  5. `eas-build`: continua disparando o build do app só quando muda `apps/mobile/**` ou `packages/shared/**`.
- **Ambientes:** local (Supabase CLI ou Docker com Postgres), **staging** (previews dos PRs), **produção**. Cada um com seu projeto do Supabase e suas variáveis.
- **Observabilidade:** logs da Vercel, Sentry, alerta simples de `GET /health` (UptimeRobot gratuito **(confirmar)**).
- `main` protegida: PR obrigatório, CI verde, sem push direto.

## 12. Fases e PRs (cada fase é um PR separado, na ordem)

A ordem mudou: **o login do Supabase fica por último** (decisão 1), e tudo antes roda em ambiente local com `devAuth`.

| # | Entrega | Depende de |
|---|---|---|
| 0 | **Você:** mesclar os PRs abertos (#17 a #22) para o monorepo não gerar conflito; criar as contas (Supabase staging, Vercel, Resend, Sentry) só quando chegar a hora delas | — |
| 1 | ADR-0024, monorepo (`apps/mobile` por `git mv`, `apps/api`, `packages/shared`), CI por caminho, Dependabot, CodeQL, Gitleaks; teste de um build EAS de preview | 0 |
| 2 | API base: Hono, Drizzle, migrações, Postgres local (Docker), `GET /health`, `AuthProvider` com `devAuth`, limite de pedidos, testes com Postgres | 1 |
| 3 | Perfil, preferências e backup no servidor (`snapshot`), `apiBackend` no app (ainda com login de desenvolvimento); o Firebase continua até o corte | 2 |
| 4 | **Monitoramento admin:** `ping`, `/admin/overview`, `/admin/users`, tela no app só para admin | 3 |
| 5 | **Pedido de amizade com aprovação**, bloquear, busca e perfil público (**API pronta**; as telas do app vêm depois do monorepo). Sem "seguir", por decisão do dono | 3 |
| 6 | Comunidade: posts, comentários, curtidas, **upload de imagem comprimida**, denunciar, moderação do admin | 5 |
| 7 | **Registro de café de verdade** + `daily_stats` + ranking (amigos; geral só Android) | 5 |
| 8 | Mensagens (usuário ↔ admin) | 6 |
| 9 | **Supabase Auth:** cadastro, login, recuperar senha, e-mail de boas-vindas (Resend), roles, **portão de login obrigatório**, idade mínima, corte do Firebase | 3 a 8 |
| 10 | Endurecimento: ZAP no preview, revisão de RLS, termos de uso, política e Segurança dos dados, conta de teste para as lojas, exportar e excluir dados, textos "sem conta" | todas |

Cada PR atualiza as ADRs, a ADR-0017 (pendências), os textos nos três idiomas e os testes, como o resto do projeto.

## 13. Riscos principais

1. **Vercel Hobby e uso comercial** (seção 3.3).
2. **Plano gratuito do Supabase** pausa, tem limite de banco e de arquivos: bom para validar, não para lançar.
3. **Ranking "menos celular" só existe no Android**; o módulo `usage-stats` **nunca foi compilado** (ADR-0017).
4. **Conteúdo de usuário** traz obrigação de moderar. Sem uma pessoa para olhar denúncias, a comunidade não deve abrir.
5. **Login obrigatório** reduz a conversão e exige conta de teste nas lojas.
6. **Menores de idade e LGPD:** decisão e revisão que não são técnicas.
7. **Mover o app para `apps/mobile`** pode quebrar builds das lojas se feito sem teste.
8. **Dados do ranking vêm do aparelho** e podem ser forjados.

## 14. Decisões que ainda estão em aberto

Quase tudo foi decidido (seção 0). Resta:
1. **Domínio próprio.** Sem domínio, o e-mail sai de um remetente verificado na Brevo, e endereços Gmail podem ir para o spam. No código do Clube Quinze o remetente padrão usa `clubequinzeapp.cloud`: se esse domínio for seu, dá para reaproveitá-lo (ou um subdomínio) também aqui.
2. **Apple Family Controls:** pedir só se houver uso local no iPhone (seção 8).
3. **Plano da Vercel e do Supabase** antes de abrir ao público (hoje só testes).
