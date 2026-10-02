# ADR-0017 · Pendências e riscos conhecidos

**Status:** Aberto (atualize sempre que algo for resolvido ou surgir) · **Última revisão:** 2026-10-02

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

## Dívidas técnicas
- [ ] O histórico de uso do sistema é curto (o Android guarda poucos dias).
- [ ] Testes de interface automatizados no aparelho não existem; só o roteiro manual.
- [ ] Hoje o backup limita-se às 1500 sessões mais recentes.

## Já resolvido (para memória)
- [x] Reinício do projeto, mecânica nova, visual novo.
- [x] Idiomas pt, en e es com dicionários tipados.
- [x] Contas, backup, exclusão e servidor falso.
- [x] Usuário de teste e manual de configuração.
- [x] Testes, lint e CI.
