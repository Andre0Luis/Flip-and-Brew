# ADR-0016 · Fluxo de trabalho: PRs, branches e a lição dos PRs empilhados

**Status:** Aceita · **Data:** 2026-10

## Contexto
O trabalho é feito em sessões com um assistente de código em nuvem, que não tem aparelho Android. O usuário revisa e faz o merge pelo GitHub. Tivemos tropeços de processo que viraram regras.

## Decisão
- **Um branch por entrega**, partindo do `main` atualizado, e **PR em rascunho** com descrição que diz o que foi feito, **como foi verificado** e **o que NÃO foi verificado**.
- **Commits em partes lógicas**, em português, com os trailers de coautoria exigidos pela sessão. Sem force push; sem reescrever histórico já publicado.
- **Não empilhar PRs.** Na primeira vez que empilhamos (#5 sobre #4, #6 sobre #5), o merge dos filhos caiu nos **branches intermediários** e só o #4 chegou ao `main`; precisamos abrir o #7 para levar o resto. Regra: **esperar o PR anterior ser mergeado e partir do `main`**. Se for inevitável empilhar, mergear de baixo para cima e confirmar no `main` que o conteúdo chegou.
- **Antes de editar um PR, conferir se ainda está aberto.** Já sobrescrevemos título e descrição de um PR já mergeado (#1) por não checar; foi restaurado.
- **Ferramentas do ambiente:** `gh pr create` não funciona (usa GraphQL, bloqueado); criar e editar PR pelo REST com `gh api`. Nunca `pkill -f` com um padrão que apareça na própria linha de comando.
- **Segredos nunca no repositório:** `.env`, chaves de conta de serviço e keystores ficam fora do git.
- **Verificar antes de dizer que está pronto:** `npm run check`, bundle do Android, prebuild quando mexe em config nativa, e telas na web com capturas. O que depende de aparelho é registrado como pendência, não como pronto.

## Alternativas descartadas
- **PRs gigantes com tudo junto:** difíceis de revisar.
- **Confiar que o GitHub redireciona PRs empilhados:** só acontece quando o branch base é apagado.

## Consequências
- Mais PRs pequenos e sequenciais, e a descrição de cada um é o relatório de verificação.
- O histórico do `main` fica legível por commits temáticos.
