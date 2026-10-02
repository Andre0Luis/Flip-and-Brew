# ADR-0006 · Estoicismo e antifragilidade como parte do produto

**Status:** Aceita · **Data:** 2026-10

## Contexto
O usuário quer que a filosofia seja a mensagem do app, não decoração: ficar offline como abstenção voluntária (Sêneca, Epicteto, Marco Aurélio) e a falha como algo que fortalece (Taleb).

## Decisão
- **Frase do dia** no topo do Início (carrossel). Tocar abre uma página com contexto e sugestões práticas.
- **Aba Aprender:** prática do dia (curta, sem tela, +5 moedas), série de 7 dias e **9 artigos** (antifragilidade, estoicismo, hábitos digitais, sono). Marcar como lido dá +2 moedas, uma vez.
- **A falha é dado, não castigo**, e isso aparece no desenho do produto: copo interrompido rende o proporcional; dia perdido pausa a sequência sem apagar a prateleira; o resultado pergunta o motivo da interrupção; o Bem-estar traz uma **leitura antifrágil** (comparação do dia seguinte a uma falha com a média).
- **Frases são traduções livres com a fonte citada** (obra e número) e um aviso na tela. Só entram frases cuja atribuição é bem estabelecida. Taleb aparece com a frase "Wind extinguishes a candle and energizes fire" (em português: "O vento apaga a vela e alimenta o fogo").
- **Tom:** calmo, específico, sem culpa, sem emoji.

## Alternativas descartadas
- **Citações soltas como enfeite:** contraria o pedido.
- **Frases populares de atribuição duvidosa:** descartadas para não atribuir errado.
- **Conteúdo gerado dinamicamente:** o conteúdo é estático e revisável.

## Consequências
- Os artigos e as traduções foram **escritos por nós, sem revisão de especialista**. O de sono usa linguagem prudente e **precisa de revisão** antes de publicar (ADR-0017).
- A frase e a prática do dia são as mesmas em todos os idiomas.
