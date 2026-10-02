# ADR-0002 · Mecânica central: um copo que enche enquanto a pessoa fica offline

**Status:** Aceita · **Data:** 2026-09/10

## Contexto
Precisávamos de uma mecânica que recompensasse ficar longe do celular sem castigar quem falha. A planta crescendo era lenta de entender e acoplada ao Z Flip.

## Decisão
Um **híbrido**: extração de café em tempo real (A) mais uma coleção leve de cafeterias e xícaras na prateleira (B).

- A pessoa vira o celular para baixo (ou toca em **Começar a passar**) e escolhe a cafeteira. O **copo enche** em tempo real.
- Tempo para encher: **V60 45 min, prensa francesa 60, moka 30, Chemex 75**.
- **Moedas:** 1 por minuto offline, mais **20% de bônus** quando o copo enche. Começa-se com 100 moedas.
- **Parar cedo rende o proporcional, nunca zero.** Sessões abaixo de 30 s são descartadas (toque acidental).
- **Qualidade** pelo quanto encheu: Ralo (< 35%), Equilibrado (35% a 99%), Encorpado (copo cheio).
- Ao terminar, a pessoa registra **como se sente** (1 a 5) e, se parou cedo, **o que a interrompeu**.
- Itens vêm da loja (ADR-0011); a prateleira cresce com o que ela conquista.

Regras em `src/lib/brew.ts` (funções puras, testadas).

## Alternativas descartadas
- **Só a cafeteira animada, sem coleção** (A pura): menos motivo para voltar.
- **Só coleção, sem tempo real** (B pura): perde a sensação de "o café se faz enquanto eu largo o celular".
- **Zerar o copo ao interromper:** punitivo e contra o princípio do projeto (ADR-0006).
- **Manter a planta.** Ver ADR-0001.

## Consequências
- Cada cafeteira muda o tempo de sessão, então a economia se equilibra por ela.
- O modo de teste "Copos de 1 minuto" existe para validar o fluxo sem esperar (ADR-0015).
- Os números acima ainda não foram testados com pessoas reais; podem ser reajustados (anote um novo ADR se mudar).
