@AGENTS.md

# Flip & Brew

App Expo (SDK 56) em português. Leia o README para o funcionamento e a estrutura.

- **Antes de codar:** `npm run typecheck && npm test`. Os testes cobrem `src/lib` (moedas, qualidade, estatísticas).
- **Regras de negócio** ficam em `src/lib` como funções puras. Telas só montam e chamam. O estado vive em `src/store/useApp.ts`.
- **Contagem do copo** usa `startedAt` (horário), nunca um contador em memória, porque o app pode ficar em segundo plano.
- **Tema:** use `useTheme()` (`c`, `f`, `r`); não escreva cores nem nomes de fonte soltos nos componentes. Em cartões invertidos (`Card inverse`) use `tone="quietOnDark"` nos botões secundários.
- **Ilustrações:** `src/art/Art.tsx`. Cada instância prefixa os ids dos gradientes; mantenha isso, ou a web mistura gradientes entre SVGs.
- **Navegação:** `router.dismissTo('/')` para voltar às abas; `replace('/')` empilha uma segunda cópia.
- **Textos** em português, curtos e diretos, sem emoji.
