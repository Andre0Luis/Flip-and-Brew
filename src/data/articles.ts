export type Category = 'Antifrágil' | 'Estoicismo' | 'Digital' | 'Sono';
export const CATEGORIES: Category[] = ['Antifrágil', 'Estoicismo', 'Digital', 'Sono'];

export type Article = {
  id: string;
  category: Category;
  title: string;
  summary: string;
  minutes: number;
  quoteId: string;
  oneLine: string;
  inApp: string;
  body: string[];
  tryToday: string[];
  related: string[];
};

export const ARTICLES: Article[] = [
  {
    id: 'antifragil',
    category: 'Antifrágil',
    title: 'Antifrágil, em 3 minutos',
    summary: 'O que ganha com a desordem e por que isso vale para a sua rotina.',
    minutes: 3,
    quoteId: 'nt-vento',
    oneLine: 'Algumas coisas apenas resistem ao choque. Outras melhoram com ele. Seu hábito pode ser do segundo tipo.',
    inApp:
      'Um dia ruim não apaga o seu progresso. A prateleira fica, a sequência só pausa, e a tela de Bem-estar mostra o que o dia ensinou.',
    body: [
      'Nassim Taleb propõe três tipos de coisa. O frágil se quebra com o choque, como uma taça de vidro. O robusto aguenta e continua igual, como uma pedra. O antifrágil melhora, como os músculos depois do treino ou o sistema imunológico depois de um contato com o vírus.',
      'Para uma rotina de bem-estar, a pergunta é em qual dos três ela está. Um hábito que depende de nunca falhar é frágil: no primeiro tropeço, a pessoa abandona tudo. Um hábito antifrágil conta com a falha e usa o que ela mostra.',
      'No Flip & Brew isso aparece em decisões pequenas. Copo interrompido rende moedas proporcionais, em vez de zero. Dia perdido pausa a sequência, em vez de apagar a prateleira. E, ao parar um copo, você registra o que te tirou dali. Com o tempo, esses registros mostram onde reforçar.',
    ],
    tryToday: ['Escolha um desconforto pequeno e voluntário: dez minutos sem celular.', 'Ao final, anote o que sentiu em uma frase.', 'Repita amanhã, um pouco mais longo.'],
    related: ['via-negativa', 'recaida'],
  },
  {
    id: 'controle',
    category: 'Estoicismo',
    title: 'O que está sob o seu controle',
    summary: 'A distinção que muda como você lida com notificações.',
    minutes: 4,
    quoteId: 'ep-1',
    oneLine: 'Você controla se olha o celular. Não controla o que chega nele.',
    inApp: 'Ao interromper um copo, a tela de resultado pergunta o motivo. Perceber o padrão é o primeiro passo para tirar o gatilho do caminho.',
    body: [
      'A primeira página do Manual de Epicteto separa o que depende de nós (nossos julgamentos, desejos e ações) do que não depende (o que os outros fazem, a opinião deles, o resultado final). A tese é simples: gaste energia só no primeiro grupo.',
      'Aplicado ao celular, a conta muda. Você não controla quando alguém vai mandar mensagem. Controla se as notificações estão ligadas, se o aparelho está no seu bolso ou em outro cômodo, e quando você responde.',
      'Isso tira um peso. Se a resposta pode esperar um copo, a urgência estava na sua cabeça. Se não pode, você a trata sem culpa. Nos dois casos, a decisão volta a ser sua.',
    ],
    tryToday: ['Liste três incômodos de hoje e marque quais dependem de você.', 'Escolha um app e desligue as notificações dele.'],
    related: ['notificacoes', 'desconforto'],
  },
  {
    id: 'notificacoes',
    category: 'Digital',
    title: 'Desligue o que não pede resposta',
    summary: 'Um ajuste de cinco minutos que corta dezenas de interrupções.',
    minutes: 3,
    quoteId: 'ep-5',
    oneLine: 'Notificação que não precisa de você nos próximos minutos é só ruído.',
    inApp: 'Cada copo que você termina é uma janela sem interrupção. Menos notificações deixam essas janelas durarem mais.',
    body: [
      'Abra os ajustes de notificação do seu celular e olhe a lista de apps. Para cada um, pergunte se aquilo precisa de você agora. Mensagens de pessoas, sim. Curtidas, promoções, destaques do dia e contadores quase nunca.',
      'Comece pelos que mais te interrompem. Desligue o som e o balão, deixe só o número na tela do app. Assim a informação existe quando você for procurar, mas não vem atrás de você.',
      'Depois de uma semana, reveja. O que você sentiu falta volta a ligar. O resto não faz falta, e é o que ocupava as suas horas.',
    ],
    tryToday: ['Desligue as notificações de três apps.', 'Ative um modo de foco com horário fixo para o primeiro copo do dia.'],
    related: ['controle', 'atencao'],
  },
  {
    id: 'sono',
    category: 'Sono',
    title: 'Uma hora de tela a menos antes de dormir',
    summary: 'O que pode mudar no sono e como começar sem sofrer.',
    minutes: 4,
    quoteId: 'sq-1',
    oneLine: 'Deixar o celular longe da cama na última hora do dia ajuda o corpo a desacelerar.',
    inApp: 'Um copo de fim de noite conta como qualquer outro. O celular virado para baixo, longe do travesseiro, é o hábito.',
    body: [
      'A luz forte e o conteúdo que prende a atenção podem adiar o sono. Não há um número mágico e o efeito varia de pessoa para pessoa, mas a regra prática é a mesma: a última hora do dia pede menos estímulo.',
      'Comece pequeno. Carregue o celular fora do quarto, ou ao menos fora do alcance da mão. Se você usa o aparelho como despertador, compre um relógio simples. Trocar o último hábito do dia (olhar a tela) por outro (ler, alongar, conversar) é o que sustenta a mudança.',
      'Se algo vier à cabeça na hora de dormir, anote num papel ao lado da cama. O objetivo é tirar o assunto da cabeça sem acender uma tela.',
    ],
    tryToday: ['Defina um horário fixo para colocar o celular para carregar longe da cama.', 'Faça um copo de 30 minutos antes de deitar.'],
    related: ['atencao', 'manha'],
  },
  {
    id: 'via-negativa',
    category: 'Antifrágil',
    title: 'Subtrair antes de somar',
    summary: 'Tirar o que atrapalha costuma render mais que acrescentar algo novo.',
    minutes: 3,
    quoteId: 'ma-520',
    oneLine: 'Antes de procurar um app novo que resolva, veja o que dá para remover.',
    inApp: 'O app tem poucas telas de propósito. A ideia é que o celular fique de lado, não que você passe mais tempo nele.',
    body: [
      'Taleb chama de via negativa a ideia de melhorar por subtração. Cortar o que faz mal tende a ser mais confiável do que acrescentar o que talvez faça bem, porque o dano de um excesso é mais certo do que o benefício de uma novidade.',
      'Para o celular, isso quer dizer apagar antes de instalar. Um app de produtividade a mais é mais uma coisa que pede atenção. Remover da tela inicial o app que mais te puxa é um ajuste pequeno e que a pessoa costuma sentir no mesmo dia.',
      'Vale também para tarefas e compromissos. Pergunte o que você pode deixar de fazer, e não só o que precisa incluir.',
    ],
    tryToday: ['Tire da tela inicial o app que mais te puxa.', 'Cancele um compromisso que você não escolheria de novo.'],
    related: ['antifragil', 'atencao'],
  },
  {
    id: 'desconforto',
    category: 'Estoicismo',
    title: 'Treinar o desconforto de propósito',
    summary: 'Pequenas abstenções voluntárias preparam a calma para quando o dia aperta.',
    minutes: 4,
    quoteId: 'sq-13',
    oneLine: 'Passar por um desconforto escolhido tira o poder do medo dele.',
    inApp: 'Um copo é um treino curto de desconforto: o impulso de olhar a tela aparece, você o observa e ele passa.',
    body: [
      'Na carta 18, Sêneca sugere reservar alguns dias para viver com pouco: comida simples, roupa modesta, sem luxos. A pergunta que ele faz é se aquilo é mesmo tão ruim quanto se temia. Quase sempre, não é.',
      'A abstenção voluntária funciona do mesmo jeito com a tela. O impulso de pegar o celular sobe, fica forte por alguns minutos e depois cede. Quem já passou por isso uma vez sabe que consegue passar de novo.',
      'O truque é escolher você mesmo o tamanho do desconforto. Quando ele vem de fora, é estresse. Quando você o escolhe e o conduz, é treino.',
    ],
    tryToday: ['Fique dez minutos sem tela, sentado, sem fazer mais nada.', 'Perceba quando o impulso aparece e quando passa.'],
    related: ['controle', 'antifragil'],
  },
  {
    id: 'atencao',
    category: 'Digital',
    title: 'Atenção é o que você paga',
    summary: 'Para onde vai a sua atenção é a decisão mais importante do dia.',
    minutes: 3,
    quoteId: 'sq-brev',
    oneLine: 'Nada é de graça. Em apps gratuitos, o que se paga é o seu tempo.',
    inApp: 'As moedas contam o tempo que você recuperou. Gastá-las na loja é uma forma de ver esse tempo virar algo na prateleira.',
    body: [
      'Muitos apps são gratuitos porque o produto é a sua atenção. Eles são desenhados para você voltar, e não para você terminar o que foi fazer. Saber disso ajuda a notar quando uma pausa virou meia hora.',
      'Não é preciso abandonar nada. Dá para decidir com antecedência o que merece o seu tempo: este app por vinte minutos, depois outra coisa. Combinar o fim antes de começar evita a espiral.',
      'Sêneca diria que o tempo é a única posse que de fato temos. Tratar a atenção como dinheiro, e observar para onde ela vai no fim do dia, é um bom começo.',
    ],
    tryToday: ['Antes de abrir um app, diga a si mesmo quanto tempo vai ficar.', 'No fim do dia, anote onde a atenção foi.'],
    related: ['notificacoes', 'via-negativa'],
  },
  {
    id: 'recaida',
    category: 'Antifrágil',
    title: 'Uma recaída não zera nada',
    summary: 'Como usar um dia ruim para fortalecer o hábito.',
    minutes: 3,
    quoteId: 'nt-vento',
    oneLine: 'Falhar faz parte. O que decide o hábito é o dia seguinte.',
    inApp: 'A tela Bem-estar compara o dia depois de uma falha com a sua média, para você ver se o tropeço te deixou mais forte.',
    body: [
      'A maioria dos hábitos termina na primeira falha, não por falta de vontade, mas por uma regra interna do tipo tudo ou nada. Se a sequência é tudo, perdê-la parece apagar o esforço.',
      'Um desenho antifrágil separa as duas coisas. A sequência pode pausar, mas o que você acumulou (o tempo, a prateleira, o aprendizado) continua. E o dia ruim vira dado: o que aconteceu, a que horas, o que estava em volta.',
      'Depois de uma falha, a pergunta útil não é por que eu falhei, e sim o que eu faço diferente no próximo copo. Um ajuste pequeno, e recomeçar o quanto antes.',
    ],
    tryToday: ['Se hoje não deu, anote em uma frase o motivo.', 'Marque um copo curto para amanhã, no horário mais fácil.'],
    related: ['antifragil', 'desconforto'],
  },
  {
    id: 'manha',
    category: 'Digital',
    title: 'A primeira hora sem celular',
    summary: 'Como começar o dia com a atenção ainda sua.',
    minutes: 3,
    quoteId: 'ma-847',
    oneLine: 'O que você olha primeiro costuma ditar o humor do resto da manhã.',
    inApp: 'Comece o dia com um copo. A manhã tem a menor quantidade de interrupções que você mesmo produz.',
    body: [
      'Abrir o celular antes de levantar entrega o início do dia para a agenda dos outros. Notícias, mensagens e comparações chegam antes de você decidir o que importa.',
      'Uma alternativa é deixar o aparelho fora do quarto e reservar a primeira meia hora para coisas suas: água, alongar, café, olhar pela janela. Nada de especial, só ter o começo do dia de volta.',
      'Se a ideia parecer grande, comece com dez minutos. Um copo de V60 já é uma manhã diferente.',
    ],
    tryToday: ['Prepare o primeiro copo do dia antes de olhar mensagens.', 'Deixe o carregador fora do quarto esta noite.'],
    related: ['sono', 'notificacoes'],
  },
];

export const articleById = (id: string) => ARTICLES.find((a) => a.id === id);

export type Practice = { id: string; title: string; minutes: number; text: string; coins: number };

export const PRACTICES: Practice[] = [
  { id: 'tedio', title: 'Aceite o tédio por dez minutos, sem tela.', minutes: 10, text: 'Pequenos desconfortos escolhidos treinam a calma que você precisa quando o dia aperta.', coins: 5 },
  { id: 'janela', title: 'Olhe pela janela por cinco minutos.', minutes: 5, text: 'Sem celular, sem música. Só ver o que está lá fora e perceber o que a cabeça faz.', coins: 5 },
  { id: 'caminhada', title: 'Caminhe quinze minutos sem fone.', minutes: 15, text: 'Ouça o que está em volta. A caminhada sem estímulo é um dos treinos mais simples de atenção.', coins: 5 },
  { id: 'carta', title: 'Escreva à mão três linhas sobre o seu dia.', minutes: 5, text: 'Sêneca escrevia cartas para pensar. Três linhas já separam o que aconteceu do que você contou a si mesmo.', coins: 5 },
  { id: 'refeicao', title: 'Faça uma refeição sem tela.', minutes: 20, text: 'Mastigue devagar e repare no sabor. A refeição deixa de ser um intervalo entre vídeos.', coins: 5 },
  { id: 'agua', title: 'Tome um copo de água antes de pegar o celular.', minutes: 2, text: 'O gesto cria uma pausa entre o impulso e a ação.', coins: 5 },
  { id: 'controle', title: 'Liste o que depende e o que não depende de você.', minutes: 5, text: 'Duas colunas em um papel. Gaste a energia só na primeira.', coins: 5 },
  { id: 'respirar', title: 'Respire fundo dez vezes antes de responder uma mensagem.', minutes: 3, text: 'Se ainda parecer urgente, responda. Muitas vezes a urgência diminui.', coins: 5 },
];

export function practiceOfDay(date = new Date()): Practice {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86400000);
  return PRACTICES[day % PRACTICES.length];
}
