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

## Testes
`npm run check` (typecheck + testes). Os testes usam o PGlite em memória e aplicam as migrações de verdade; não precisam de Docker nem de rede.

## O que existe
| Rota | Quem | O quê |
|---|---|---|
| `GET /health` | todos | saúde |
| `POST /v1/me/bootstrap` | logado | cria o perfil na primeira vez (idempotente); admin só por e-mail verificado em `ADMIN_EMAILS` |
| `GET/PATCH /v1/me`, `PATCH /v1/me/prefs`, `PATCH /v1/me/privacy` | logado | perfil, preferências de café, privacidade; idade mínima de 18 anos |
| `POST /v1/me/ping` | logado | presença (alimenta "ativos agora") |
| `GET/PUT /v1/me/snapshot` | logado | backup do progresso (substitui o Firestore) |
| `POST/GET/DELETE /v1/me/coffees` | logado | registro de café de verdade |
| `DELETE /v1/me` | logado | exclui a conta e tudo que depende dela |
| `GET /v1/admin/overview`, `GET /v1/admin/users` | admin | monitoramento |

Ainda não existem (próximas fases): amizade com aprovação, seguir, posts e imagens, ranking, mensagens, login do Supabase, e-mail de boas-vindas, deploy na Vercel.

## Regras que valem aqui
- **Toda entrada passa por Zod** (`packages/shared`), e campos desconhecidos são recusados (`.strict()`): o cliente não escolhe a própria `role`.
- **A role vem do banco** a cada pedido, nunca do token.
- **Esquema só muda por migração versionada:** edite `src/db/schema.ts`, rode `npm run db:generate` e commite a pasta `drizzle/`. O CI falha se o esquema e as migrações divergirem.
- **O banco do Supabase fica fechado:** RLS ligada, sem policies, Data API desativada. Só esta API acessa (ver o plano, seção 3.4).
