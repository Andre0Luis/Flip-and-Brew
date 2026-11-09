# Relatório · rodada 2 (8 de novembro de 2026)

Continuação de `docs/RELATORIO-2026-11-08.md`. Pedido do André: a comunidade dava erro em tudo; testar de verdade (post com foto, perfil, foto de perfil), terminar o que faltava da Apple, melhorar os widgets, ter pelo menos 100 frases do dia no banco com endpoint para alimentar, e então gerar os builds das lojas.

## Resumo
- **A comunidade funciona.** Testada no celular (Android) contra a API de produção: feed, post com foto, curtida, comentário, perfil com foto e dados, ranking da semana.
- **Dois bugs reais achados e corrigidos** (a migração 0004 não estava aplicada; o pedido do link de upload ia com corpo vazio) e um terceiro no ranking (semana em UTC).
- **112 frases do dia** no banco, com endpoint para o admin alimentar.
- **Widgets do Android** voltaram a desenhar e ganharam o nome do app no topo.
- **Tempo de tela no iPhone** (Family Controls aprovada pela Apple) na `main`.
- **Builds:** Android da loja gerado; **iOS parou num passo que só você faz** (login na Apple para o perfil da extensão nova). Veja "O que depende de você".

## O que foi feito

### Comunidade: como estava e o que achei
| Sintoma | Causa | Correção |
| --- | --- | --- |
| "Algo deu errado" em feed, ranking e posts | A migração `0004` não estava no banco (só existiam as 4 primeiras). | Rodei `npm run db:migrate` (você autorizou). Tabelas de posts, fotos, curtidas, comentários, avisos e ranking criadas. |
| Publicar post com foto: `500 Erro interno` | O pedido do link de envio ao Supabase Storage saía com `content-type: json` e corpo vazio; o Supabase responde `400 Body cannot be empty`. | #87 faz a API mostrar a causa (`502 storage_failed` com o texto do Supabase, sem chave); #88 manda `{}` no corpo. |
| Ranking mostrava 0 min com 11 h na semana | O app envia a semana pelo calendário do aparelho (W45), o servidor lia pela semana em UTC (já W46 à noite de domingo no Brasil). | #90: a leitura leva a `week` do aparelho. |

Testado no aparelho, nesta ordem: abrir Comunidade, ranking, criar post com 1 foto (título e legenda), post no feed com a foto, curtir (1 curtida), comentar ("Funcionou"), foto de perfil pela galeria (com recorte), nome e preferências de café (método, torra, moagem) e o ranking com o nome novo e 11 h 10 min, 9 copos. O post de teste ("Teste_de_post") ficou na sua conta; apague pelo ícone de lixeira no feed.

Não testei por falta de segunda conta: pedido de amizade entre duas pessoas, aviso de curtida para outra pessoa e bloqueio. Há teste automático para esses fluxos (`mobile-contract.test.ts`).

### Frases do dia (112 no banco)
- Tabela `daily_quotes` (migração `0005`, RLS ligada e privilégios revogados). Aplicada em produção, com `npm run db:seed-quotes` (112 frases, em pt, en e es, em rodízio de autores).
- `GET /v1/quotes` (qualquer pessoa logada): lista ativa, na ordem do rodízio.
- Para você alimentar (só admin): `GET /v1/admin/quotes` (todas, inclusive desativadas), `PUT /v1/admin/quotes` (cria ou corrige pelo `id`, até 200 por pedido; frase nova vai para o fim do rodízio; `active: false` tira sem apagar) e `DELETE /v1/admin/quotes/{id}`. Está no Swagger (`/docs`, tag Admin). Exemplo de corpo:

```json
{ "quotes": [ { "id": "q113", "content": {
  "pt": { "text": "…", "author": "…", "source": "…" },
  "en": { "text": "…", "author": "…", "source": "…" },
  "es": { "text": "…", "author": "…", "source": "…" } } } ] }
```
- O app (#92) baixa a lista ao abrir (no máximo a cada 6 h), guarda no aparelho e junta com as 9 de sempre. A frase do dia, o widget, a notificação da manhã e o carrossel usam a lista inteira (121 frases). Sem internet ou sem conta valem as 9 de dentro do app. Visto no aparelho: uma frase do servidor (Pascal) abriu na tela da frase, sem as seções de contexto (as frases novas não têm).
- As frases são traduções livres de autores e obras reais, cada uma com o lugar de onde vem. **Vale uma conferência sua** antes de divulgar: eu cito de memória os trechos e os números de capítulo.

### Widgets do Android
- O widget transparente era o React Compiler reescrevendo os componentes com hooks (log: `Invalid Hook Call`). #85 desliga o compilador só no arquivo dos widgets.
- #89: cabeçalho `FLIP & BREW` no topo de todos, o nome do widget ao lado, horário de término no copo ("termina às 14:35") e dica "Vire o celular para começar" sem copo. Visto no aparelho.

### Apple
- Family Controls (Distribution) aprovada. Módulo Swift `usage-stats` + extensão `ScreenTimeMonitor` na `main` (#86, ADR-0029); política de privacidade atualizada (#93).
- O build de iOS pede o perfil de provisionamento da extensão nova (`com.andre0luis.FlipAndBrew.screen-time`). Isso exige login na sua conta Apple e eu não consegui fazer em modo automático.

### Política de privacidade (#93)
Conta obrigatória nas versões com conta própria, o que vai para a nuvem, posts e fotos, ranking, bloqueio, exclusão completa e onde os dados ficam (Vercel, Supabase, Brevo). Versões antigas seguem no Firebase. Disponível também em `/privacidade`.

## Builds e submits
- **Perfil novo `store`** (`eas.json`): igual ao `production`, mas com o ambiente `preview` do EAS, que já tem as chaves do backend próprio e do RevenueCat. Assim a versão de loja já leva a comunidade, sem eu mexer no ambiente `production`.
- [x] Android (AAB, perfil `store`): build `14947ae7-ea71-47cd-be10-92add99c8613`.
- [ ] Submit Android: precisa da chave da conta de serviço do Google Play (só você cria). Alternativa: baixar o AAB da página do build e subir no Play Console.
- [ ] iOS: parou em "Failed to set up credentials" para a extensão `ScreenTimeMonitor` (veja abaixo). Sem isso não há build, e sem build não há TestFlight.

## O que depende de você
1. **iOS, uma vez:** num terminal com você logado, rode
   `cd apps/mobile && npx eas-cli build -p ios --profile store`
   e responda ao login da Apple (e-mail, senha e código). O EAS registra o identificador novo da extensão, liga a Family Controls e o App Group e cria o perfil. Depois me peça para gerar de novo, ou rode com `--auto-submit` para já ir ao TestFlight.
2. **Play Console:** criar a conta de serviço e enviar a chave ao EAS (Credentials, Android, Google Service Account), ou subir o AAB à mão.
3. **GitHub:** o workflow `EAS Build` falha porque falta o segredo `EXPO_TOKEN` (Settings, Secrets and variables, Actions). Não afeta os builds que gerei por aqui.
4. **Antes de publicar a versão com a comunidade para o público:** conferir "Entrar com a Apple" no Supabase (provedor Apple ligado), criar uma conta de teste para os revisores da Apple e do Google e atualizar os textos "funciona sem conta" das fichas das lojas.
5. **Frases:** conferir as 112 (citações e fontes) e alimentar novas pelo Swagger com o seu login de admin.
6. Dependabot (#61 a #64): seguem parados até você mandar.

## Números
- App: 202 testes. API: 90 testes. `tsc` limpo nos dois; lint sem erros.
- PRs desta rodada: #85, #86, #87, #88, #89, #90, #91, #92, #93.

## Erros meus nesta rodada
- Mesclei o #91 com o CI da API ainda pendente (já tinha passado local, passou depois).
- `gh pr merge --delete-branch` apagou meus worktrees com `node_modules`, duas vezes; refiz com `npm ci` e deixei registrado na memória.
- O Metro ficou servindo código velho depois de trocar de branch: por isso o widget novo e o ajuste do ranking só apareceram depois de reiniciar com `--clear`.
- O disco encheu duas vezes com o cache de compilação do Xcode; apaguei só a pasta que eu criei.
