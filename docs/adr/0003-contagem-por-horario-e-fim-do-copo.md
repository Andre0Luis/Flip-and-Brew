# ADR-0003 · Contar por horário e encerrar o copo ao pegar o celular

**Status:** Aceita · **Data:** 2026-10

## Contexto
Com o celular virado para baixo, a tela apaga e o Android pode suspender o JavaScript do app. Um contador em memória (`setInterval`) perderia o tempo.

## Decisão
- A sessão guarda `startedAt` e `targetMs` no estado persistido. O tempo decorrido é **sempre calculado a partir do horário**, nunca acumulado.
- O copo **termina** quando passa `startedAt + targetMs`.
- **Pegar o celular encerra o copo:** destravar a tela ou reabrir o app (evento `AppState` para `active`) conta como pegada. Há **15 s de tolerância** depois de iniciar, para a pessoa pousar o celular.
- Se o app for fechado e reaberto no meio de um copo, ele **retoma**: encerra com o tempo certo, ou volta para a tela do copo se foi logo após iniciar.
- Com o celular ligado e de tela para cima por 3 s (depois da tolerância), o sensor também encerra (ADR-0004).
- O botão voltar do Android não sai da tela do copo nem do resultado.

## Alternativas descartadas
- **Contador em memória:** perde tempo em segundo plano.
- **Serviço em primeiro plano (notificação fixa) para manter o app vivo:** pesado, intrusivo e contra a ideia de ficar offline.
- **Notificação ao encher como parte do fluxo:** interrompe quem está offline. Virou opção desligada por padrão (ADR-0015).

## Consequências
- O tempo está certo mesmo se o sistema matar o app.
- O encerramento só é percebido quando a pessoa **pega** o celular; o copo cheio aparece nesse momento.
- Comportamento com tela apagada e app em segundo plano **depende do Android e ainda não foi validado em aparelho** (ADR-0017).
