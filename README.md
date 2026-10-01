# Flip & Brew

App de bem-estar digital em React Native (Expo SDK 56). A pessoa deixa o celular virado para baixo, uma xícara de café vai enchendo em tempo real e o tempo offline vira moedas para a loja de cosméticos. Estoicismo e antifragilidade fazem parte da mensagem do app, não só da decoração.

O código anterior (planta, widget do Z Flip, loja antiga) está no histórico do git, a partir do commit `f056731`.

## Como funciona

1. **Copo.** Na tela Início, virar o celular para baixo por 2 segundos começa um copo na cafeteira escolhida (ou toque em "Começar a passar"). O copo enche em 30 a 75 minutos, conforme a cafeteira.
2. **Tempo.** A contagem usa horários, então continua certa com a tela apagada. Pegar o celular (destravar a tela, reabrir o app ou deixá-lo de tela para cima por 3 segundos) encerra o copo. O sensor só decide depois de calibrado: o Início mostra um cartão de cinco segundos para isso, porque o sentido do eixo z muda de aparelho para aparelho.
3. **Moedas.** Uma por minuto offline, mais 20% de bônus quando o copo enche. Parar cedo rende o proporcional, nunca zero. A qualidade do café vai de Ralo a Encorpado conforme o quanto encheu.
4. **Resultado.** Ao fim, a pessoa registra o que a interrompeu (se parou cedo) e como se sente. Esses registros alimentam a tela Bem-estar.
5. **Loja e coleção.** As moedas compram cafeteiras e xícaras. A Chemex abre com 30 dias de sequência.

Telas: Início (frase do dia, cafeteira, copo), Guia (loja), Bem-estar (equilíbrio, semana, calendário, padrões), Aprender (prática do dia, artigos sobre antifragilidade, estoicismo, hábitos digitais e sono) e Coleção.

## Rodar

```bash
npm install
npx expo run:android      # build de desenvolvimento
npm test                  # lógica de moedas, sequência e estatísticas
npm run typecheck
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
src/data/         catálogo, frases, artigos e práticas
src/engine/       sensor de pose e o motor do copo (iniciar, encerrar, retomar)
src/lib/          regras puras (moedas, qualidade, estatísticas) e seus testes
src/store/        estado (Zustand) persistido com MMKV
src/theme/        cores (claro e torra escura), fontes e ThemeProvider
```

As cores e fontes seguem o style board da fase de design: Young Serif para frases, Figtree para interface e DM Mono para números.

## O que ainda não existe

- **Desbloqueios e tempo de tela do sistema.** O Bem-estar mede só o que o app registra (copos, interrupções, humor). Ler as estatísticas de uso do Android pede um módulo nativo com a permissão `PACKAGE_USAGE_STATS`; o módulo antigo está no histórico.
- **Compra de moedas.** O código usa RevenueCat, mas só liga quando existirem `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (e `..._IOS_KEY`) no build, com produtos cujo identificador termine no número de moedas, como `coins_500`. Sem as chaves, a loja explica que a compra não está ativa.
- **Aviso ao encher o copo.** O copo é contado ao pegar o celular. Notificações foram deixadas de fora de propósito para não interromper quem está offline.
- **Inglês.** Os textos estão em português, direto nos componentes e em `src/data`.
