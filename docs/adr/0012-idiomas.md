# ADR-0012 · Idiomas: português padrão, inglês e espanhol

**Status:** Aceita · **Data:** 2026-10

## Contexto
O usuário disse: "o app será em português, mas coloque uma opção para ficar em inglês e espanhol também".

## Decisão
- **Português é o padrão**, em todos os dispositivos. **Não** seguimos o idioma do sistema. A escolha fica em **Ajustes › Idioma** e na introdução.
- **i18n próprio e pequeno** (`src/i18n`), sem biblioteca: `t('chave', { n })` com interpolação `{x}` e plural pelas variantes `chave.one` e `chave.many`.
- **Dicionários tipados:** `pt.ts` é a fonte; `en.ts` e `es.ts` são `Record<keyof typeof pt, string>`. O `tsc` e os testes acusam chave faltando ou **placeholder diferente**.
- **Conteúdo longo** (frases, artigos, práticas, nomes de itens) em `src/data/content/<idioma>.ts`, com **ids neutros** compartilhados. A frase e a prática do dia coincidem em todos os idiomas.
- **Dados guardam chaves neutras**, nunca texto traduzido (por exemplo, gatilhos: `notification`, `boredom`, `work`, `habit`, `other`).
- Datas, iniciais da semana e números usam o idioma escolhido.
- Regra no `CLAUDE.md`: nunca escrever texto de interface direto no componente.

## Alternativas descartadas
- **Seguir o idioma do sistema:** o usuário pediu português como padrão.
- **`i18n-js` ou `react-i18next`:** dependência extra para ~250 chaves; o dicionário tipado dá mais segurança.
- **Traduzir só a interface:** o conteúdo é metade do valor do app.

## Consequências
- **O inglês e o espanhol foram escritos por nós, sem revisão nativa** (ADR-0017).
- Acrescentar um idioma exige o dicionário, o conteúdo e a inclusão em `LANGS`, `dictionaries`, `CONTENT` e no tipo `Language`.
- A política de privacidade é gerada dos mesmos dicionários (ADR-0014).
