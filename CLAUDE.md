@AGENTS.md

# Flip & Brew

App Expo (SDK 56) em português. Leia o README para o funcionamento e a estrutura.

- **Antes de codar:** `npm run check` (typecheck, lint e testes). Os testes cobrem `src/lib`, `src/store`, as traduções e o conteúdo.
- **React Compiler está ligado:** o lint barra `Date.now()` direto no render. Use `useNow()` ou um inicializador preguiçoso.
- **Regras de negócio** ficam em `src/lib` como funções puras. Telas só montam e chamam. O estado vive em `src/store/useApp.ts`.
- **Decisões do motor do copo** (iniciar, encerrar, retomar) ficam em `src/lib/engine.ts`, com testes; `src/engine/BrewEngine.tsx` só liga sensor, relógio e navegação.
- **Contagem do copo** usa `startedAt` (horário), nunca um contador em memória, porque o app pode ficar em segundo plano.
- **Tema:** use `useTheme()` (`c`, `f`, `r`); não escreva cores nem nomes de fonte soltos nos componentes. Em cartões invertidos (`Card inverse`) use `tone="quietOnDark"` nos botões secundários.
- **Ilustrações:** `src/art/Art.tsx`. Cada instância prefixa os ids dos gradientes; mantenha isso, ou a web mistura gradientes entre SVGs.
- **Navegação:** `router.dismissTo('/')` para voltar às abas; `replace('/')` empilha uma segunda cópia.
- **Textos** curtos e diretos, sem emoji. Nunca escreva texto de interface direto nos componentes: use `const { t, lang } = useI18n()` e acrescente a chave em `src/i18n/pt.ts`, `en.ts` e `es.ts`. Conteúdo longo vai em `src/data/content/<idioma>.ts`. Plural usa `chave.one` e `chave.many`.
- **Gatilhos de interrupção** são guardados como chave neutra (`notification`, `boredom`, `work`, `habit`, `other`), nunca como texto traduzido.
- **Contas** ficam atrás da interface `CloudBackend` (`src/lib/cloud/types.ts`): o Firebase de verdade e um servidor falso para desenvolvimento. O app nunca pode exigir conta; sem chaves, a Conta some. As variáveis `EXPO_PUBLIC_*` precisam ser escritas por extenso em `config.ts`. Ao mudar o que vai para a nuvem, atualize `snapshot.ts`, os testes e a política de privacidade.
