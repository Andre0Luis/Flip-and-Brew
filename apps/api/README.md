# API do Flip & Brew

Backend em Node + TypeScript (Hono, Drizzle, Zod). Decisões e plano: `docs/adr/0024-backend-comunidade-e-login-obrigatorio.md` e `docs/PLANO-BACKEND-E-COMUNIDADE.md`.

**Estado:** base pronta e testada. O app **ainda não usa** esta API (continua no Firebase até a fase final do plano). O login real (Supabase Auth) é a última fase; até lá, tudo roda com um login de desenvolvimento.

## Rodar na sua máquina
```bash
cd apps/api
npm install --ignore-scripts
cp .env.example .env        # ajuste DEV_JWT_SECRET e ADMIN_EMAILS
npm run dev                 # http://localhost:8787, Postgres embutido (PGlite) em ./.data, migrações automáticas
```
Para um Postgres de verdade: `npm run db:up` (Docker) e `DATABASE_URL=postgres://flipandbrew:flipandbrew@127.0.0.1:54329/flipandbrew`, depois `npm run db:migrate`.

Um token para testar com `curl` (só com `AUTH_PROVIDER=dev`, nunca em produção):
```bash
TOKEN=$(npm run -s dev:token -- dono@exemplo.com)   # o e-mail em ADMIN_EMAILS vira admin no bootstrap
curl -X POST localhost:8787/v1/me/bootstrap -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{}'
curl localhost:8787/v1/admin/overview -H "authorization: Bearer $TOKEN"
```

## Banco do Supabase
- **Variáveis** (em `apps/api/.env`, nunca no git): `DATABASE_URL` (pooler em modo transação, porta 6543, usado pela API) e `MIGRATE_DATABASE_URL` (porta 5432, só para migrar). A API **não usa** a `service_role` nem a chave secreta do Supabase: ela conecta direto ao Postgres.
- **Migrar:** `npm run db:migrate` (aplica `apps/api/drizzle` numa transação; só avança).
- **TLS verificado:** o Node não conhece a CA do Supabase, então `src/db/supabase-ca.ts` traz as CAs públicas (intermediária e raiz "2021") e o cliente as usa em hosts `*.supabase.com`/`*.supabase.co`. Nunca desligue a verificação: a senha do banco iria a quem estivesse na frente. A raiz vale até 2031-04.
- **A chave `anon` é pública**, e o Supabase expõe o esquema `public` por HTTP. Por isso **toda tabela tem RLS ligada sem policies** (migração `0002`) e os papéis `anon`/`authenticated` perdem os privilégios (`0003`). Um teste falha se alguma tabela nova ficar sem RLS (`.enableRLS()` no esquema). Confira também em Supabase › Database › Security Advisor.

## E-mail (Brevo)
O e-mail de boas-vindas sai no primeiro `bootstrap`, uma vez só (se o provedor falhar, a próxima abertura tenta de novo; o cadastro nunca falha por isso). Usamos a **Brevo pela API HTTP**, como o backend do Clube Quinze: `POST https://api.brevo.com/v3/smtp/email` com o cabeçalho `api-key`.
1. Conta em brevo.com, **API key** (SMTP e API › Chaves de API) em `BREVO_API_KEY`.
2. **Remetente verificado** (Remetentes e IP) em `MAIL_FROM`. Sem domínio próprio, endereços de provedores gratuitos (Gmail) podem cair no spam ou ser reescritos pela Brevo por causa do DMARC **(confirmar)**; o ideal é um domínio, mesmo barato.
3. A recuperação de senha e a confirmação de e-mail serão do **Supabase Auth**, que pode usar o SMTP da Brevo (`smtp-relay.brevo.com`) na fase final.

## Testes
`npm run check` (typecheck + testes). Os testes usam o PGlite em memória e aplicam as migrações de verdade; não precisam de Docker nem de rede.

## O que existe
| Rota | Quem | O quê |
|---|---|---|
| `GET /health` | todos | saúde |
| `POST /v1/me/bootstrap` | logado | cria o perfil na primeira vez (idempotente), envia as boas-vindas uma vez; admin só por e-mail verificado em `ADMIN_EMAILS` |
| `GET/PATCH /v1/me`, `PATCH /v1/me/prefs`, `PATCH /v1/me/privacy` | logado | perfil, preferências de café, privacidade (só ranking geral e cafés preferidos; o perfil é público e a comunidade é só entre amigos); idade mínima de 18 anos |
| `POST /v1/me/ping` | logado | presença (alimenta "ativos agora") |
| `GET/PUT /v1/me/snapshot` | logado | backup do progresso (substitui o Firestore) |
| `POST/GET/DELETE /v1/me/coffees` | logado | registro de café de verdade |
| `DELETE /v1/me` | logado | exclui a conta e tudo que depende dela |
| `POST /v1/friend-requests` (`{userId}`), `GET /v1/me/friend-requests?direction=incoming\|outgoing`, `POST /v1/friend-requests/:id/accept`, `DELETE /v1/friend-requests/:id` | logado | amizade **com aprovação**: pedir, listar, aceitar (só quem recebeu), recusar ou cancelar; pedido de volta vira amizade; até 50 pedidos sem resposta |
| `GET /v1/me/friends`, `DELETE /v1/friends/:userId` | logado | lista de amigos e desfazer amizade |
| `POST /v1/blocks`, `DELETE /v1/blocks/:userId`, `GET /v1/me/blocks` | logado | bloquear desfaz a amizade e a pessoa some dos dois lados (busca, perfil, pedidos) |
| `GET /v1/users/search?q=`, `GET /v1/users/:handle` | logado | busca pelo começo do apelido e **perfil público** (sem e-mail e sem data de nascimento; cafés preferidos só se a pessoa deixou) |
| `GET /v1/admin/overview`, `GET /v1/admin/users` | admin | monitoramento |

Ainda não existem (próximas fases): posts e imagens (só entre amigos), ranking, mensagens, login do Supabase, deploy na Vercel.

## Regras que valem aqui
- **Toda entrada passa por Zod** (`packages/shared`), e campos desconhecidos são recusados (`.strict()`): o cliente não escolhe a própria `role`.
- **A role vem do banco** a cada pedido, nunca do token.
- **Esquema só muda por migração versionada:** edite `src/db/schema.ts`, rode `npm run db:generate` e commite a pasta `drizzle/`. O CI falha se o esquema e as migrações divergirem.
- **O banco do Supabase fica fechado:** RLS ligada, sem policies, Data API desativada. Só esta API acessa (ver o plano, seção 3.4).
