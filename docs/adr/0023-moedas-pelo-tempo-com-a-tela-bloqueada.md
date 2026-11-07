# ADR-0023 · Moedas pelo tempo com a tela bloqueada, depois do sono mínimo

**Status:** Aceita · **Data:** 2026-11 · **Complementa:** ADR-0002 (moedas só pelo copo), ADR-0007 (uso do sistema)

## Contexto
Até aqui as moedas só vinham de copos, ou seja, a pessoa precisava abrir o app e virar o celular. O módulo `usage-stats` (Android) já lê o tempo de tela ligada por dia, de onde sai o tempo com a tela bloqueada (`lockedMs`). O dono quer pagar também esse tempo, mas dormir não pode render moeda como se fosse esforço.

## Decisão
- **Quanto conta num dia terminado:** `bloqueado − sono mínimo − tempo dos copos do dia`, nunca abaixo de zero (`eligibleMin`, em `src/lib/passive.ts`).
  - **Sono mínimo:** configurável em Ajustes, **6 h por padrão**, de 4 h a 9 h, de meia em meia hora (`settings.sleepMin`). É descontado todo dia, então só o que passa dele rende.
  - **Copos descontados:** o tempo de copo já rende 1 moeda por minuto; não paga duas vezes.
- **Quanto paga:** **1 moeda a cada 10 minutos** (`PASSIVE_MIN_PER_COIN`), no máximo **60 por dia** (`PASSIVE_MAX_COINS_PER_DAY`). A taxa é dez vezes menor que a do copo de propósito: guardar o celular rende, mas o copo continua sendo o jeito de ganhar moeda. Sem bônus de cafeteira, xícara ou pacote.
- **Quando paga:** só **dias terminados**, uma vez por dia e de forma definitiva (`passive.credited`). O pagamento acontece ao abrir o Início com a permissão ativa, olhando os últimos 7 dias que o Android guarda. Hoje não paga (ainda está passando); a tela de Ajustes mostra a estimativa de hoje.
- **Sem retroativo:** o primeiro uso só grava o dia de início (`passive.since`); dias anteriores não rendem, para não cair um monte de moeda de uma vez. Dia sem nenhum dado do sistema não rende.
- **Aviso:** um cartão no Início, "Você ganhou N moedas pelo tempo com o celular bloqueado, depois do seu sono", com botão para dispensar. As moedas passivas **não** viram sessão: não entram em sequência, meta, missões nem histórico de copos.
- **Liga e desliga:** `settings.passiveCoins`, ligado por padrão, mas só faz efeito no Android e com o acesso ao uso autorizado. O cartão de Ajustes (`PassiveSettings`) explica a regra e pede a permissão.
- **Só no aparelho:** nada disso vai para a nuvem; os números de uso continuam locais (ADR-0007). A política de privacidade ganhou a frase de que eles servem para calcular essas moedas.

## Alternativas descartadas
- **Pagar o tempo bloqueado inteiro:** quem dorme 8 h ganharia sem fazer nada, e o app premiaria o oposto da ideia.
- **Detectar o sono pelo horário:** frágil e invasivo; um desconto fixo e configurável é simples e explicável.
- **Pagar o dia de hoje em tempo real:** hoje inclui a noite anterior e muda a cada leitura; pagar só dias fechados evita conta dupla.
- **Taxa igual à do copo:** deixaria o copo sem sentido.

## Consequências
- Os números (taxa, teto, sono padrão) são um palpite de economia e não foram testados com pessoas (ADR-0017); estão em constantes no topo de `src/lib/passive.ts`.
- O primeiro dia com a permissão pode ter leitura parcial do Android e render a mais, limitado pelo teto.
- Quem nunca abre o app por mais de 7 dias perde os dias mais antigos.
- Depende do módulo `usage-stats`, cujo Kotlin nunca foi compilado (ADR-0017).
