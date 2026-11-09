# ADR-0029 · Tempo de tela no iPhone pelo Tempo de Uso

**Status:** Aceita · **Data:** 2026-11 · **Complementa:** ADR-0007 (uso do sistema), ADR-0023 (moedas pelo tempo bloqueado)

## Contexto
No Android, o módulo `usage-stats` lê desbloqueios, bloqueios e tempo de tela com o acesso ao uso, e o ADR-0023 paga moedas pelo tempo com a tela bloqueada. No iPhone isso não existia. A Apple aprovou o entitlement **Family Controls (Distribution)** para a conta do dono em 2026-11-08, o que libera as APIs de Tempo de Uso (Family Controls, Device Activity) fora do modo de desenvolvimento.

A Apple não entrega números de uso ao app. O relatório de uso (Device Activity Report) desenha os dados numa extensão isolada que não os repassa. O que sobra é o **monitor** (Device Activity Monitor): uma extensão que o sistema chama quando o uso de um conjunto de apps atinge um limite definido pelo app.

## Decisão
- **Estimativa por limites.** O app liga um monitor diário (00:00 a 23:59, repetindo) com um evento por limite de uso: de 15 em 15 minutos até 8 h, depois de 30 em 30 até 16 h (48 eventos). A extensão `targets/screen-time` grava no App Group o maior limite atingido em cada dia. Esse número é o tempo de tela do dia, arredondado para baixo.
- **Mesma interface do Android.** O módulo `usage-stats` ganhou a parte iOS (`modules/usage-stats/ios`), com as mesmas funções. `getDailyUsage` devolve um dia por entrada, com `unlocks` e `locks` em zero e `tracked: true` quando o monitor acompanhou o dia (assim um dia com zero minutos de tela ainda rende). O resto do app (painel de Bem-estar, `src/lib/passive.ts`, primeiros passos) não muda de regra.
- **Sem desbloqueios no iPhone.** O módulo exporta `countsUnlocks = false`; a tela esconde desbloqueios e bloqueios e explica que o tempo de tela é estimado.
- **O que conta como tela.** A autorização é individual (`.individual`, do próprio dono do aparelho). Depois dela, a lista do sistema (`FamilyActivityPicker`) abre para a pessoa escolher o que conta; os textos pedem "Todos os Apps e Categorias". A escolha fica guardada no App Group, para refazer o monitor.
- **Regra de moedas igual à do ADR-0023.** Mesma taxa, mesmo teto, mesmo sono mínimo, só dias terminados.
- **Proteções na extensão.** Um limite maior que o tempo já passado no dia é ignorado: cobre aviso atrasado da véspera entregue depois da meia-noite e disparos adiantados que o fórum da Apple relata no iOS 26. No iOS 17.4 ou mais novo, os eventos contam o uso de hoje anterior ao monitor (`includesPastActivity`), para o primeiro dia não sair zerado.
- **Só no aparelho.** O tempo de tela estimado não sai do iPhone, como no Android (ADR-0007). A política de privacidade cita o Tempo de Uso.
- **Construção.** A extensão é criada pelo `@bacons/apple-targets` (pasta `targets/screen-time`), com o entitlement `com.apple.developer.family-controls` e o mesmo App Group dos widgets (`group.<bundle id>`). O app também leva o entitlement.

## Alternativas descartadas
- **Device Activity Report:** mostra o uso real, mas os números ficam presos na extensão; o app não consegue calcular moedas com eles.
- **Medir pelo próprio app em segundo plano:** o iOS não deixa o app acordar para isso, e não há evento de tela ligada ou bloqueada para apps.
- **Limites de minuto em minuto:** centenas de eventos por dia, sem ganho real para uma moeda que vale 10 minutos.
- **Monitorar só alguns apps:** mede menos tela do que existe e paga moeda a mais.

## Consequências
- A estimativa erra para baixo em até 15 minutos (30 depois de 8 h) de tela, ou seja, paga no máximo 1 a 3 moedas a mais por dia, dentro do teto.
- Se a pessoa escolher só alguns apps, o tempo de tela sai menor e o tempo bloqueado, maior. Os textos pedem tudo; a conta continua limitada pelo teto de 60 por dia.
- Relatos no fórum da Apple falam de limites disparando cedo demais em algumas versões do iOS. Isso aumenta o tempo de tela estimado e diminui as moedas, o lado seguro para a economia do app.
- O simulador não roda Family Controls: só dá para testar num iPhone de verdade. Cada build de iOS agora tem mais uma extensão (`ScreenTimeMonitor`), cujo identificador também precisa da capacidade Family Controls no portal da Apple; o EAS tenta sincronizar isso no build.
- Nada disso foi testado em aparelho ainda (ADR-0017).
