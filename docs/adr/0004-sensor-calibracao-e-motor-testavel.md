# ADR-0004 · Sensor de pose exige calibração; decisões do motor em funções puras

**Status:** Aceita · **Data:** 2026-10

## Contexto
Para saber se o celular está virado para baixo usamos o acelerômetro (`expo-sensors`). O **sentido do eixo z varia** entre plataformas e aparelhos: em geral, Android dá +1 g com a tela para cima e iOS, o contrário, mas não pudemos confirmar no aparelho do usuário. Se o sinal estiver invertido, virar o celular seria lido como "tela para cima" e o copo seria interrompido sozinho.

## Decisão
- **Calibração obrigatória antes de o sensor decidir.** Até calibrar, o sensor **não** inicia nem encerra copos; o copo só termina ao encher, ao reabrir o app ou pelo botão.
- A calibração (celular deitado, tela para cima, cerca de 1,2 s após uma contagem regressiva) está na introdução, em um cartão no Início e em Ajustes.
- Pose "plana" = |x| e |y| menores que 0,4 g e |z| maior que 0,8 g. Virar para baixo por **2 s** na tela Início inicia um copo; tela para cima por **3 s** (depois de 15 s do início) encerra. Há **30 s** de intervalo antes de um novo início automático.
- O acelerômetro só fica **ligado quando há decisão a tomar** (copo em andamento, ou Início aberto com início automático ativo), por bateria.
- Toda a lógica de decisão mora em `src/lib/engine.ts` (funções puras `decide`, `onReopen`, `poseFromAccel`) com testes. `src/engine/BrewEngine.tsx` só liga sensor, relógio e navegação.

## Alternativas descartadas
- **Confiar no padrão da plataforma sem calibrar:** risco de inversão silenciosa.
- **Sensor de proximidade ou de luz:** `expo-sensors` não expõe proximidade; luz é menos confiável.
- **Detecção só por tela apagada:** não distingue virar de bloquear.

## Consequências
- Um passo extra na primeira abertura, mas sem comportamento errado.
- Limites de tempo e de pose estão cobertos por testes; a **detecção real** ainda precisa de validação no aparelho (`docs/VALIDATION.md`, seção 1).
