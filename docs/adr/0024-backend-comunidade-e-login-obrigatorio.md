# ADR-0024 · Backend próprio, comunidade, amigos, ranking e login obrigatório

**Status:** Aceita; implementação em fases (ver `docs/PLANO-BACKEND-E-COMUNIDADE.md`) · **Data:** 2026-11
**Substitui em parte:** ADR-0009 (conta opcional e "sem servidor"), ADR-0010 (Firebase para contas e backup) e o rascunho `docs/COMUNIDADE.md` (Firestore). Só deixam de valer **quando a fase final do plano entrar**; até lá o app continua como está.

## Contexto
O dono quer: login obrigatório, perfil público com posts e cafés preferidos, comunidade com imagens, amigos e seguidores, ranking (principal: quem usou menos o celular), registro de café de verdade, tela de monitoramento para o admin e um backend próprio. Hoje há só o Firebase (Auth + um documento de backup por pessoa).

## Decisão
- **Backend em Node + TypeScript** (Hono, Drizzle, Zod), em `apps/api`, com contratos compartilhados em `packages/shared`. Go foi descartado: a Vercel trata Node como primeira classe e o app já é TypeScript (tipos e regras compartilhados).
- **Banco:** o Postgres que já está no Supabase, acessado **só pela API** (RLS ligada sem policies, Data API desativada), pelo pooler. Migrações versionadas em `apps/api/drizzle`.
- **Login: Supabase Auth, mas por último.** A API tem uma interface `AuthProvider`; hoje só existe o `devAuth` (JWT assinado com um segredo local, recusado em produção). Assim tudo é testado em ambiente local antes de ligar o provedor real.
- **Hospedagem: Vercel.** O plano gratuito é só para testes; o plano será trocado antes de abrir ao público (anúncios e compras são uso comercial). A API é portátil.
- **Roles** (`user`, `moderator`, `admin`) ficam em `profiles.role` e são lidas do banco a cada pedido. Admin nasce de e-mail **verificado** listado em `ADMIN_EMAILS`.
- **Café de verdade** é registrado pela pessoa (`coffee_logs`); copos do app seguem como tempo offline.
- **Ranking "menos celular" só no Android** no começo. No iPhone, o tempo de tela exige a entitlement Family Controls e, segundo o que se conseguiu apurar, os dados não podem ser enviados a servidor; o ranking do iPhone usa "mais tempo offline".
- **Amizade exige aprovação** (`friendships` com `pending`/`accepted`); "seguir" (um sentido) existe à parte para posts públicos.
- **Idade mínima: 18 anos** (constante `MIN_AGE`), validada pela data de nascimento. Menores de 18 pedem revisão jurídica (LGPD) antes. **Moderação:** só o admin no começo.
- **Admin:** tela de monitoramento dentro do app (ativos agora, quem são, quando entraram); painel web fica para depois.
- **Monorepo:** `apps/mobile` (o app, movido por `git mv` numa fase própria), `apps/api`, `packages/shared`. **Testes da API usam `node:test`** (como o resto do projeto) e um Postgres embutido (PGlite), em vez do Vitest e do contêiner previstos no plano.
- **DevOps e segurança:** CI por caminho, CodeQL, Gitleaks e Dependabot (gratuitos em repositório público); deploy a cada merge na `main`.

## Alternativas descartadas
- **Auth próprio:** mais código e risco (senhas, tokens, recuperação) sem ganho agora.
- **Seguir como amizade:** o dono pediu aprovação.
- **Café = copos do app:** o dono quer café de verdade.
- **Liberar o app sem conta:** o dono decidiu pelo login obrigatório.

## Consequências
- **Muda a proposta do app** (offline, conta opcional): mais atrito na abertura, **contas de teste para os revisores** da Play Store e da App Store, e todos os textos "funciona sem conta" mudam na fase final.
- **Conteúdo de usuário** traz obrigações das lojas (denunciar, bloquear, termos, contato, moderação) e da LGPD (exportar e excluir dados, idade).
- Ranking de tempo de tela do iPhone provavelmente não é viável; a decisão deve ser revista se a Apple mudar as regras.
- O plano e as dúvidas em aberto estão em `docs/PLANO-BACKEND-E-COMUNIDADE.md`.
