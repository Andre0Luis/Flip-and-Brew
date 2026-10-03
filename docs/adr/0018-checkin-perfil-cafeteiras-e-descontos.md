# ADR-0018 · Check-in de energia, perfil opcional, mais itens e desconto por constância

**Status:** Aceita · **Data:** 2026-10 · **Substitui em parte:** ADR-0011 (preços e itens)

## Contexto
O humor só era registrado ao fim de um copo, então dias sem copo ficavam sem leitura. A loja tinha poucas cafeteiras e xícaras, com preços baixos para as séries especiais. A pessoa pediu também um perfil com dados pessoais e gosto de café.

## Decisão
- **Check-in diário de energia.** Um por dia, de 1 a 5 **xícaras de café** (1 = esgotado, 5 = cheia). Aparece no Início; responder de novo no mesmo dia troca a resposta. O Bem-estar mostra os 7 dias, a média e a comparação com dias de mais e menos tempo offline. Não gera notificação (ADR-0007 e o princípio de não disputar atenção).
- **Perfil opcional** (tela `perfil`, em Ajustes, e no cadastro): nome, telefone, idade e preferências de café (café favorito, torra, moagem, corpo, acidez, sabores). Tudo facultativo. As preferências são **chaves neutras**, não texto traduzido. Telefone e idade só são salvos quando válidos.
  - O telefone **não é usado para nada** (sem SMS, sem ligação, sem verificação); o texto da tela diz isso. É só um campo.
  - Fica no aparelho; com conta, vai no backup com o progresso (`checkins` e `profile` são campos opcionais do snapshot, então backups antigos continuam válidos). A política de privacidade e a página de exclusão de conta foram atualizadas.
- **Cafeteiras novas:** coador de pano, Melitta, AeroPress, cafeteira turca e sifão.
- **Mais xícaras e canecas:** três canecas (musgo, terracota, preta), três xícaras de porcelana (cobalto, oliva, ocre) e uma **série especial nova, Montanha** (caneca de acampamento, xícara Pico, caneca Cume).
- **Preços** (moedas): cafeteiras 200 (pano), 300 (Melitta), 400 (prensa), 500 (turca), 600 (AeroPress), 800 (moka), 1500 (sifão); Chemex continua por 30 dias de sequência. Xícaras e canecas 150 a 280. **Séries especiais** (Estoica e Montanha) 700 e 900, mais caras que qualquer peça comum.
- **Desconto nas cafeteiras** (`lib/pricing.ts`): até **30%** por dias seguidos de check-in (1% por dia) mais até **20%** pela fração dos últimos 14 dias completos em que o tempo offline bateu a meta diária. Máximo 50%. Vale só para cafeteiras; xícaras e séries especiais têm sempre o preço cheio. O Guia mostra o preço antigo riscado e a conta do desconto.
- A cafeteira do Início ganhou animação leve (flutuar e vapor), desligada com "reduzir movimento".

## Alternativas descartadas
- **Notificação diária de lembrete do check-in:** vai contra o princípio do app.
- **Exigir perfil ou telefone no cadastro:** o app nunca exige conta nem dados (ADR-0009). O perfil é opcional também no cadastro.
- **Desconto em tudo:** tiraria o valor das séries especiais.
- **Guardar a idade como data de nascimento:** mais dado pessoal do que o necessário; guardamos só a idade.

## Consequências
- Quem já tinha comprado prensa ou moka não perde nada; só os preços novos valem daqui para frente.
- O desconto recompensa constância, não gasto; as faixas (30% + 20%) não foram testadas com pessoas reais (ADR-0017).
- Telefone e idade são dado pessoal: o formulário de "Segurança dos dados" da Play Store precisa listá-los quando o backup estiver ativo (ADR-0014 e ADR-0017).
- Se o telefone nunca for usado, vale reconsiderar mantê-lo (minimização de dados).
