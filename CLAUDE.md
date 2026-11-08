@AGENTS.md

# Flip & Brew

**Antes de mudar uma decisão de produto ou de arquitetura, leia `docs/adr/`.** Se a decisão mudar, escreva um ADR novo e marque o antigo como substituído; não apague. Atualize `docs/adr/0017-pendencias-e-riscos-conhecidos.md` quando resolver ou descobrir uma pendência.

App Expo (SDK 56) em português. Leia o README para o funcionamento e a estrutura. **O app fica em `apps/mobile/`** (monorepo, ADR-0025): os caminhos `src/...`, `modules/...` e `app.json` deste arquivo e do README são relativos a essa pasta.

- **Antes de codar:** `npm run check` na raiz (app e API) ou, só do app, `cd apps/mobile && npm run check` (typecheck, lint e testes). Os testes cobrem `src/lib`, `src/store`, as traduções e o conteúdo.
- **React Compiler está ligado:** o lint barra `Date.now()` direto no render. Use `useNow()` ou um inicializador preguiçoso.
- **Regras de negócio** ficam em `src/lib` como funções puras. Telas só montam e chamam. O estado vive em `src/store/useApp.ts`.
- **Decisões do motor do copo** (iniciar, encerrar, retomar) ficam em `src/lib/engine.ts`, com testes; `src/engine/BrewEngine.tsx` só liga sensor, relógio e navegação.
- **Contagem do copo** usa `startedAt` (horário), nunca um contador em memória, porque o app pode ficar em segundo plano.
- **Tema:** use `useTheme()` (`c`, `f`, `r`); não escreva cores nem nomes de fonte soltos nos componentes. Em cartões invertidos (`Card inverse`) use `tone="quietOnDark"` nos botões secundários.
- **Ilustrações:** `src/art/Art.tsx`. Cada instância prefixa os ids dos gradientes; mantenha isso, ou a web mistura gradientes entre SVGs.
- **Navegação:** `router.dismissTo('/')` para voltar às abas; `replace('/')` empilha uma segunda cópia.
- **Textos** curtos e diretos, sem emoji. Nunca escreva texto de interface direto nos componentes: use `const { t, lang } = useI18n()` e acrescente a chave em `src/i18n/pt.ts`, `en.ts` e `es.ts`. Conteúdo longo vai em `src/data/content/<idioma>.ts`. Plural usa `chave.one` e `chave.many`.
- **Gatilhos de interrupção** são guardados como chave neutra (`notification`, `boredom`, `work`, `habit`, `other`), nunca como texto traduzido.
- **Backend** em `apps/api` (Node + TS, ADR-0024), com contratos em `packages/shared`. O app o usa **só se** `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (uma chave com cara de chave do Supabase) existirem (`apiBackend`, ADR-0027); **com ele ligado o login é obrigatório** (ADR-0028); o corte do Firebase vem na fase final do plano (`docs/PLANO-BACKEND-E-COMUNIDADE.md`). Todo import relativo em `apps/api/src` termina em `.js` (Node ESM na Vercel). `cd apps/api && npm run check` cobre só o backend; o `npm run check` da raiz roda os dois. **Workflows separados:** mudança no app só dispara os do app (`ci.yml`, `eas-build.yml`); mudança na API ou em `packages/shared` só dispara o `ci-api.yml`.
- **Contas** ficam atrás da interface `CloudBackend` (`src/lib/cloud/types.ts`): o Firebase de verdade e um servidor falso para desenvolvimento. **Com o backend próprio ligado o app exige conta (portão em `src/lib/loginGate.ts`, ADR-0028); com o Firebase ou sem servidor a conta é opcional e, sem chaves, a Conta some.** As variáveis `EXPO_PUBLIC_*` precisam ser escritas por extenso em `config.ts`. Ao mudar o que vai para a nuvem, atualize `snapshot.ts`, os testes e a política de privacidade.
- **Commits e títulos de PR** seguem Conventional Commits (ADR-0026): `tipo(escopo): descrição` com tipo em `feat fix docs style refactor perf test build ci chore revert`, descrição em português, minúscula, sem ponto e com o assunto inteiro em até 72 caracteres (`feat(api): adiciona o ranking entre amigos`). O check **Commits** do PR confere.
