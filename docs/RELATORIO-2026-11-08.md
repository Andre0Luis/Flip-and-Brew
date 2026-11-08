# Relatório da noite · 7 para 8 de novembro de 2026

Pedido do André antes de dormir: terminar a comunidade (posts com fotos, curtidas, comentários, avisos e ranking), ajustar a introdução para o app só liberar depois do cadastro, criar um tutorial interativo, mesclar tudo, gerar builds e submits de Android e iOS, testar com capturas e documentar. Liberdade para até 3 funcionalidades novas.

## Resumo

Tudo o que foi pedido está na `main`, com testes. A comunidade completa (amigos, posts com até 3 fotos, curtidas, comentários, avisos e ranking) está pronta no app e na API. A API nova já está em produção. **Falta um passo seu para os posts funcionarem: aplicar a migração do banco** (seção "O que depende de você").

## Checklist

### Mesclado na `main` (12 PRs, CI verde em todos)
- [x] #72 Anúncios na tela de moedas e pacotes em ordem
- [x] #73 Coleção dentro da Guia e Conquistas no Bem-estar
- [x] #74 Ferramentas de teste só para o admin, decidido pelo servidor (o e-mail não vai dentro do app)
- [x] #75 Pomodoro: botão "Começar foco", logo abaixo da escolha do modo
- [x] #76 Coleção: cartão "Equipamento em uso" (cafeteira, xícara e café ativos)
- [x] #77 Login obrigatório com o backend próprio, primeiros passos e lembretes ligados por padrão
- [x] #78 Perfil no topo: foto da galeria ou 5 avatares, primeiro nome e emoji do café
- [x] #79 Comunidade, fase 1: apelido (o nome vem da conta), busca, pedidos, amigos e perfil público
- [x] #80 API: posts com fotos, curtidas, comentários, avisos e ranking semanal
- [x] #81 App: feed, novo post, comentários, avisos (sino) e aba de ranking
- [x] #82 Introdução leva ao cadastro e tutorial interativo
- [x] #83 Compartilhar o copo, convidar amigos e meta da semana (as 3 funcionalidades da liberdade criativa)

### Builds e submits
- [x] Android, versionCode 11 (produção, AAB): build `2bdf34e1-f768-479c-9333-9b01830c46fa`
- [x] iOS, build 7 (produção): build `061ba473-aaf0-4aa3-90ec-127352a89872`
- [x] Submit iOS: enviado ao App Store Connect (submissão `64ea6fd6-f3bb-4ec1-aba5-cb52de120a04`); aparece no TestFlight depois do processamento da Apple
- [ ] Submit Android: o EAS não tem a chave da conta de serviço do Google Play e ela não pode ser criada em modo não interativo (veja "O que depende de você")

### Documentação
- [x] Apresentação em PDF, no formato de paper (12 páginas, prints reais do Android): quem faz, proposta, tutorial, mecânica, princípios, tecnologia, estado atual e "Apoie o projeto". Entregue à parte, fora do repositório.
- [x] Pesquisa sobre métricas de uso no iPhone (seção própria abaixo)

### Testado no celular (Android, build de desenvolvimento ligado ao backend de produção)
- [x] Chip de perfil no topo, tela de perfil com os 5 avatares
- [x] Comunidade: pede o apelido com o nome da conta; abas Feed, Amigos e Ranking; sino; convite
- [x] Cadastro, login com Google e exclusão de conta de ponta a ponta (usuário e perfil criados e apagados no banco)
- [x] Pacotes de moedas carregando do RevenueCat no Android
- [x] Tutorial (5 passos), primeiros passos, botão do Pomodoro, equipamento em uso, meta da semana
- [ ] Posts, curtidas, comentários e ranking em produção: dependem da migração 0004

## O que depende de você
1. **Migração do banco:** `cd apps/api && npm run db:migrate`. Cria as tabelas de posts, fotos, curtidas, comentários, avisos e ranking (migração `0004`). Sem ela, o feed e o ranking respondem erro.
2. **Build com a comunidade para as lojas:** os builds de produção usam o ambiente `production` do EAS, que **não tem** as variáveis do backend próprio. Por isso a versão das lojas continua no Firebase (sem login obrigatório e com a comunidade em "em breve"), o que bate com a política de privacidade atual. Para ligar a comunidade nas lojas:
   - atualizar a política de privacidade (hoje diz que o backup fica no Firebase; passa a citar Supabase, Vercel, posts e fotos) e os textos "funciona sem conta" das lojas;
   - criar uma conta de teste para os revisores da Apple e do Google;
   - no iPhone, oferecer "Entrar com a Apple" (diretriz 4.8, porque há login com o Google);
   - cadastrar `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no ambiente `production` do EAS e gerar outro build.
3. **E-mail:** a confirmação de e-mail do Supabase está desligada (decisão sua). Antes de abrir para muita gente, ligue de novo junto com o SMTP da Brevo.
4. **Play Console:** criar o produto `remove_ads` (o app o procura e a Play responde que não existe).
5. **Submit Android:** subir o AAB do versionCode 11 à mão no Play Console (baixe pela página do build no Expo), ou criar uma conta de serviço no Google Cloud com acesso ao Play Console e enviar a chave JSON pelo painel do EAS (Credentials, Android, Google Service Account). Com a chave no EAS, `eas submit -p android` passa a funcionar sozinho.
6. **Métricas de uso no iPhone:** se quiser, pedir o entitlement Family Controls (detalhes abaixo). Só o titular da conta de desenvolvedor pode pedir.
7. **Vercel:** o plano gratuito tem limite diário de deploys; numa noite de muitos PRs ele estourou ("retry in 24 hours"). Não houve perda: o deploy seguinte publicou a API nova.

## Detalhes técnicos

### Comunidade (API, `apps/api`)
- **Tabelas novas (migração 0004):** `posts`, `post_images`, `post_likes`, `post_comments`, `notifications`, `weekly_stats`. RLS ligada em todas e privilégios dos papéis `anon` e `authenticated` retirados, como na 0003.
- **Visibilidade:** um post só aparece para o autor e para os amigos dele; bloqueio esconde posts, comentários, avisos e ranking.
- **Fotos:** Supabase Storage, balde privado `posts` (criado sozinho; só JPEG, até 2 MB). O app pede links de envio (`POST /v1/posts/uploads`, até 3, no caminho `<id>/<uuid>.jpg`), envia com PUT e cria o post com os caminhos; a leitura sai em links assinados de 1 hora. Apagar o post ou a conta remove os arquivos.
- **Avisos:** curtir e comentar avisam o autor; descurtir apaga o aviso não lido.
- **Ranking:** o app envia os minutos offline e os copos da semana ISO (`PUT /v1/me/week`, só a semana atual); o ranking de amigos mostra todos, o geral só quem ligou a opção.
- **Testes:** 82 na API, incluindo um teste de contrato que roda o cliente do app contra a API de verdade em todo o fluxo da comunidade.

### Comunidade (app, `apps/mobile`)
- Abas **Feed, Amigos e Ranking** e um sino com contador.
- **Novo post:** até 3 fotos, reduzidas para 1280 px no lado maior e gravadas em JPEG 70% no aparelho (`expo-image-manipulator`); uma foto de 4 a 8 MB vira algumas centenas de KB.
- Curtir muda na hora e desfaz se o servidor recusar.
- O nome na comunidade vem da conta (perfil do app ou nome do Google); o cadastro pede só o apelido.

### Login obrigatório (ADR-0028)
- Com o backend próprio ligado: introdução, entrar ou criar conta, primeiros passos e o app. Sem ele, a conta continua opcional.
- A decisão é uma função pura (`src/lib/loginGate.ts`) com testes.
- A introdução, com o backend ligado, termina em "Criar minha conta".
- Primeiros passos: permissão de notificações (os lembretes da manhã e do check-in vêm ligados) e passo a passo para ligar o acesso ao uso e ganhar moedas com a tela bloqueada.

### Outras mudanças
- **Admin pelo servidor:** as ferramentas de teste só aparecem para quem o servidor marca como admin (`ADMIN_EMAILS` na Vercel). Nenhum e-mail vai dentro do app.
- **Perfil no topo:** chip com foto (galeria, copiada para a pasta do app, fora do backup) ou um de 5 avatares desenhados, primeiro nome e emoji do método de café.
- **Tutorial interativo:** 5 balões no Início; Ajustes, Rever o tutorial.
- **Liberdade criativa:** compartilhar o copo, convidar amigos e meta da semana.
- **Módulos nativos novos:** `expo-image-picker` e `expo-image-manipulator` (exigem build novo; os builds desta noite já os incluem).

### Métricas de uso no iPhone (pesquisa)
- No Android, o módulo `modules/usage-stats` lê desbloqueios, bloqueios e tempo de tela com a permissão de acesso ao uso. No iPhone, o equivalente são as APIs de Tempo de Uso: Family Controls, Device Activity e Managed Settings.
- **O que pedir:** o entitlement `com.apple.developer.family-controls` para distribuição, no formulário [Family Controls distribution](https://developer.apple.com/contact/request/family-controls-distribution) ou na aba Capability Requests do portal. O pedido precisa ser repetido para cada extensão de Tempo de Uso (Device Activity Monitor, Device Activity Report). Em desenvolvimento funciona sem aprovação; TestFlight e App Store só depois dela. Relatos no fórum da Apple falam em semanas de espera.
- **O limite:** a Apple não entrega os números ao app. O relatório de uso é desenhado por uma extensão isolada, que mostra os dados na tela mas não os passa ao app nem a um servidor. Não há contagem de desbloqueios. O caminho viável é a extensão de monitor avisar quando o uso passa de limites definidos (por exemplo, a cada 15 minutos), o que dá uma estimativa de tempo de tela para calcular moedas, sem igualar o Android. Isso também exige um módulo nativo novo em Swift e uma nova decisão de privacidade (ADR).
- Fontes: [Family Controls](https://developer.apple.com/documentation/familycontrols), [Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement), [fórum: entitlement por extensão](https://developer.apple.com/forums/thread/796550).

### Números
- App: 195 testes, `tsc` limpo, lint sem erros.
- API: 82 testes, `tsc` limpo.

## Erros meus durante a noite, e como ficaram
- Ao mover o cartão do item em uso (#73), a prateleira ficou dentro do cartão. Corrigido no #76, conferido no celular.
- O rótulo do apelido aparecia em maiúsculas; corrigido.
- Numa junção, o celular ficou alguns segundos com tela preta (arquivo com marcas de conflito durante o empacotamento); resolvido em seguida.
- Um `npm install` num worktree criou um `node_modules` próprio e o disco chegou a 400 MB livres; limpei o cache do npm e os worktrees já mesclados (nenhum arquivo seu foi apagado).

## Próximos passos sugeridos
1. Aplicar a migração e testar posts, curtidas e ranking com uma segunda conta.
2. Notificação push para curtidas e comentários (hoje os avisos ficam dentro do app).
3. Denunciar post (exigência das lojas para conteúdo de usuários), além do bloqueio que já existe.
4. Mensagens entre amigos (prevista no ADR-0024).
