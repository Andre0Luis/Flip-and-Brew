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
| `GET /v1/admin/overview`, `GET /v1/admin/users` | admin | monitoramento |

Ainda não existem (próximas fases): amizade com aprovação, posts e imagens (só entre amigos), ranking, mensagens, login do Supabase, deploy na Vercel.

## Regras que valem aqui
- **Toda entrada passa por Zod** (`packages/shared`), e campos desconhecidos são recusados (`.strict()`): o cliente não escolhe a própria `role`.
- **A role vem do banco** a cada pedido, nunca do token.
- **Esquema só muda por migração versionada:** edite `src/db/schema.ts`, rode `npm run db:generate` e commite a pasta `drizzle/`. O CI falha se o esquema e as migrações divergirem.
- **O banco do Supabase fica fechado:** RLS ligada, sem policies, Data API desativada. Só esta API acessa (ver o plano, seção 3.4).
