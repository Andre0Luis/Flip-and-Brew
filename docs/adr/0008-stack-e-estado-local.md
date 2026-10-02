# ADR-0008 · Stack: Expo, expo-router, Zustand com MMKV, SVG e React Compiler

**Status:** Aceita · **Data:** 2026-10

## Contexto
O projeto já era Expo (SDK 56, React Native 0.85, React 19). O `AGENTS.md` avisa que o Expo mudou e manda ler a documentação da versão. Precisamos de armazenamento local rápido e síncrono (o tempo do copo é lido o tempo todo) e de ilustrações vetoriais.

## Decisão
- **Expo SDK 56 com build nativo** (`expo run:android`), porque há módulos nativos (sensor, uso do sistema, notificações, Google Sign-In). Não roda no Expo Go.
- **expo-router** com rotas por arquivo e **rotas tipadas**. Abas com `Tabs` de `expo-router/js-tabs` e uma barra própria; `Stack.Protected` mostra só a introdução até ela ser concluída.
- **Zustand + persist sobre MMKV** (`src/store/useApp.ts`). Na web ou sem o módulo, cai para `localStorage` e depois para memória. O estado é versionado (v1 base, v2 gatilhos como chave e idioma, v3 introdução vista) com `migrate`.
- **react-native-svg** para toda a arte e os gráficos; **Reanimated 4** para o copo, o anel e o vapor.
- **Fontes** pelos pacotes `@expo-google-fonts/*` (Young Serif, Figtree, DM Mono), embutidas no app.
- **React Compiler ligado.** O lint (`react-hooks/purity`) barra `Date.now()` direto no render; use `useNow()` ou inicializador preguiçoso.
- **Web existe só para ver as telas** (`expo export --platform web`, saída `single`). Não é plataforma-alvo.

## Alternativas descartadas
- **AsyncStorage:** assíncrono, pior para leituras frequentes.
- **Redux ou Context puro:** Zustand dá menos código para o mesmo resultado.
- **Imagens PNG para a arte:** não escalam, não seguem tema e o usuário quer arte própria (ADR-0005).
- **Expo Go:** incompatível com os módulos nativos.

## Consequências
- Todo build para o aparelho precisa do ambiente Android (Android Studio ou SDK e JDK).
- Na web o MMKV guarda a chave com prefixo (`flip-and-brew\flip-and-brew-v2`); testes automatizados na web precisam usar essa chave.
- Mudar o formato persistido exige subir a versão do `persist` e escrever `migrate`.
- Dependências sem uso foram removidas (`@expo/ui`, `expo-glass-effect`, `expo-symbols`, `expo-image`, `expo-device`, `expo-web-browser`, `expo-localization`).
