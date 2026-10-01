export type Quote = {
  id: string;
  text: string;
  author: string;
  source: string;
  /** Contexto curto, mostrado quando a pessoa toca na frase. */
  context: string;
  tryToday: string[];
};

// Traduções livres. A fonte aparece junto de cada frase.
export const QUOTES: Quote[] = [
  {
    id: 'sq-13',
    text: 'Sofremos mais na imaginação do que na realidade.',
    author: 'Sêneca',
    source: 'Cartas a Lucílio, 13',
    context:
      'Sêneca escreve a Lucílio sobre o medo de coisas que ainda não aconteceram. A maior parte do sofrimento vem de cenas que a mente ensaia, não do que de fato chega. Ficar longe do celular tira o combustível mais fácil dessas cenas: a rolagem sem fim por más notícias.',
    tryToday: ['Anote uma preocupação e escreva ao lado o que de fato aconteceu até agora.', 'Fique dez minutos sem tela e perceba o que a cabeça ensaia.'],
  },
  {
    id: 'ma-520',
    text: 'O que está no caminho se torna o caminho.',
    author: 'Marco Aurélio',
    source: 'Meditações, 5.20',
    context:
      'O imperador treina ver o obstáculo como matéria-prima da ação. É a mesma ideia que Taleb chama de antifragilidade: o atrito não é um desvio, é o treino. Um copo interrompido também ensina algo sobre o que te puxou.',
    tryToday: ['Escolha um obstáculo de hoje e pergunte o que ele pode treinar em você.', 'Quando interromper um copo, registre o motivo sem se julgar.'],
  },
  {
    id: 'ep-5',
    text: 'Não são as coisas que perturbam as pessoas, mas os julgamentos que fazem delas.',
    author: 'Epicteto',
    source: 'Manual, 5',
    context:
      'Para Epicteto, o que nos abala é a interpretação que damos aos fatos. Uma notificação é só um aviso. A urgência vem do que contamos a nós mesmos sobre ela.',
    tryToday: ['Ao sentir pressa por uma mensagem, pergunte: o que estou presumindo?', 'Responda só depois de terminar o copo.'],
  },
  {
    id: 'ep-1',
    text: 'Algumas coisas dependem de nós, outras não.',
    author: 'Epicteto',
    source: 'Manual, 1',
    context:
      'A primeira linha do Manual separa o que controlamos (opiniões, desejos, ações) do que não controlamos (o corpo, a reputação, o que os outros fazem). Você controla deixar o celular de lado. Não controla o que chega nele.',
    tryToday: ['Liste três coisas que te incomodam hoje e marque as que dependem de você.', 'Desligue as notificações de um app que não pede resposta.'],
  },
  {
    id: 'sq-1',
    text: 'Enquanto adiamos, a vida passa.',
    author: 'Sêneca',
    source: 'Cartas a Lucílio, 1',
    context:
      'Na primeira carta, Sêneca pede a Lucílio que reivindique o próprio tempo. O que escapa sem ser notado é a maior perda. Cada copo que você termina é uma hora que você escolheu.',
    tryToday: ['Escolha uma tarefa adiada e trabalhe nela por um copo inteiro.', 'Olhe quanto tempo offline você juntou na semana.'],
  },
  {
    id: 'sq-brev',
    text: 'Não temos pouco tempo. Desperdiçamos muito.',
    author: 'Sêneca',
    source: 'Sobre a brevidade da vida, 1',
    context:
      'O ensaio abre contradizendo a queixa mais comum. A vida é longa o bastante para quem a usa bem. A atenção é a forma moderna desse tempo, e é a primeira coisa que as telas disputam.',
    tryToday: ['Anote onde o seu tempo foi ontem. Sem corrigir, só ver.', 'Reserve uma hora do dia que ninguém pode pedir.'],
  },
  {
    id: 'ma-847',
    text: 'Se algo externo te aflige, não é a coisa que te perturba, mas o teu julgamento sobre ela. E está em teu poder apagá-lo.',
    author: 'Marco Aurélio',
    source: 'Meditações, 8.47',
    context:
      'Marco Aurélio devolve o poder à pessoa: se o incômodo vem do julgamento, o julgamento pode mudar. É um exercício diário, não um estado de calma permanente.',
    tryToday: ['Reescreva um incômodo de hoje como um fato neutro, sem adjetivos.', 'Respire fundo três vezes antes de abrir o celular.'],
  },
  {
    id: 'ep-8',
    text: 'Não peças que os acontecimentos aconteçam como queres. Quer que aconteçam como acontecem, e viverás bem.',
    author: 'Epicteto',
    source: 'Manual, 8',
    context:
      'Aceitar não é desistir. É parar de gastar energia contra o que já aconteceu e dirigi-la ao que ainda dá para fazer. Quando o copo é interrompido, o próximo ainda pode ser feito.',
    tryToday: ['Quando algo sair do plano, diga em voz alta: é assim. E o que posso fazer agora?'],
  },
  {
    id: 'nt-vento',
    text: 'O vento apaga a vela e alimenta o fogo.',
    author: 'Nassim Nicholas Taleb',
    source: 'Antifrágil',
    context:
      'Taleb usa a imagem para separar o frágil, que se quebra com o choque, do antifrágil, que melhora com ele. Um hábito pode ser do segundo tipo: o dia ruim não o destrói, mostra onde reforçar.',
    tryToday: ['Escolha um desconforto pequeno e voluntário: dez minutos sem celular.', 'Depois de uma falha, anote o que ela ensinou antes de recomeçar.'],
  },
];

export const quoteById = (id: string) => QUOTES.find((q) => q.id === id);

/** Frase do dia: muda a cada dia, igual para todo mundo. */
export function quoteOfDay(date = new Date()): Quote {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86400000);
  return QUOTES[day % QUOTES.length];
}
