# Roteiro de validação no aparelho

Tudo o que o código faz sem depender de aparelho ou de contas já está coberto por testes (`npm run check`).
Este roteiro lista o que **só dá para confirmar no celular**. Marque cada item e anote o que fugiu do esperado.

Preparação: `npx expo run:android` com o aparelho conectado. Em Ajustes, toque 7 vezes na versão para liberar as ferramentas de teste e ative “Copos de 1 minuto”.

## 1. Sensor de virar o celular (o item de maior risco)
- [ ] Primeira abertura mostra a introdução. No último passo, “Calibrar agora” funciona com o celular deitado de tela para cima.
- [ ] Sem calibrar, virar o celular **não** inicia copo nem encerra um copo em andamento.
- [ ] Depois de calibrar, virar o celular para baixo por 2 s no Início inicia o copo e abre a tela do copo.
- [ ] Com o copo em andamento e o celular de tela para baixo, a tela apaga sozinha e o copo **continua contando**.
- [ ] Pegar o celular e destravar encerra o copo e abre o resultado, com o tempo certo.
- [ ] Deixar o celular de tela para cima numa mesa por mais de 3 s (depois de 15 s do início) encerra o copo.
- [ ] Se algo acima vier invertido, Ajustes › Calibrar sensor corrige.

## 2. Tempo e segundo plano
- [ ] Copo de 1 minuto, celular de tela para baixo, sem tocar: ao pegar, mostra **Copo pronto** com 1 min.
- [ ] Fechar o app pelo recentes durante um copo e reabrir depois: encerra com o tempo correto, sem perder a sessão.
- [ ] Bloquear a tela no meio do copo e desbloquear em seguida: encerra como “pegou o celular”.
- [ ] O botão voltar do Android não sai da tela do copo nem do resultado sem querer.

## 3. Uso do sistema (Bem-estar)
- [ ] Bem-estar › Resumo mostra o cartão “Veja seus desbloqueios e o tempo de tela” com o botão de permissão.
- [ ] “Permitir acesso ao uso” abre a tela do Android; ao voltar, os números aparecem sem reabrir o app.
- [ ] “Desbloqueios hoje” bate com o que você contou (desbloqueie algumas vezes e compare).
- [ ] “Tela hoje” é plausível frente ao Bem-estar Digital do Android.
- [ ] Revogar a permissão no Android faz o cartão voltar ao pedido de permissão, sem erro.

## 4. Notificação opcional
- [ ] Ajustes › “Avisar quando o copo encher” pede a permissão do Android.
- [ ] Com ela ligada, ao encher o copo chega uma notificação **silenciosa** (sem som nem vibração).
- [ ] Encerrar o copo antes de encher cancela o aviso.
- [ ] Negar a permissão deixa o interruptor desligado e mostra a mensagem.

## 5. Sensação do app
- [ ] Haptics: iniciar (médio), copo pronto (sucesso), parar cedo (leve), troca de aba e seleção.
- [ ] Animações do copo, do vapor e do anel fluidas, sem engasgos.
- [ ] Modo escuro e claro seguem o sistema; “Torra escura” em Ajustes força o escuro.
- [ ] Idiomas: trocar para English e Español em Ajustes muda tudo, inclusive frases e artigos.
- [ ] Texto grande do sistema (Ajustes do Android › Tamanho da fonte) não corta nada importante.
- [ ] Ícone e splash corretos, claros e escuros.

## 6. Dados
- [ ] Fechar e reabrir o app mantém moedas, itens e histórico.
- [ ] Ajustes › Apagar todos os dados zera tudo e **não** repete a introdução.
- [ ] “Rever a introdução” reabre a introdução e, ao concluir, volta às abas.

## 7. Conta, login com Google e backup (precisa do Firebase configurado: `docs/FIREBASE.md`)
- [ ] Com o `.env` preenchido, Ajustes mostra o cartão “Conta e backup”. Sem as chaves, ele não aparece e o app funciona normal.
- [ ] Criar conta com e-mail e senha: entra, mostra o e-mail e faz o primeiro backup.
- [ ] Sair e entrar de novo funciona; senha errada mostra “E-mail ou senha incorretos”.
- [ ] “Esqueci a senha” envia o e-mail de redefinição (confira a caixa de entrada).
- [ ] “Continuar com o Google” abre o seletor de contas e entra. Se der `DEVELOPER_ERROR`, confira o SHA-1 e o pacote no cliente OAuth Android.
- [ ] Segundo aparelho (ou apagar os dados do app): entrar com a mesma conta restaura moedas, itens e histórico.
- [ ] Dados diferentes dos dois lados: aparece a escolha “Encontramos um backup” e as duas opções funcionam.
- [ ] Depois de um copo, o backup acontece sozinho em poucos segundos (veja “Último backup” na tela de Conta).
- [ ] Sem internet: o app segue funcionando e o backup só falha em silêncio; ao voltar a conexão, o próximo copo envia.
- [ ] Excluir conta: pede senha (ou o Google), apaga, volta ao formulário de entrada e a conta não entra mais. No Firebase, o documento `users/{uid}` e o usuário somem.
- [ ] Regras do Firestore publicadas: uma conta não consegue ler o documento de outra.

## 8. Depende de conta ou chave (fica para o lançamento)
- [ ] Chaves do RevenueCat e produtos `coins_100`, `coins_500`… criados no Play Console; compra de teste conclui e soma as moedas.
- [ ] Build de produção (`eas build --profile production`) e envio para a faixa de teste interno.
- [ ] URL da política de privacidade hospedada (a partir de `docs/PRIVACY.*.md`) e formulário de Segurança dos dados.
