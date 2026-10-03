# ADR-0011 · Economia de moedas, compra com RevenueCat e itens

**Status:** Aceita; preços e itens substituídos em parte pelo [ADR-0018](0018-checkin-perfil-cafeteiras-e-descontos.md) · **Data:** 2026-10

## Contexto
A loja usa moedas ganhas offline. O usuário quer manter compra de moedas por dinheiro (IAP) e cosméticos. O código antigo tinha um **mock que concedia moedas de graça**.

## Decisão
- **Moedas** vêm de ficar offline (ADR-0002) e de práticas e leituras (+5 e +2). Há 100 moedas iniciais. O bônus de login diário da versão antiga **não existe mais**.
- **Itens (cosméticos, sem vantagem de jogo além do tempo da cafeteira):**
  - Cafeteiras: V60 (inicial), prensa francesa 300, moka 600, **Chemex abre com 30 dias de sequência**.
  - Xícaras: porcelana (inicial), espresso 200, caneca âmbar 150, caneca petróleo 150, copo de latte 250.
  - **Coleção Estoica** (Epicteto, Sêneca, Marco Aurélio): 350 cada, **por moedas**, agrupada no Guia.
- **Compra de moedas com RevenueCat**, ligada **só quando há chave** (`EXPO_PUBLIC_REVENUECAT_*`). Sem a chave, a loja explica que a compra não está ativa. Os produtos têm identificadores que **terminam no número de moedas** (`coins_500`).
- **O mock que dava moedas de graça foi removido.**

## Alternativas descartadas
- **Mock de compra no app:** poderia chegar a usuários reais.
- **Coleção Estoica como compra em dinheiro (como no protótipo):** adiada; dependia da loja.
- **Itens que aumentam ganho de moedas:** quebraria o equilíbrio do tempo offline.

## Consequências
- **As moedas compradas são creditadas no aparelho, sem validação em servidor.** Antes de vender de verdade, vale um webhook do RevenueCat gravando o crédito no Firestore (ADR-0017).
- Preços e ganhos não foram testados com pessoas reais.
- Ferramentas de teste (50 mil moedas) existem só atrás do toque escondido (ADR-0015).
