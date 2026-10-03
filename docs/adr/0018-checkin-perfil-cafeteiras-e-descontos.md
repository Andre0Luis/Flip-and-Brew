# ADR-0018 · Check-in de energia, perfil opcional, mais itens e desconto por constância

**Status:** Aceita · **Data:** 2026-10 · **Substitui em parte:** ADR-0011 (preços e itens)

## Contexto
O humor só era registrado ao fim de um copo, então dias sem copo ficavam sem leitura. A loja tinha poucas cafeteiras e xícaras, com preços baixos para as séries especiais. A pessoa pediu também um perfil com dados pessoais e gosto de café.

## Decisão
- **Check-in diário de energia.** Um por dia, de 1 a 5 **xícaras de café** (1 = esgotado, 5 = cheia). Aparece no Início; responder de novo no mesmo dia troca a resposta. O Bem-estar mostra os 7 dias, a média e a comparação com dias de mais e menos tempo offline. Não gera notificação (ADR-0007 e o princípio de não disputar atenção).
- **Perfil opcional** (tela `perfil`, em Ajustes, e no cadastro): nome, telefone, idade e preferências de café (café favorito, método preferido, torra, moagem, corpo, acidez, sabores). Tudo facultativo. As preferências são **chaves neutras**, não texto traduzido. Telefone e idade só são salvos quando válidos.
  - O telefone **não é usado para nada** (sem SMS, sem ligação, sem verificação); o texto da tela diz isso. É só um campo.
  - Fica no aparelho; com conta, vai no backup com o progresso (`checkins` e `profile` são campos opcionais do snapshot, então backups antigos continuam válidos). A política de privacidade e a página de exclusão de conta foram atualizadas.
- **Começo do jogo:** Melitta (a mais simples), copo de papel e café extraforte, os três a custo zero. A V60 e a xícara de porcelana passaram a ser compradas.
- **Mais cafeteiras:** coador de pano, V60, prensa, turca, filtro phin, AeroPress, elétrica, cold brew, moka, cápsula, sifão e espresso (a Chemex segue por 30 dias de sequência).
- **Mais copos e séries especiais:** xícaras, canecas e copos de vidro (inclusive o copo americano). Séries: Estoica, Botequim, Cores da Torcida (seis canecas só com as cores de times, sem nomes nem escudos), Noturna, Montanha, Ouro e Universo (a exclusiva).
- **Pacotes de café** (extraforte, tradicional, superior, gourmet e especial): item de um terceiro tipo (`beans`), equipado ao lado da cafeteira e do copo. Quanto melhor a categoria, mais moedas.
- **Bônus de moedas por combinação** (`lib/earnings.ts`, no ADR-0011 isso estava descartado): a cafeteira, o copo e o pacote em uso somam um bônus percentual sobre as moedas do copo, com +5% por combinação que combina (ex.: turca com caneca preta). Teto de 70%. A base continua 1 moeda por minuto, e o bônus de 20% do copo cheio.
- **Preços** (moedas): as três primeiras peças à venda de cada tipo custam pouco, para chamar a atenção (cafeteiras 300, 400 e 600; copos 250); depois sobem. Séries especiais custam mais que qualquer peça comum (2300 a 7650, depois de um corte de cerca de 15% por serem caras demais). Pacotes: 450, 1350, 3000 e 7500. Como a base é 1 moeda por minuto, os preços foram triplicados para que cada peça custe horas de tempo offline, não minutos.
- **Missões diárias** (Bem-estar, Resumo): três por dia, sorteadas pela data (uma de hábito, uma de copo, uma de tempo offline), com progresso calculado dos dados que o app já tem. As moedas entram só ao resgatar (10 a 35 cada, mais 30 de bônus pelas três); o resgate não repete no mesmo dia e vai no backup (`missionsClaimed`, só os últimos dias).
- A cafeteira do Início ganhou animação leve (flutuar e vapor), desligada com "reduzir movimento".

## Alternativas descartadas
- **Notificação diária de lembrete do check-in:** vai contra o princípio do app.
- **Exigir perfil ou telefone no cadastro:** o app nunca exige conta nem dados (ADR-0009). O perfil é opcional também no cadastro.
- **Desconto em tudo:** tiraria o valor das séries especiais.
- **Escudos dos clubes na série Torcida:** são marcas registradas. Usamos só as cores; publicar na loja pode exigir licença ou nomes neutros (ADR-0017).
- **Guardar a idade como data de nascimento:** mais dado pessoal do que o necessário; guardamos só a idade.

## Consequências
- Quem já tinha comprado prensa ou moka não perde nada; só os preços novos valem daqui para frente.
- O desconto recompensa constância, não gasto; as faixas (30% + 20%) não foram testadas com pessoas reais (ADR-0017).
- Telefone e idade são dado pessoal: o formulário de "Segurança dos dados" da Play Store precisa listá-los quando o backup estiver ativo (ADR-0014 e ADR-0017).
- Se o telefone nunca for usado, vale reconsiderar mantê-lo (minimização de dados).
