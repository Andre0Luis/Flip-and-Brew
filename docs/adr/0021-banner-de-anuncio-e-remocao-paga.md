# ADR-0021 · Banner de anúncio no fim das telas e compra única para removê-lo

**Status:** Aceita · **Data:** 2026-11 · **Substitui em parte:** ADR-0009 (regra "sem publicidade")

## Contexto
O app foi pensado sem anúncio (ADR-0009) e as lojas diziam "sem anúncios". O dono decidiu monetizar com **um banner**, posto **no fim das páginas** para não atrapalhar o uso, e vender a remoção por **R$ 19,98, para sempre**.

## Decisão
- **Um banner só**, dentro da rolagem, depois do último cartão das abas (Início, Guia, Bem-estar, Aprender, Coleção e Comunidade). Prop `ads` em `Screen`, que renderiza `AdBanner`. **Nunca** em copo, resultado, introdução, conta, ajustes ou privacidade.
- **Rede:** Google AdMob, com `react-native-google-mobile-ads` (módulo nativo: não roda no Expo Go nem na web; ali o banner simplesmente não existe).
- **Discreto:** o banner só aparece depois de carregar (altura zero antes), com o rótulo "Publicidade" e um link "Remover anúncios" que leva a Ajustes. Se falhar, some. Tamanho adaptativo ancorado, de altura limitada.
- **Sem personalização:** `requestNonPersonalizedAdsOnly: true` e classificação máxima PG. Rende menos, mas combina com o app e dispensa a permissão de rastreamento (ATT) no iPhone. Onde a lei exige (EEA/Reino Unido), o consentimento (UMP) é pedido antes de iniciar o SDK.
- **Produto:** `remove_ads`, compra **não consumível** de **R$ 19,98**, vendida direto da loja via RevenueCat (`getProducts`), sem depender de offering. Libera o entitlement `remove_ads`.
- **Quem não vê anúncio:** quem comprou a remoção **ou** tem o Pro. A regra é pura (`proFromCustomerInfo` → `adFree`, em `src/lib/proRules.ts`) e aceita o produto comprado mesmo se o entitlement ainda não foi ligado no painel. Comprar a remoção **não** dá o Pro.
- **Sem configuração, sem anúncio:** os IDs dos blocos vêm de `EXPO_PUBLIC_ADMOB_BANNER_ANDROID` e `_IOS`. Faltando, o build não mostra banner nem a opção de remover. Em desenvolvimento o banner usa só o bloco de teste do Google.
- **IDs de app** (`androidAppId`, `iosAppId` no plugin em `app.json`) começam com os de **exemplo do Google**: o app não quebra, mas só serve anúncio de teste até o dono trocar pelos reais.
- Privacidade: seção nova na política e nas telas (3 idiomas), textos das lojas e Segurança dos dados atualizados.

## Alternativas descartadas
- **Banner fixo sobre a barra de abas:** ocupa a tela o tempo todo, contra a regra de não atrapalhar.
- **Anúncios personalizados com ATT:** mais receita, mais fricção, mais declarações nas lojas.
- **Incluir a remoção só no Pro:** o dono quer um produto separado e mais barato; o Pro também remove, sem custo extra.

## Consequências
- O app deixa de ser "sem anúncios": o discurso das lojas e do material de divulgação mudou. Quem baixou por isso pode estranhar.
- O build exige conta no AdMob, produto nas lojas e variáveis no EAS (ADR-0017, seção "Anúncios").
- Reembolso ou restauração: `Restaurar compras` em Ajustes já recompõe o estado, porque `restorePurchases` devolve o mesmo `CustomerInfo`.
