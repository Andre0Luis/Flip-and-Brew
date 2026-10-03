# Widgets

Cinco widgets, na tela inicial do Android e do iOS e, no iOS, também na tela de bloqueio.

| Widget | O que mostra | Android (tela inicial) | iOS (tela inicial) | iOS (tela de bloqueio) |
| --- | --- | --- | --- | --- |
| `FlipQuote` | Só a frase do dia | sim | pequeno, médio e grande | retangular e linha |
| `FlipBrew` | O copo em andamento (porcentagem e minutos restantes) | sim | pequeno e médio | circular, retangular e linha |
| `FlipStreak` | Sequência de dias e moedas | sim | pequeno e médio | circular e linha |
| `FlipGoal` | Minutos offline de hoje contra a meta | sim | pequeno e médio | circular, retangular e linha |
| `FlipMissions` | Missões do dia concluídas | sim | pequeno e médio | circular e linha |

## Como funciona
- `src/lib/widgetData.ts` monta um **retrato** de tudo que os widgets mostram, já **traduzido** (os widgets rodam fora do app e não têm o i18n). É uma função pura, com testes.
- `src/lib/widgets.tsx` grava o retrato no armazenamento do app e pede a cada widget que se redesenhe. `src/engine/WidgetSync.tsx` chama isso ao abrir o app, 3 segundos depois de cada mudança do estado e ao voltar para o primeiro plano.
- **Android** usa `react-native-android-widget`: os widgets são desenhados em `src/widgets/android/widgets.tsx` e o sistema chama `widgetTaskHandler` (registrado em `index.ts`) para desenhar sem abrir o app. O progresso do copo é recalculado na hora de desenhar. O sistema só atualiza sozinho a cada 30 minutos no mínimo.
- **iOS** usa `expo-widgets`: os widgets estão em `src/widgets/ios/widgets.tsx`, marcados com a diretiva `'widget'`, e só usam componentes de `@expo/ui/swift-ui`. Para o copo em andamento o app agenda uma linha do tempo de uma entrada a cada 5 minutos, então a porcentagem avança mesmo com o app fechado.
- Tocar em qualquer widget abre o app.

## O que foi verificado e o que não foi
- Verificado: o tipo, os testes do retrato, o bundle de Android e de iOS, e o prebuild do Android (os cinco receptores aparecem no manifesto).
- **Não verificado:** nenhum widget foi visto rodando num aparelho. Precisa de um build nativo novo (`eas build`) e de teste no celular e no iPhone.

## Limites conhecidos
- **Tela de bloqueio no Android:** não há widget de tela de bloqueio na maioria dos aparelhos (só em alguns, como tablets e versões novas do Android); por isso só a tela inicial está coberta.
- **Expo Go:** widgets não existem no Expo Go; só em build de desenvolvimento ou de produção.
- **iOS:** o widget é uma extensão do app e pede o App Group `group.com.andre0luis.FlipAndBrew` e um perfil de provisionamento para a extensão; o EAS cuida disso na primeira build, mas pede a sua conta de desenvolvedor da Apple.
- O widget com os dados de saúde (Health Connect e Apple Saúde) **ainda não existe**: pede permissões novas, módulo nativo e declaração nas lojas.

## Para mudar ou criar um widget
1. Android: crie o componente em `src/widgets/android/widgets.tsx` e acrescente em `WIDGETS` e em `ANDROID_WIDGETS` (`src/lib/widgets.tsx`).
2. iOS: crie o `createWidget` em `src/widgets/ios/widgets.tsx` e atualize o retrato em `syncWidgets`.
3. Declare o widget em `app.json`, nos dois plugins (`expo-widgets` e `react-native-android-widget`), e gere um build novo.
