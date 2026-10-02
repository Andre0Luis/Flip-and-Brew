# ADR-0007 · Bem-estar mede o que o app registra; uso do sistema é opcional

**Status:** Aceita · **Data:** 2026-10

## Contexto
O protótipo mostrava "42 desbloqueios por dia", mas esses números exigem dados do sistema. Inventar números seria desonesto.

## Decisão
- **Base:** o Bem-estar usa só o que o app registra (copos, interrupções, humor, horários).
  - **Equilíbrio 0 a 100** = 50% meta diária (7 dias) + 30% copos terminados + 20% sequência (14 dias enche a barra). Dia de sequência = pelo menos 10 min offline.
  - **Resumo** (semana, calendário de 4 semanas, maior sessão) e **Padrões** (horários offline, o que interrompe, humor, leitura antifrágil).
- **Opcional, só no Android:** módulo nativo `modules/usage-stats` lê **desbloqueios** (evento `KEYGUARD_HIDDEN`) e **tempo de tela** do dia, com a permissão especial "Acesso ao uso" (`PACKAGE_USAGE_STATS`). O cartão explica antes de pedir. Esses números **ficam no aparelho e não vão para a nuvem**.
- Sem a permissão, ou fora do Android, o cartão some ou só pede.
- O módulo foi recriado a partir do histórico, **corrigindo um erro**: a versão antiga contava "tela ligada" (`SCREEN_INTERACTIVE`) como desbloqueio, o que superestima.

## Alternativas descartadas
- **Mostrar números de exemplo como se fossem reais:** descartado.
- **Usar a API de Bem-estar Digital do Google:** não há API pública para isso.
- **Ler uso por app:** não é necessário e é invasivo.

## Consequências
- O Android guarda só **alguns dias** de eventos, então o histórico do uso do sistema é curto.
- Permissão sensível: exige justificativa na Play Console (ADR-0014).
- **O Kotlin do módulo nunca foi compilado** (ADR-0017). A camada JS degrada com segurança se ele falhar.
