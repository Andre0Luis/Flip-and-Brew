# Flip & Brew

App de bem-estar digital em React Native (Expo SDK 56). A pessoa deixa o celular virado para baixo, uma xícara de café vai enchendo em tempo real e o tempo offline vira moedas para a loja de cosméticos. Estoicismo e antifragilidade fazem parte da mensagem do app, não só da decoração.

O código anterior (planta, widget do Z Flip, loja antiga) está no histórico do git, a partir do commit `f056731`.

## Como funciona

1. **Copo.** Na tela Início, virar o celular para baixo por 2 segundos começa um copo na cafeteira escolhida (ou toque em "Começar a passar"). O copo enche em 30 a 75 minutos, conforme a cafeteira.
2. **Tempo.** A contagem usa horários, então continua certa com a tela apagada. Pegar o celular (destravar a tela, reabrir o app ou deixá-lo de tela para cima por 3 segundos) encerra o copo. O sensor só decide depois de calibrado: o Início mostra um cartão de cinco segundos para isso, porque o sentido do eixo z muda de aparelho para aparelho.
3. **Moedas.** Uma por minuto offline, mais 20% de bônus quando o copo enche. Parar cedo rende o proporcional, nunca zero. A qualidade do café vai de Ralo a Encorpado conforme o quanto encheu.
4. **Resultado.** Ao fim, a pessoa registra o que a interrompeu (se parou cedo) e como se sente. Esses registros alimentam a tela Bem-estar.
5. **Loja e coleção.** As moedas compram cafeteiras e xícaras. A Chemex abre com 30 dias de sequência.

Idiomas: português (padrão), inglês e espanhol. A troca fica em **Ajustes > Idioma** e vale para a interface, as frases, os artigos e as práticas.

Telas: Início (frase do dia, cafeteira, copo), Guia (loja), Bem-estar (equilíbrio, semana, calendário, padrões), Aprender (prática do dia, artigos sobre antifragilidade, estoicismo, hábitos digitais e sono) e Coleção.

## Rodar

```bash
npm install
npx expo run:android      # build de desenvolvimento
npm run check             # typecheck, lint e testes (o CI roda o mesmo)
npm test                  # só os testes
```

O app roda também na web (`npm run web`) para ver as telas, mas o sensor de virar o celular só existe no aparelho.

### Testar sem esperar

Em **Ajustes** (ícone de engrenagem no Início):
- "Copos de 1 minuto" faz o fluxo inteiro em um minuto.
- "Carregar 4 semanas de dados de exemplo" preenche o Bem-estar, a Coleção e o calendário com dados fictícios.
- "Calibrar sensor" corrige a detecção de tela para cima ou para baixo se o aparelho se comportar diferente do esperado.

## Estrutura

```
src/app/          rotas (expo-router): (tabs), brew, resultado, artigo/[id], frase/[id], ajustes
src/art/          ilustrações em SVG (xícaras, canecas, cafeteiras, moeda)
src/components/   ui, ícones, gráficos, animações do copo
src/data/         catálogo, frases, artigos e práticas (parte neutra; o texto fica em data/content/<idioma>.ts)
src/i18n/         dicionários pt, en e es, plural, datas e números por idioma
src/engine/       sensor de pose e o motor do copo (liga sensor, relógio e navegação)
modules/          módulo nativo de uso do sistema (Android)
docs/             privacidade, loja, validação no aparelho e lançamento
src/lib/cloud/    conta, backup e sincronização (Firebase, com servidor falso para desenvolvimento)
src/lib/          regras puras (moedas, qualidade, estatísticas, decisões do motor) e seus testes
src/store/        estado (Zustand) persistido com MMKV
src/theme/        cores (claro e torra escura), fontes e ThemeProvider
```

As cores e fontes seguem o style board da fase de design: Young Serif para frases, Figtree para interface e DM Mono para números.

## Primeira abertura e privacidade

- Na primeira abertura o app mostra uma introdução de quatro passos, com escolha de idioma e calibração do sensor. Em Ajustes dá para rever.
- Sem conta, tudo fica no aparelho, sem servidor nem análise. Com conta, o backup do progresso vai para o Firebase. A política está em Ajustes › Política de privacidade e em `docs/PRIVACY.*.md` (gerada pelos mesmos textos do app: `npm run docs:privacy`).
- Ajustes › toque 7 vezes na versão libera as ferramentas de teste (copos de 1 minuto, dados de exemplo, moedas) em qualquer build.

## Uso do sistema (Android)

`modules/usage-stats` é um módulo nativo que lê desbloqueios (`KEYGUARD_HIDDEN`) e tempo de tela do dia. O Bem-estar mostra esses números depois que a pessoa autoriza o “Acesso ao uso”; sem a permissão, o cartão explica e pede. O Android guarda poucos dias de eventos. Só compila no build nativo (`expo run:android`).

## Conta, login e backup (opcional)

O app funciona 100% offline e sem conta. Com as chaves do Firebase no `.env`, aparece **Ajustes › Conta e backup**:
- Cadastro e login com **e-mail e senha** ou com o **Google**, e “esqueci a senha”.
- **Backup na nuvem** (Firestore) do progresso, automático depois de cada copo, com restauração em outro aparelho. Se os dois lados têm dados diferentes, a pessoa escolhe qual manter.
- **Excluir conta**: apaga a conta e o backup, depois de confirmar com a senha ou o Google.

**Manual completo de contas, acessos e credenciais (Expo, Firebase, Google, Play, RevenueCat): `docs/MANUAL-CONFIGURACAO.md`.** Detalhes do Firebase: `docs/FIREBASE.md`. Usuário de teste: `teste@flipandbrew.app` / `Teste@12345` com `EXPO_PUBLIC_AUTH_MODE=mock`, ou `npm run seed:test-user` no Firebase de desenvolvimento. Para ver as telas sem chaves, em desenvolvimento use `EXPO_PUBLIC_AUTH_MODE=mock`.

## Aviso de copo pronto

Opcional, desligado por padrão: uma notificação local e silenciosa quando o copo enche. Fica em Ajustes.

## O que depende de aparelho, conta ou chave

O código está pronto; falta confirmar fora do ambiente de desenvolvimento. O roteiro está em `docs/VALIDATION.md` e o caminho de lançamento em `docs/RELEASE.md`.

- **Sensor de virar o celular, segundo plano e tela apagada:** só no aparelho.
- **Módulo de uso do sistema e notificação:** só no aparelho, depois de compilar.
- **Contas e backup:** ligam quando o `.env` tem as chaves do Firebase e do Google (`docs/FIREBASE.md`); o SHA-1 do build precisa estar cadastrado para o login com o Google.
- **Compra de moedas:** liga com `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (e `..._IOS_KEY`) no build, com produtos cujo identificador termine no número de moedas, como `coins_500`. Sem as chaves, a loja explica que a compra não está ativa.
- **Loja:** textos prontos em `docs/store/`; faltam capturas de tela, hospedar a política de privacidade e o formulário de Segurança dos dados.

## Traduções

- Textos de interface: `src/i18n/pt.ts` é a fonte. `en.ts` e `es.ts` precisam ter as mesmas chaves, e o `npm run typecheck` e os testes acusam chave faltando ou placeholder diferente.
- Plurais: use `t('unit.day', { n })`, com as variantes `chave.one` e `chave.many` no dicionário.
- Conteúdo (frases, artigos, práticas, nomes de itens): `src/data/content/<idioma>.ts`. Os ids são os mesmos em todos os idiomas, então a frase do dia e a prática do dia coincidem.
- As frases são traduções livres feitas para o app, com a fonte citada. Vale revisar o texto de cada idioma com quem fala a língua.
- Para um novo idioma: crie o dicionário e o conteúdo, inclua em `LANGS`, `dictionaries` e `CONTENT`, e em `Language` (`src/store/types.ts`).
