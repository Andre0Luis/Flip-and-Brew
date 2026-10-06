# ADR-0020 · Modo Pomodoro dentro do Início

**Status:** Aceita · **Data:** 2026-10

## Contexto
Um amigo do criador sugeriu um contador Pomodoro. O app já tem o gesto central (virar o celular e o copo enche) e a economia de moedas por tempo offline.

## Decisão
- **Modo, não produto novo:** um seletor "Café | Pomodoro" ao lado do botão de começar no Início (`settings.focusMode`, padrão café). No modo Pomodoro o copo tem **25 min** em vez do tempo da cafeteira; o resto do motor é o mesmo (virar, pegar, retomar, contagem por `startedAt`).
- **Foco vale moeda:** o copo de foco vira uma `Session` com `pomodoro: true`, e conta para moedas, sequência, meta diária e missões como qualquer copo. Interrompido leva o que encheu.
- **Pausa não vale moeda:** é uma `Rest` (`startedAt`, `targetMs`, `long`) guardada no estado, contada por horário como o copo. **5 min**, e **15 min** a cada **4 focos** do dia. Com o celular na mão, não é tempo offline.
- **Pausa na tela Início:** `RestCard` mostra o que falta e, ao acabar, convida a começar o próximo foco. Começar um copo encerra a pausa. A pausa começa pelo botão na tela de resultado do foco.
- **Aviso:** vibração curta se o app estiver aberto, e a notificação silenciosa que já existe (opcional, desligada por padrão) para o fim da pausa. Sem som, para manter a regra de não puxar a pessoa de volta.
- Lógica pura em `src/lib/pomodoro.ts`, com testes.

## Alternativas descartadas
- **Aba própria com histórico de ciclos:** segundo produto dentro do app, mais código e mais textos nos 3 idiomas.
- **Notificação com som:** foge do tom do app e muda a decisão do ADR sobre avisos.

## Consequências
- Quem usa Pomodoro e quem toma café convivem no mesmo botão; a escolha fica guardada no aparelho (não vai para o backup).
- Foco e pausa precisam de validação em aparelho, como o resto do motor (ADR-0017).
