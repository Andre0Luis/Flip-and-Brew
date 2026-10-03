# ADR-0019 · Introdução em três passos e a seção "Por que este app existe"

**Status:** Aceita · **Data:** 2026-10 · **Substitui em parte:** a introdução de quatro passos (ver ADR-0006)

## Contexto
A introdução tinha quatro telas de texto e deixava a ação central (virar o celular) para o fim, como opcional. O tempo da pessoa é o valor do produto, então a entrada tem que respeitar isso. O criador também quis contar por que fez o app.

## Decisão
- **Três passos, em segundos:** (1) a promessa em uma frase, com a escolha de idioma; (2) a **ação central**, em que a calibração de 5 segundos vira o tutorial ("apoie o celular e calibre"), com alternativa para aparelho sem sensor; (3) a **autonomia**: sem conta, conta e backup opcionais, e onde rever a introdução. Pular está disponível em todos os passos e nenhuma tela bloqueia.
- **Moedas e tropeços** saíram da introdução e viraram **dicas de primeira vez** na tela de resultado (uma ao fim do primeiro copo cheio, outra ao fim do primeiro copo interrompido), dispensáveis com um toque (`seenTips`). Quem já tinha copos não as vê.
- **Seção "Por que este app existe"** (`src/app/criador.tsx`): tela própria aberta por Ajustes, com o texto em `src/data/content/<idioma>.ts` (`creator`). O tom é direto e sóbrio; o fim de relacionamento aparece só como "fim de ciclo", com gratidão e sem detalhes.

## Alternativas descartadas
- **Manter os quatro passos:** longos demais para quem abre o app.
- **Pôr a história do criador no fluxo obrigatório:** ninguém pediu; fica opcional.
- **Foto e redes sociais do criador na tela:** fora do lançamento.

## Consequências
- Quem usa o app pela primeira vez precisa de menos de 15 segundos para entrar.
- O texto do criador mexe em dados pessoais do criador: revisar antes de publicar.
