# ADR-0025 · App em `apps/mobile` e workflows separados por área

**Status:** Aceita · **Data:** 2026-11 · **Complementa:** ADR-0024 (backend e monorepo)

## Contexto
O repositório tinha o app Expo na raiz e, ao lado, o backend (`apps/api`) e os contratos (`packages/shared`). O dono aprovou mover o app para uma pasta própria e quer que cada área tenha as suas verificações: o app só roda os fluxos do app, e a API só os da API.

## Decisão
- **O app foi movido para `apps/mobile/`** com `git mv` (o histórico dos arquivos se preserva): `src/`, `assets/`, `modules/`, `plugins/`, `scripts/`, `index.ts`, `app.json`, `eas.json`, `tsconfig.json`, `eslint.config.js`, `package.json`, `package-lock.json`, `.env.example` e a configuração do Firebase do app (`firebase.json` e `firebase/firestore.rules`, legado que sai no corte do Firebase). O comando `firebase deploy` agora roda de `apps/mobile/`.
- **Ficaram na raiz:** `docs/` (documentação do projeto inteiro), `test.bash` (script de credenciais do Google Cloud), `.github/` e os atalhos do `package.json`. **`packages/shared`** continua em `packages/` (pasta padrão de monorepo): hoje só a API o usa, e o app o importará quando houver comunidade e login.
- **Sem workspaces:** cada pasta (`apps/mobile`, `apps/api`, `packages/shared`) tem o próprio `package-lock.json` e se instala sozinha. Um `package.json` na raiz só traz atalhos (`npm run check` roda o do app e o da API; `npm start`).
- **Workflows separados** (ficam no `.github/`, que não se move):
  - `ci.yml` ("CI Mobile", job `check-mobile`): só com mudança em `apps/mobile/**`.
  - `eas-build.yml`: só com mudança em `apps/mobile/**`; roda a partir dessa pasta.
  - `ci-api.yml` (job `check-api`) e `vercel-checks.yml`: só API e `packages/shared`.
  - `codeql.yml` e `secrets.yml` seguem globais, de propósito: protegem o repositório todo.
  - Dependabot: o app agora é `/apps/mobile`.
- `scripts/gen-privacy.ts` passou a escrever em `../../docs` e a **descobrir sozinho todas as seções** de privacidade (antes só percorria as de 1 a 8 e apagaria a de anúncios).

## Consequências
- **Arquivos locais ignorados pelo git precisam acompanhar o app:** `.env` (e `.env.local`) → `apps/mobile/.env`; `node_modules/`, `.expo/`, `android/`, `ios/` e `store-assets/` também ficam em `apps/mobile/`. O keystore (`*.jks`) continua onde está.
- **Os caminhos citados nos ADRs anteriores e nos guias de `docs/` são os de antes da mudança:** prefixe com `apps/mobile/` (`src/lib/...` é `apps/mobile/src/lib/...`). Os ADRs não foram reescritos; são registro histórico.
- **Build EAS:** o `eas.json` está em `apps/mobile/` e o EAS roda a partir dessa pasta (monorepo comum). **Não foi testado com um build real**; o primeiro build depois da mudança é o teste.
- **Depois de mesclar,** reinstale/mova o `node_modules` do app (`cd apps/mobile && npm ci`) e mova o `.env`.
