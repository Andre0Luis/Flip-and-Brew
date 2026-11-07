# ADR-0026 · Commits no padrão Conventional Commits

**Status:** Aceita · **Data:** 2026-11 · **Complementa:** ADR-0016 (fluxo de trabalho e PRs)

## Contexto
O dono pediu que o projeto siga a convenção internacional de mensagens de commit ([Conventional Commits 1.0](https://www.conventionalcommits.org/pt-br/v1.0.0/)). Até aqui as mensagens eram livres.

## Decisão
Formato: `tipo(escopo)!: descrição`, com corpo e rodapé opcionais.

- **Tipos:** `feat` (funcionalidade), `fix` (correção), `docs`, `style` (formatação, sem mudar comportamento), `refactor`, `perf`, `test`, `build` (dependências e empacotamento), `ci` (workflows), `chore` (o resto) e `revert`.
- **Escopo** (opcional, minúsculo): `mobile`, `api`, `shared`, `adr`, `deps`, `vercel`... O que ajudar a achar a mudança.
- **Descrição em português** (a língua do projeto), no presente do indicativo ou imperativo, **começando em minúscula, sem ponto final**; o assunto inteiro tem **até 72 caracteres**.
- **Mudança que quebra compatibilidade:** `!` depois do tipo/escopo e um rodapé `BREAKING CHANGE: ...`.
- **Corpo:** explica o porquê, não o quê. O rodapé `Co-Authored-By: ...` continua quando houver coautoria.
- **Título do PR segue o mesmo formato** (ele vira a mensagem do merge na `main`).
- **Dependabot** usa os prefixos `chore(deps)`, `build(deps)` e `ci(deps)` (`commit-message` no `dependabot.yml`).

Exemplos: `feat(api): adiciona o ranking entre amigos` · `fix(mobile): corrige o contador do copo em segundo plano` · `docs(adr): registra a decisão do ranking` · `ci: separa os workflows por área`.

## Como é conferido
`.github/workflows/commits.yml` roda em todo PR e usa `.github/scripts/conventional-commit.sh` (um script curto, sem ação de terceiros) para validar o **título do PR** e o **assunto de cada commit** (menos os commits de merge, que o git e o GitHub escrevem sozinhos). Vale daqui para frente: o histórico anterior não foi reescrito.

## Alternativas descartadas
- **commitlint:** mais completo, mas traz uma cadeia de dependências para validar uma linha; o script cobre a regra combinada.
- **Reescrever o histórico:** destrói os hashes já publicados e os PRs mesclados.

## Consequências
- Quem escrever um commit ou título fora do padrão vê o PR falhar no check **Commits**. Dá para corrigir o título pela própria página do PR; para um commit, `git commit --amend` ou `git rebase -i` e `git push --force-with-lease` (só em branch próprio).
- Os merges da `main` continuam "Merge pull request #N", cujo título do PR (em padrão) aparece no corpo. Se o dono quiser a `main` toda no padrão, a opção é passar a mesclar com **squash** e usar o título do PR como mensagem (uma configuração do repositório, não feita aqui).
