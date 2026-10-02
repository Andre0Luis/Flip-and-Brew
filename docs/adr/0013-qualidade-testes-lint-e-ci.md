# ADR-0013 · Qualidade: regras puras, testes, lint e CI

**Status:** Aceita · **Data:** 2026-10

## Contexto
Não conseguimos rodar o app em aparelho no ambiente de desenvolvimento em nuvem. Para ter confiança, a lógica precisava ser verificável sem aparelho.

## Decisão
- **Regras de negócio em funções puras** em `src/lib` (moedas, qualidade, estatísticas, decisões do motor, snapshot do backup); telas só montam e chamam.
- **Testes com `node:test` + `tsx`** (sem Jest). Cobrem moedas e qualidade, sequência e equilíbrio, leitura antifrágil, decisões do motor, estado (iniciar, encerrar, comprar, migração), uso do sistema, traduções, conteúdo, backup e usuário de teste. São **43** no `main` e **57** com o PR de contas e do usuário de teste (#7).
- **`npm run check`** = typecheck + lint (ESLint com a config do Expo) + testes. O **CI** (`.github/workflows/ci.yml`) roda isso e o bundle do Android.
- Arquivos de teste e `scripts/` ficam fora do `tsc` para não exigir `@types/node`.
- **Verificação visual** pela exportação web, com Playwright e capturas, em claro e escuro, e nos três idiomas.

## Alternativas descartadas
- **Jest com preset do React Native:** configuração pesada para testar lógica pura.
- **Testes de interface ponta a ponta no aparelho:** fora do nosso alcance aqui; ficam no roteiro manual (`docs/VALIDATION.md`).

## Consequências
- Os testes **acharam bugs reais** (leitura antifrágil contando dias vazios; campos `undefined` no backup; `Date.now()` no render); mantenha o hábito de escrever teste junto da regra.
- Passar nos testes **não prova** que o sensor, o segundo plano ou o login funcionam no aparelho.
- Testes na web com relógio falso do Playwright são **instáveis às vezes**; o fluxo foi confirmado em tempo real.
