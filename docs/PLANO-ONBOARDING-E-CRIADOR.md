# Plano: tutorial de boas-vindas e seção "Por que este app existe"

Status: proposta, nada implementado. Base: o briefing do André (perfil, tom, eixos narrativos) e o código atual (`src/app/intro.tsx`, `src/app/ajustes.tsx`, `src/i18n/`).

## 1. Ponto de partida

Já existe uma introdução de 4 passos (`intro.tsx`): copo enchendo, moedas, "tropeçar também ensina" e calibração. Ela funciona, mas tem 4 telas de texto e a ação central (virar o celular) só aparece no último passo, como opcional. O briefing pede o oposto: segundos, não carrossel, e aprender fazendo.

A proposta é **enxugar para 3 passos**, mover a ação central para o meio e deixar moedas e antifragilidade para dicas na primeira vez que a pessoa os encontra (Início e Resultado). Essa mudança mexe no que a introdução ensina hoje; vale um ADR curto (0019) ao implementar, marcando a introdução antiga como substituída, não apagada.

## 2. Arquitetura do tutorial (3 passos, cerca de 15 segundos)

| Passo | Papel | O que aparece | Controles |
| --- | --- | --- | --- |
| 1. Problema e promessa | Uma frase de impacto | Copo enchendo em loop (já existe), título, uma linha de apoio, escolha de idioma | Continuar, Pular |
| 2. Ação central | Aprender interagindo | A calibração de 5 segundos vira o tutorial: "vire o celular para baixo, depois para cima". O copo reage ao movimento. Sem sensor (web, aparelho sem): botão para ver o copo encher sozinho | Calibrar agora, Depois |
| 3. Autonomia | Entregar o controle | Três linhas: nada exige conta, tudo fica no aparelho, tudo se muda em Ajustes | Começar |

Regras de fluxo:
- Pular está disponível em todos os passos e leva direto ao app. Nenhuma tela bloqueia.
- O passo 2 nunca é obrigatório. Se a calibração falhar, a mensagem de erro já existente aparece e o botão segue funcionando.
- Fim: `setOnboarded(true)` como hoje; cai no Início, onde o cartão de calibração continua se a pessoa pulou.
- Rever: Ajustes > "Rever a introdução" (já existe).
- Reaproveita `useCalibrate`, `FillingCup`, `Button`, `Chip`. Nenhum componente novo para o tutorial.

## 3. Microcopy do tutorial (português; en e es entram na implementação)

Passo 1
- Título: `Largue o celular. O café se faz.` (mantém o atual)
- Apoio: `Vire o celular para baixo. A xícara enche em tempo real enquanto você vive.`
- Botões: `Continuar` · `Pular`

Passo 2
- Título: `Faça agora, leva 5 segundos`
- Apoio: `Vire o celular para baixo e depois para cima. É assim que o app aprende como o seu aparelho se mexe.`
- Botões: `Calibrar agora` · `Depois`
- Sucesso: `Pronto. Virou para baixo, o copo começa.`
- Sem sensor: `Este aparelho não tem o sensor. Toque em "Começar a passar" no Início.`

Passo 3
- Título: `Você manda aqui`
- Apoio, três linhas curtas:
  - `Sem conta. Tudo fica no seu aparelho.`
  - `Conta e backup são opcionais, em Ajustes.`
  - `Quer rever isto? Ajustes > Rever a introdução.`
- Botão: `Começar`

Dicas de primeira vez (substituem os passos removidos; aparecem uma vez, dispensáveis com um toque)
- Primeira moeda ganha: `Cada minuto offline vira uma moeda. Elas compram cafeteiras e xícaras.`
- Primeiro copo interrompido: `Parou cedo? O copo rende o que encheu. Anote o que te puxou: é assim que o hábito se firma.`

Tom: frases curtas, sem emoji, sem exclamação, sem "bem-vindo!".

## 4. Seção "Por que este app existe"

Onde: tela própria `src/app/criador.tsx`, aberta por um cartão em Ajustes ("Por que este app existe"), logo acima de "Rever a introdução". Também pode ganhar um link discreto no fim do passo 3, mas **não** no fluxo obrigatório. Conteúdo longo vai em `src/data/content/<idioma>.ts` (regra do projeto); só título do cartão e botões vão nos dicionários.

Layout: título em Young Serif, um cartão invertido com a frase *Every second counts*, quatro blocos curtos com subtítulo em DM Mono, assinatura no fim. Sem foto obrigatória; se o André quiser uma, entra como `assets/` e opcional.

### Texto integral (português, revisado)

**Por que este app existe**
*André Luis Teixeira, quem construiu o Flip & Brew*

> Every second counts.

**Quem faz**
Sou André, engenheiro de plataforma. Meu trabalho é construir a base que ninguém vê, para que o resto funcione sem atrito. Fora do trabalho, faço trekking de travessia. Na montanha, peso a mais na mochila cobra o preço, e só existe o próximo passo.

**A frase no braço**
Tenho essa frase tatuada. Não é cartaz de motivação. É uma conta simples: tempo é o único recurso que não volta. Hesitação, ruído e ilusão gastam o mesmo relógio que tudo o mais.

**A virada**
Um fim de ciclo me mostrou quanto tempo e energia eu vinha dando a algo sem futuro. Sou grato por isso. Foi o que tirou a venda e me devolveu o controle do meu próprio relógio.

**O que este app é**
O Flip & Brew não quer a sua atenção. Não tem truque para te prender nem aviso para te puxar de volta; o único aviso é o de copo pronto, e só se você ligar. Ele existe para o contrário: você larga o celular, o café se faz, e o tempo vai para o que importa fora da tela.

Boa travessia.
André

Notas de revisão:
- O fim de relacionamento aparece só como "fim de ciclo", sem detalhe, sem culpa e sem nome. Isso protege a privacidade e mantém o tom (gratidão, não mágoa). Se quiser mais explícito ou mais discreto, é uma frase.
- "Sem aviso para te puxar de volta" é verdade hoje: a única notificação é o aviso de copo pronto, desligado por padrão (README, "Aviso de copo pronto"). Se surgirem outras notificações, o texto precisa mudar junto.
- Antifragilidade fica implícita (dor virou método), sem citar Taleb, que já tem espaço em Aprender.

## 5. Implementação (quando aprovado)

1. ADR-0019 (nova introdução em 3 passos e seção do criador), ligando ao ADR-0006 (estoicismo/antifragilidade como produto) e ao ADR-0009 (nada exige conta). Atualizar o índice em `docs/adr/README.md`.
2. `intro.tsx`: reduzir `STEPS` para 3, passo 2 usa `useCalibrate`, remover as chaves `intro.t1/b1/t2/b2` e criar as novas em `pt.ts`, `en.ts`, `es.ts`.
3. Dicas de primeira vez: dois campos novos no store (`seenTips`), com migração, em `src/store/useApp.ts`, e teste.
4. `src/app/criador.tsx` + conteúdo em `src/data/content/{pt,en,es}.ts` + cartão em `ajustes.tsx`.
5. Testes de tradução (já existem) cobrem chaves faltando; adicionar teste da migração do store.
6. Atualizar README (seção "Primeira abertura") e `docs/store/` se a descrição da loja citar a introdução.
7. `npm run check`, depois ver no navegador (`npm run web`) as telas em claro e escuro.

## 6. Decisões que dependem do André

1. Aprova tirar moedas e antifragilidade da introdução e movê-las para dicas de primeira vez?
2. O texto do criador entra em en e es traduzido ou só em português com os outros idiomas caindo no pt? (Recomendo traduzir; são cinco parágrafos.)
3. Foto ou ilustração do André na tela? Recomendo sem foto no lançamento.
4. Link do Instagram/LinkedIn no fim? Recomendo não: o texto fecha melhor sem pedir ação.

## 7. Sobre a numerologia e Taleb do briefing

Usei Taleb como filtro de tom (dor virou método, não queixa), não como citação na tela. A numerologia não entra no produto: é leitura pessoal e não muda nenhuma decisão de interface.
