# ADR-0001 · Reiniciar o projeto do zero

**Status:** Aceita · **Data:** 2026-09/10

## Contexto
A primeira versão era acoplada a um aparelho (Z Flip 7): sensor de dobradiça, widget de tela externa, contagem de aberturas. A mecânica da planta (estágios de crescimento) não combinava com a nova ideia de extração em tempo real. A paleta e as ilustrações antigas também não agradavam.

## Decisão
Apagar o código, os assets e os documentos antigos e reconstruir sobre um esqueleto Expo mínimo. Primeiro uma fase de limpeza (remover planta, `flip-sensor`, widget e `react-native-android-widget`), depois a remoção de todo o resto. O histórico continua no git a partir do commit `f056731`.

Mantidos: configuração do Expo e EAS, identificadores do app, ícones (depois substituídos).

## Alternativas descartadas
- **Refatorar em cima do código antigo.** Custaria mais que recomeçar, porque a store, as telas e a arte giravam em torno da planta.
- **Manter o widget e o sensor de dobradiça como opcionais.** Só valiam para um aparelho que o usuário deixou de usar.

## Consequências
- Código novo e limpo, com a arquitetura pensada para testes.
- O módulo nativo de uso do sistema foi **recriado** a partir do histórico (ADR-0007), em vez de mantido de ponta a ponta.
- Quem quiser ver a ideia antiga precisa olhar o histórico (`f056731`).
