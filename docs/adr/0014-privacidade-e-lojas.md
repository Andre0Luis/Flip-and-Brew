# ADR-0014 · Privacidade e publicação

**Status:** Aceita · **Data:** 2026-10

## Contexto
O app lê um sensor, pode ler uso do sistema, pode ter conta e pode vender moedas. A Play Store exige política de privacidade, formulário de segurança dos dados e exclusão de conta.

## Decisão
- **Política de privacidade dentro do app** (Ajustes › Política de privacidade) e **gerada dos mesmos textos** em `docs/PRIVACY.{pt,en,es}.md` com `npm run docs:privacy`, para nunca divergirem. Ao mudar o que o app coleta, atualize os textos e rode o gerador.
- Mensagem central: **sem conta, tudo fica no aparelho**; com conta, o backup vai para o Firebase; uso do sistema é opcional e local; o acelerômetro não grava leituras; notificação é local e desligada; a exclusão apaga conta e backup.
- **Exclusão de conta** dentro do app e uma página pública (modelo no PR de contas: `docs/ACCOUNT-DELETION.md`), com e-mail de contato.
- **Fichas da loja** prontas em português, inglês e espanhol (`docs/store/`), e um rascunho das respostas de **Segurança dos dados**.
- **Permissão sensível `PACKAGE_USAGE_STATS`:** declarar com justificativa (painel de bem-estar, só no aparelho, opcional).
- **EAS de produção gera `.aab`**; o pacote é `com.andre0luis.FlipAndBrew`. Chaves de conta de serviço e keystores **nunca vão para o git** (o `.gitignore` bloqueia).
- Passo a passo de contas e credenciais no manual de configuração (PR de contas e usuário de teste: `docs/MANUAL-CONFIGURACAO.md`).

## Alternativas descartadas
- **Política escrita à mão em um arquivo à parte:** divergiria do app.
- **Coletar análise "para melhorar o produto":** contraria o princípio de privacidade.

## Consequências
- Os textos jurídicos **não passaram por advogado**; são descrições fiéis do comportamento do app.
- Faltam a hospedagem pública da política e da página de exclusão, as capturas de tela e as imagens da loja (ADR-0017).
- Contas pessoais novas na Play Console costumam exigir teste fechado antes da produção; confira a regra vigente.
