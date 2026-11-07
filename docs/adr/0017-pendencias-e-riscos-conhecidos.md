# ADR-0017 · Pendências e riscos conhecidos

**Status:** Aberto (atualize sempre que algo for resolvido ou surgir) · **Última revisão:** 2026-11-07

Este arquivo é a **lista viva do que ainda não está pronto ou verificado**. Quando algo for resolvido, risque aqui e, se mudar uma decisão, escreva um ADR novo.

## Nunca rodou em aparelho (maior risco)
- [ ] **Sensor de virar o celular** (calibração, início automático, encerramento ao pegar). Ver `docs/VALIDATION.md`, seção 1.
- [ ] **Contagem com tela apagada e app em segundo plano.** Depende do comportamento do Android.
- [ ] **Módulo nativo `usage-stats`:** o **Kotlin nunca foi compilado**. O primeiro `npx expo run:android` pode apontar erro de compilação.
- [ ] Notificação silenciosa, haptics e fluidez das animações.
- [ ] **Login com Google** no aparelho (depende do SHA-1 certo; erro típico `DEVELOPER_ERROR`).

## Depende de conta, chave ou console (só o dono do projeto faz)
- [ ] Projetos Firebase (desenvolvimento e produção), logins ligados, Firestore criado e **regras publicadas**.
- [ ] `.env` preenchido (Firebase e Google) e variáveis cadastradas no EAS.
- [ ] Cliente OAuth Android do Google com pacote e **SHA-1 de cada build** (debug, EAS, Play).
- [ ] Usuário de teste no Firebase real (`npm run seed:test-user`, num projeto de desenvolvimento).
- [ ] RevenueCat e produtos `coins_N` no Play Console, se for vender moedas.
- [ ] Play Console: conta, ficha, formulários, teste interno e fechado.
- [ ] Hospedar a política de privacidade e a página de exclusão de conta; trocar o e-mail de contato no modelo.
- [ ] Capturas de tela do aparelho, ícone 512×512 e imagem de destaque da loja.

## Decisões de produto em aberto
- [ ] **Validação das moedas compradas em servidor** (webhook do RevenueCat gravando no Firestore) antes de vender de verdade.
- [ ] **Duas contas no mesmo aparelho:** os dados locais da primeira podem subir para a segunda quando ela não tem backup. Hoje é o comportamento simples.
- [ ] **App Check** do Firebase para produção.
- [ ] Equilíbrio da economia (tempos, preços, bônus) **não foi testado com pessoas**.
- [ ] Restringir a `apiKey` do Firebase por pacote e SHA-1.

## Conteúdo e qualidade
- [ ] **Revisão nativa do inglês e do espanhol** (interface, frases e artigos).
- [ ] **Revisão do conteúdo**, sobretudo o de sono, e das atribuições das frases.
- [ ] Textos de privacidade e de loja **sem revisão jurídica**.
- [ ] Regras do Firestore **não rodaram no emulador**.
- [ ] Contraste e acessibilidade checados só visualmente; falta TalkBack em aparelho.

- [ ] Faixas do desconto (30% check-in + 20% offline) e os preços novos **não foram testados com pessoas** (ADR-0018).
- [ ] Telefone e idade do perfil entram no formulário de Segurança dos dados da Play Store e na revisão da política de privacidade (ADR-0018).
- [x] **Série Cores da Torcida:** só referências de cores, sem nomes nem escudos de clubes (decisão do dono, ADR-0018).
- [x] Código do **Entrar com a Apple**, da redefinição de senha, da confirmação de e-mail e da troca de senha pronto (docs/FIREBASE.md); falta configurar a Apple e o Firebase e testar em aparelho.
- [ ] **App Store (iOS):** oferecer login com o Google exige também oferecer "Entrar com a Apple" (diretriz 4.8) ou ficar só com e-mail e senha; a exclusão de conta já pode ser iniciada em Ajustes (requisito da Apple, diretriz 5.1.1(v)).
- [x] Seção de café em Aprender, widgets de tela inicial e de bloqueio (docs/WIDGETS.md), comunidade em "em breve" (docs/COMUNIDADE.md) e introdução em três passos feitos.
- [ ] **Widgets nunca rodaram num aparelho**; precisam de build novo e teste no Android e no iOS.
- [ ] **Dados de saúde** (Health Connect e Apple Saúde) no widget e no Bem-estar: ainda não existem.

- [ ] **Moedas pelo tempo bloqueado** (ADR-0023): o Kotlin de `usage-stats` nunca foi compilado e a conta depende dele; taxa (1 moeda a cada 10 min), teto (60 por dia) e sono padrão (6 h) **não foram testados com pessoas** nem em aparelho. Dia com leitura parcial do Android (primeiro dia após a permissão) pode render a mais, limitado pelo teto.
- [ ] **Lembretes diários** (ADR-0022): horários, canal silencioso, toque abrindo o Início, reagendamento ao reabrir e depois de reiniciar o celular não foram validados em aparelho. Acima de 14 dias sem abrir o app, os avisos acabam.
## Anúncios e remoção paga (ADR-0021)
- [ ] **Conta no AdMob:** criar o app Android e o iOS, os blocos de banner, e trocar os IDs de teste do Google em `app.json` (`androidAppId`, `iosAppId`) pelos reais. Sem isso o banner só mostra anúncio de teste.
- [ ] Variáveis `EXPO_PUBLIC_ADMOB_BANNER_ANDROID` e `EXPO_PUBLIC_ADMOB_BANNER_IOS` no EAS (`preview` e `production`). Sem elas o build não mostra banner nem a opção de remover.
- [ ] **Produto `remove_ads`** (não consumível, R$ 19,98) no Play Console e no App Store Connect, entitlement `remove_ads` no RevenueCat. Conferir se o preço existe na grade da Apple.
- [ ] **Mensagem de consentimento (UMP)** criada no AdMob (Privacidade e mensagens); sem ela o formulário não aparece onde a lei exige.
- [ ] Play Console: declarar que o app tem anúncios e o **ID de publicidade**; formulário Segurança dos dados; App Store: rótulos de privacidade e, se mudar para anúncios personalizados, ATT.
- [ ] Banner e compra **nunca rodaram em aparelho**; precisam de build novo (módulo nativo, não roda no Expo Go).
- [ ] Textos antigos "sem anúncios": a apresentação em JPG (`store-assets/`, só local) precisa ser refeita.

## Dívidas técnicas
- [ ] O histórico de uso do sistema é curto (o Android guarda poucos dias).
- [ ] Testes de interface automatizados no aparelho não existem; só o roteiro manual.
- [ ] Hoje o backup limita-se às 1500 sessões mais recentes.

## Já resolvido (para memória)
- [ ] **Escurecer a tela durante o copo** (`src/lib/brightness.ts`, ajuste opcional, desligado por padrão): não validado em aparelho. No iPhone muda o brilho do sistema e o valor anterior fica guardado em disco para restaurar após fechamento forçado.
- [ ] **Compras no iPhone** (RevenueCat): falta o `.p8` de In-App Purchase no painel, os produtos `coins_*` no App Store Connect e o primeiro build de iOS pelo EAS.
- [ ] **Login com Google no iPhone** não está configurado (cliente OAuth iOS e `iosUrlScheme`).
- [ ] **Workflow `eas-build.yml`** falha por falta do segredo `EXPO_TOKEN` no GitHub.
- [ ] **Capturas das lojas** (`docs/store/screenshots.md`) são simuladas pela versão web; na aba Coleção em inglês, o rótulo "Achievements" encosta na borda em telas de 360 px.
- [ ] **Modo Pomodoro** (ADR-0020): foco de 25 min, pausa de 5 (15 a cada 4 focos) e aviso de fim da pausa não foram validados em aparelho.
- [x] Reinício do projeto, mecânica nova, visual novo.
- [x] Idiomas pt, en e es com dicionários tipados.
- [x] Contas, backup, exclusão e servidor falso.
- [x] Usuário de teste e manual de configuração.
- [x] Testes, lint e CI.
