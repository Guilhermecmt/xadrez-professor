import { Chess } from './vendor/chess.js';

export const units = [
  { id: 'movimentos', title: 'Conheça as peças', level: 'Fundamentos', icon: '♙', description: 'Aprenda a enxergar os caminhos de cada peça.' },
  { id: 'regras', title: 'Regras do jogo', level: 'Fundamentos', icon: '♔', description: 'Jogue lances legais e reconheça as regras especiais.' },
  { id: 'abertura', title: 'Comece bem', level: 'Iniciante', icon: '♗', description: 'Construa uma posição segura nos primeiros lances.' },
  { id: 'tatica', title: 'Encontre a tática', level: 'Intermediário', icon: '♘', description: 'Identifique ameaças que mudam a partida.' },
  { id: 'estrategia', title: 'Pense em planos', level: 'Intermediário', icon: '♜', description: 'Melhore suas peças e crie vantagens duradouras.' },
  { id: 'finais', title: 'Calcule e finalize', level: 'Avançado', icon: '♕', description: 'Use rei, peões e peças com precisão.' }
];

export function gameFromSetup(setup) {
  if (setup.base === 'initial') {
    const game = new Chess();
    for (const move of (setup.prep || '').split(' ').filter(Boolean)) {
      const result = game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] });
      if (!result) throw new Error(`Preparação inválida: ${move}`);
    }
    return game;
  }
  const squares = Object.fromEntries(setup.board.split(' ').map(token => [token.slice(0, 2), token[2]]));
  const rows = [];
  for (let rank = 8; rank >= 1; rank--) {
    let row = '', empty = 0;
    for (const file of 'abcdefgh') {
      const piece = squares[file + rank];
      if (piece) { if (empty) row += empty; empty = 0; row += piece; }
      else empty++;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return new Chess(`${rows.join('/')} ${setup.turn || 'w'} ${setup.rights || '-'} ${setup.ep || '-'} 0 1`);
}

export const lessons = [
  {
    id:'torre', unit:'movimentos', title:'A torre segue linhas', level:'Fundamentos', duration:3,
    setup:{board:'g1K h8k a1R'}, move:'a1a5',
    before:'A torre anda em linha reta, pelas colunas ou fileiras. Ela não salta sobre outras peças.',
    after:'Da casa a1, a torre sobe pela coluna a até a5. Todas as casas do caminho estavam livres.',
    insight:'Antes de mover uma torre, percorra com os olhos todas as casas entre a origem e o destino.',
    practice:{setup:{board:'g1K h8k b2R b7p'}, answer:'b2b7', prompt:'A torre está em b2. Capture o peão preto que está na mesma coluna.', hint:'Olhe para cima na coluna b. A torre alcança b7 sem saltar casas.', success:'A torre percorreu a coluna b e capturou o peão em b7.'}
  },
  {
    id:'bispo', unit:'movimentos', title:'O bispo vê diagonais', level:'Fundamentos', duration:3,
    setup:{board:'g1K h8k c1B'}, move:'c1g5',
    before:'O bispo caminha pelas diagonais e permanece sempre na mesma cor de casa.',
    after:'De c1 até g5, ele passa por d2, e3 e f4. Nenhuma peça bloqueia a diagonal.',
    insight:'Uma boa forma de enxergar o bispo é seguir as diagonais até encontrar a borda ou outra peça.',
    practice:{setup:{board:'g1K h8k b2B e5p'}, answer:'b2e5', prompt:'Capture o peão em e5 usando o bispo de b2.', hint:'Siga a diagonal b2–c3–d4–e5.', success:'O bispo capturou em e5 seguindo uma diagonal livre.'}
  },
  {
    id:'dama', unit:'movimentos', title:'A dama combina caminhos', level:'Fundamentos', duration:3,
    setup:{board:'g1K h8k d1Q'}, move:'d1h5',
    before:'A dama reúne os movimentos da torre e do bispo: linhas retas e diagonais.',
    after:'A dama percorre a diagonal d1–e2–f3–g4–h5. Ela nunca precisa mudar de direção no meio do lance.',
    insight:'O grande alcance da dama é valioso; observe também se a casa de chegada fica protegida.',
    practice:{setup:{board:'g1K h8k b1Q b7p'}, answer:'b1b7', prompt:'Use o movimento de torre da dama para capturar o peão em b7.', hint:'A dama pode subir pela coluna b.', success:'A dama capturou o peão em linha reta, como uma torre.'}
  },
  {
    id:'cavalo', unit:'movimentos', title:'O cavalo salta em L', level:'Fundamentos', duration:3,
    setup:{board:'e1K h8k g1N'}, move:'g1f3',
    before:'O cavalo anda duas casas numa direção e uma para o lado. É a única peça que salta sobre outras.',
    after:'De g1 para f3, ele sobe duas casas e vai uma para a esquerda.',
    insight:'Para encontrar destinos do cavalo, desenhe mentalmente um L a partir da casa onde ele está.',
    practice:{setup:{board:'e1K h8k b1N c3p'}, answer:'b1c3', prompt:'Salte com o cavalo de b1 para capturar o peão em c3.', hint:'C3 fica duas casas acima e uma à direita de b1.', success:'O cavalo saltou em L e capturou o peão em c3.'}
  },
  {
    id:'peao', unit:'movimentos', title:'O peão avança e captura', level:'Fundamentos', duration:3,
    setup:{board:'g1K h8k e2P'}, move:'e2e4',
    before:'Um peão branco avança em direção à oitava fileira. No primeiro lance, pode andar uma ou duas casas.',
    after:'O peão de e2 avança duas casas até e4. Depois disso, seus avanços serão de uma casa.',
    insight:'Para capturar, o peão muda a regra: ele toma uma peça na diagonal, nunca à frente.',
    practice:{setup:{board:'g1K h8k d4P e5p'}, answer:'d4e5', prompt:'Capture o peão preto em e5 com o peão de d4.', hint:'Peões brancos capturam uma casa na diagonal para cima.', success:'O peão capturou na diagonal. Avanço e captura usam caminhos diferentes.'}
  },
  {
    id:'xeque', unit:'regras', title:'Saia do xeque', level:'Fundamentos', duration:3,
    setup:{board:'e1K h8k e8r'}, move:'e1f2',
    before:'A torre preta ataca o rei branco pela coluna e. Quando o rei está ameaçado, você precisa resolver o xeque imediatamente.',
    after:'O rei vai a f2, saindo da coluna atacada pela torre.',
    insight:'Diante de um xeque, procure três saídas: mover o rei, bloquear o ataque ou capturar quem dá xeque.',
    practice:{setup:{board:'d1K h8k d8r'}, answer:'d1c2', prompt:'O rei está em xeque na coluna d. Leve-o a c2 para escapar.', hint:'A torre ataca a coluna d; c2 fica fora dessa linha.', success:'O rei saiu da coluna atacada. O xeque foi resolvido.'}
  },
  {
    id:'captura', unit:'regras', title:'Capture ocupando a casa', level:'Fundamentos', duration:3,
    setup:{board:'g1K h8k a1R a5p'}, move:'a1a5',
    before:'Capturar significa mover sua peça até a casa ocupada por uma peça adversária.',
    after:'A torre chega a a5; o peão preto sai do tabuleiro e a torre ocupa a casa.',
    insight:'Você não pode capturar uma peça sua. Verifique também se o caminho até a peça adversária está livre.',
    practice:{setup:{board:'g1K h8k b2R b6p'}, answer:'b2b6', prompt:'Capture o peão preto da coluna b com a torre.', hint:'A torre pode ir de b2 até b6 pela coluna livre.', success:'A torre tomou o lugar do peão em b6.'}
  },
  {
    id:'roque', unit:'regras', title:'O roque protege o rei', level:'Fundamentos', duration:4,
    setup:{board:'e1K h1R a8k', rights:'K'}, move:'e1g1',
    before:'No roque curto, rei e torre se movem no mesmo lance. O rei anda duas casas em direção à torre.',
    after:'O rei vai para g1 e a torre de h1 passa para f1 automaticamente.',
    insight:'O roque só vale se rei e torre ainda não se moveram, o caminho está livre e o rei não atravessa xeque.',
    practice:{setup:{board:'e1K a1R h8k', rights:'Q'}, answer:'e1c1', prompt:'Faça o roque longo com o rei branco.', hint:'No roque longo, o rei vai de e1 para c1; a torre vai para d1.', success:'Você fez o roque longo: rei em c1 e torre em d1.'}
  },
  {
    id:'promocao', unit:'regras', title:'Promova o peão', level:'Fundamentos', duration:3,
    setup:{board:'e1K h8k a7P'}, move:'a7a8q',
    before:'Quando chega à última fileira, um peão deve virar dama, torre, bispo ou cavalo.',
    after:'O peão chega a a8 e vira dama. Normalmente, a dama é a escolha mais forte.',
    insight:'A promoção acontece no mesmo lance em que o peão alcança a última fileira.',
    practice:{setup:{board:'e1K h7k b7P'}, answer:'b7b8q', prompt:'Leve o peão de b7 à última fileira e transforme-o em dama.', hint:'O peão branco precisa chegar a b8.', success:'O peão virou dama ao chegar à oitava fileira.'}
  },
  {
    id:'en-passant', unit:'regras', title:'Captura en passant', level:'Fundamentos', duration:4,
    setup:{board:'g1K h8k e5P d5p', ep:'d6'}, move:'e5d6',
    before:'Imagine que o peão preto acabou de sair de d7 para d5, passando ao lado do seu peão em e5.',
    after:'O peão branco vai a d6 e captura o peão de d5. É a captura en passant.',
    insight:'Essa oportunidade só existe imediatamente depois do avanço de duas casas do peão adversário.',
    practice:{setup:{board:'g1K h8k c5P b5p', ep:'b6'}, answer:'c5b6', prompt:'O peão preto acabou de avançar de b7 para b5. Capture en passant.', hint:'O peão branco vai a b6, e o peão preto de b5 sai do tabuleiro.', success:'Você capturou en passant na primeira oportunidade.'}
  },
  {
    id:'centro', unit:'abertura', title:'Ocupe o centro', level:'Iniciante', duration:3,
    setup:{base:'initial'}, move:'e2e4',
    before:'As casas centrais são d4, e4, d5 e e5. Peças no centro alcançam mais regiões do tabuleiro.',
    after:'Com e4, o peão ocupa o centro e abre caminho para o bispo e a dama.',
    insight:'Um bom início costuma combinar presença no centro com desenvolvimento de peças.',
    practice:{setup:{base:'initial'}, answer:'d2d4', prompt:'Nesta vez, ocupe o centro com o peão da dama.', hint:'O peão da dama começa em d2. Ele pode ir duas casas no primeiro lance.', success:'D4 ocupa o centro e libera o bispo de c1.'}
  },
  {
    id:'desenvolvimento', unit:'abertura', title:'Desenvolva com propósito', level:'Iniciante', duration:3,
    setup:{base:'initial',prep:'e2e4 e7e5'}, move:'g1f3',
    before:'Desenvolver é tirar uma peça da casa inicial para uma casa ativa, de preferência criando uma ameaça útil.',
    after:'O cavalo vai a f3, ataca o peão de e5 e aproxima-se do centro.',
    insight:'Desenvolver várias peças costuma ser melhor do que mover a mesma peça repetidas vezes no começo.',
    practice:{setup:{base:'initial',prep:'d2d4 d7d5'}, answer:'g1f3', prompt:'Desenvolva um cavalo e ajude a proteger o peão de d4.', hint:'De f3, o cavalo branco protege d4.', success:'O cavalo saiu de g1 para f3 e passou a defender d4.'}
  },
  {
    id:'rei-seguro', unit:'abertura', title:'Coloque o rei em segurança', level:'Iniciante', duration:4,
    setup:{base:'initial',prep:'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5'}, move:'e1g1',
    before:'Bispo e cavalo já saíram do caminho do rei. O roque agora melhora a segurança do rei e ativa a torre.',
    after:'O rei vai para g1, protegido pelos peões, e a torre aparece em f1.',
    insight:'Faça o roque quando o caminho estiver seguro; não espere um ataque começar para pensar no rei.',
    practice:{setup:{base:'initial',prep:'d2d4 d7d5 g1f3 g8f6 e2e3 e7e6 f1d3 f8d6'}, answer:'e1g1', prompt:'Desenvolveu as peças do lado do rei. Complete o plano com o roque curto.', hint:'O rei vai de e1 a g1, e a torre de h1 vai a f1.', success:'O roque colocou o rei em segurança e trouxe a torre para o jogo.'}
  },
  {
    id:'torres-conectadas', unit:'abertura', title:'Conecte as torres', level:'Iniciante', duration:3,
    setup:{board:'g1K a1R f1R d1Q h8k'}, move:'d1d2',
    before:'As torres trabalham melhor juntas. A dama ainda ocupa a primeira fileira e impede que elas se enxerguem.',
    after:'Ao sair para d2, a dama libera a primeira fileira. As torres de a1 e f1 ficam conectadas.',
    insight:'A conexão costuma aparecer depois de desenvolver peças menores, fazer o roque e mover a dama.',
    practice:{setup:{board:'g1K a1R f1R c1Q h8k'}, answer:'c1c2', prompt:'Mova a dama para a segunda fileira e conecte as duas torres.', hint:'A dama em c1 é a peça que bloqueia a primeira fileira.', success:'A dama saiu do caminho e as torres agora podem se apoiar.'}
  },
  {
    id:'espaco', unit:'abertura', title:'Ganhe espaço com peões', level:'Iniciante', duration:3,
    setup:{board:'g1K h8k e4P e6p'}, move:'e4e5',
    before:'Um peão avançado pode controlar casas no território adversário e limitar a liberdade das peças pretas.',
    after:'O peão chega a e5 e passa a controlar d6 e f6.',
    insight:'Ganhar espaço é útil quando o peão pode ser sustentado; avançar sem apoio pode criar fraquezas.',
    practice:{setup:{board:'g1K h8k d4P d6p'}, answer:'d4d5', prompt:'Avance o peão da dama uma casa para ganhar espaço.', hint:'O peão branco em d4 pode avançar a d5, que está livre.', success:'Em d5, o peão controla c6 e e6 e restringe as peças pretas.'}
  },
  {
    id:'mate-em-um', unit:'tatica', title:'Encontre o mate em um', level:'Intermediário', duration:4,
    setup:{board:'f6K g6Q h8k'}, move:'g6g7',
    before:'O rei preto tem poucas casas. Antes de jogar, verifique se sua dama ficará protegida e quais fugas serão cobertas.',
    after:'A dama vai a g7 e dá xeque. O rei branco protege a dama; as casas g8 e h7 também ficam cobertas.',
    insight:'Xeque-mate significa que o rei está em xeque e não existe nenhuma defesa legal.',
    practice:{setup:{board:'f6K g5Q h8k'}, answer:'g5g7', prompt:'Encontre um lance de dama que dê xeque-mate em um.', hint:'A casa g7 fica protegida pelo rei branco e cobre as fugas do rei preto.', success:'Dg7 é mate: o rei preto não pode capturar a dama nem fugir.'}
  },
  {
    id:'garfo', unit:'tatica', title:'O garfo do cavalo', level:'Intermediário', duration:4,
    setup:{board:'g1K e5N h8k d8q'}, move:'e5f7',
    before:'O cavalo em e5 pode alcançar uma casa de onde ataque duas peças valiosas ao mesmo tempo.',
    after:'Cavalo f7 dá xeque ao rei em h8 e ataca a dama em d8. Um lance com duas ameaças é um garfo.',
    insight:'O adversário precisa responder ao xeque; nesta linha, o rei vai a g8 e o cavalo captura a dama em d8.',
    extraMoves:['h8g8','f7d8'],
    extraText:['O rei sai do xeque e vai para g8. A dama ainda está atacada.','O cavalo captura a dama em d8. Outras defesas podem existir em uma partida real.'],
    practice:{setup:{board:'b1K d5N a8k e8q'}, answer:'d5c7', prompt:'Ache um salto que dê xeque ao rei e ataque a dama ao mesmo tempo.', hint:'Procure uma casa que esteja a um salto de cavalo de a8 e de e8.', success:'Cc7+ é um garfo: o cavalo ataca o rei em a8 e a dama em e8.'}
  },
  {
    id:'cravada', unit:'tatica', title:'Prenda uma peça ao rei', level:'Intermediário', duration:4,
    setup:{board:'g1K f1B e8k c6n'}, move:'f1b5',
    before:'O cavalo preto está em c6 e o rei em e8. Uma linha diagonal pode alcançar os dois.',
    after:'Bispo b5 ataca o cavalo em c6. Se o cavalo sair da diagonal, o rei ficará em xeque: ele está cravado.',
    insight:'Uma cravada absoluta impede a peça de sair quando isso deixaria seu próprio rei em xeque.',
    practice:{setup:{board:'g1K c4B e8k c6n'}, answer:'c4b5', prompt:'Coloque o bispo em uma casa que crave o cavalo de c6 ao rei.', hint:'Alinhe bispo, cavalo e rei na diagonal b5–c6–d7–e8.', success:'Bb5 cria uma cravada: o cavalo não pode abandonar a linha do rei.'}
  },
  {
    id:'espeto', unit:'tatica', title:'Ataque em espeto', level:'Intermediário', duration:4,
    setup:{board:'g1K a5R c3B e6k e8q'}, move:'a5e5',
    before:'O rei preto está à frente da dama na coluna e. O bispo branco protege e5.',
    after:'Torre e5 dá xeque ao rei. Quando ele sair da linha, a dama atrás dele poderá ficar exposta: isso é um espeto.',
    insight:'No espeto, a peça mais valiosa está na frente e precisa sair, revelando a peça de trás.',
    practice:{setup:{board:'g1K h5R c3B e6k e8q'}, answer:'h5e5', prompt:'Dê xeque com a torre na coluna e para criar um espeto.', hint:'A torre deve chegar a e5; o bispo em c3 protege essa casa.', success:'Te5+ força o rei a reagir e pode expor a dama em e8.'}
  },
  {
    id:'ataque-descoberto', unit:'tatica', title:'Abra uma linha escondida', level:'Intermediário', duration:4,
    setup:{board:'g1K e1R e3B h8k e8q'}, move:'e3f4',
    before:'O bispo branco em e3 bloqueia a torre de e1. A dama preta está na mesma coluna da torre.',
    after:'O bispo sai para f4, abrindo a coluna e. Agora a torre ataca a dama em e8.',
    insight:'No ataque descoberto, mover uma peça libera o ataque de outra que estava atrás dela.',
    practice:{setup:{board:'g1K d1R d3B h8k d8q'}, answer:'d3e4', prompt:'Mova o bispo e revele o ataque da torre à dama preta.', hint:'A torre está em d1; o bispo em d3 precisa sair da coluna d.', success:'Be4 abre a coluna d e revela o ataque da torre à dama.'}
  },
  {
    id:'peca-solta', unit:'estrategia', title:'Enxergue a peça solta', level:'Intermediário', duration:3,
    setup:{board:'g1K a1R h8k a5b'}, move:'a1a5',
    before:'Uma peça solta não está defendida. O bispo preto em a5 está ao alcance da torre.',
    after:'A torre captura o bispo em a5. Observar peças indefesas evita perder oportunidades simples.',
    insight:'Antes de buscar combinações difíceis, pergunte: há alguma peça adversária sem proteção?',
    practice:{setup:{board:'g1K b1R h8k b5b'}, answer:'b1b5', prompt:'Encontre e capture o bispo preto sem defesa.', hint:'O bispo está na mesma coluna da torre, e o caminho está livre.', success:'A torre capturou a peça solta em b5.'}
  },
  {
    id:'troca-favoravel', unit:'estrategia', title:'Escolha trocas favoráveis', level:'Intermediário', duration:3,
    setup:{board:'g1K c4B h8k f7r'}, move:'c4f7',
    before:'Na avaliação básica, bispo e cavalo valem cerca de três peões; a torre vale cerca de cinco.',
    after:'O bispo captura a torre em f7. Mesmo se o bispo for capturado depois, a troca pode render vantagem material.',
    insight:'Conte o que você ganha e o que pode perder antes de iniciar uma troca.',
    practice:{setup:{board:'g1K e5N h8k f7r'}, answer:'e5f7', prompt:'Capture a torre com uma peça de menor valor.', hint:'O cavalo em e5 pode saltar para f7.', success:'O cavalo capturou uma torre: uma troca material favorável.'}
  },
  {
    id:'coluna-aberta', unit:'estrategia', title:'Use a coluna aberta', level:'Intermediário', duration:3,
    setup:{board:'g1K b1R h8k'}, move:'b1e1',
    before:'A coluna e não tem peões. Uma torre colocada nela pode atuar por toda a coluna.',
    after:'A torre vai a e1 e passa a mirar as casas da coluna aberta.',
    insight:'Torres ganham alcance em colunas sem peões, especialmente quando podem penetrar na posição adversária.',
    practice:{setup:{board:'g1K c1R h8k'}, answer:'c1d1', prompt:'Coloque a torre na coluna d, que está aberta.', hint:'A torre se move horizontalmente de c1 para d1.', success:'A torre ocupa a coluna d e ganha espaço para atuar.'}
  },
  {
    id:'posto-avancado', unit:'estrategia', title:'Instale um cavalo forte', level:'Intermediário', duration:4,
    setup:{board:'g1K e3N c4P h8k c5p e5p'}, move:'e3d5',
    before:'A casa d5 é protegida pelo peão branco em c4. Os peões pretos de c5 e e5 não podem expulsar um cavalo dessa casa.',
    after:'O cavalo ocupa d5, uma casa avançada estável chamada posto avançado.',
    insight:'Um bom posto avançado combina apoio dos seus peões com ausência de peões adversários capazes de atacar a casa.',
    practice:{setup:{board:'g1K f4N e4P h8k c5p e5p'}, answer:'f4d5', prompt:'Leve o cavalo a uma casa avançada protegida pelo seu peão.', hint:'O peão branco de e4 protege d5.', success:'O cavalo chegou a d5, apoiado pelo peão e difícil de expulsar.'}
  },
  {
    id:'peao-passado', unit:'estrategia', title:'Avance o peão passado', level:'Intermediário', duration:3,
    setup:{board:'g1K a5P h8k c6p'}, move:'a5a6',
    before:'O peão branco da coluna a não encontra peões pretos nas colunas a ou b à sua frente: é um peão passado.',
    after:'Avançando para a6, ele se aproxima da promoção e exige atenção do adversário.',
    insight:'Peões passados ficam mais fortes quanto mais perto chegam da última fileira, desde que não sejam perdidos.',
    practice:{setup:{board:'g1K h5P a8k f6p'}, answer:'h5h6', prompt:'Avance o peão passado da coluna h.', hint:'Não há peões pretos nas colunas g ou h para barrá-lo.', success:'O peão passado chegou a h6 e ficou mais perto de promover.'}
  },
  {
    id:'rei-ativo', unit:'finais', title:'Ative o rei no final', level:'Avançado', duration:3,
    setup:{board:'e2K d4P h8k'}, move:'e2d3',
    before:'Com poucas peças no tabuleiro, o rei pode deixar o abrigo e ajudar seus peões.',
    after:'O rei se aproxima do centro e do peão de d4, pronto para apoiá-lo.',
    insight:'No final, o rei é uma peça ativa. Centralize-o sem entrar em uma casa atacada.',
    practice:{setup:{board:'f2K e4P a8k'}, answer:'f2e3', prompt:'Aproxime o rei do centro e do peão branco.', hint:'A casa e3 fica perto do peão de e4.', success:'O rei chegou a e3 e poderá apoiar o avanço do peão.'}
  },
  {
    id:'oposicao', unit:'finais', title:'Ganhe a oposição', level:'Avançado', duration:4,
    setup:{board:'e3K e6k'}, move:'e3e4',
    before:'Na oposição, os reis ficam frente a frente com uma casa entre eles. Quem precisa jogar geralmente cede passagem.',
    after:'O rei branco vai a e4. Os reis ficam em e4 e e6, com e5 entre eles; agora é a vez das pretas.',
    insight:'A oposição ajuda a conquistar espaço em finais de rei e peões, mas depende de quem tem a vez.',
    practice:{setup:{board:'d3K d6k'}, answer:'d3d4', prompt:'Coloque os reis em oposição direta e passe a vez às pretas.', hint:'Entre d4 e d6 existe uma casa: d5.', success:'Rei d4 estabelece a oposição direta contra o rei em d6.'}
  },
  {
    id:'torre-atras', unit:'finais', title:'Torre atrás do peão', level:'Avançado', duration:4,
    setup:{board:'g1K a1R a5P h8k'}, move:'a1a4',
    before:'Uma torre costuma apoiar melhor um peão passado por trás, mantendo espaço para o peão avançar.',
    after:'A torre vai a a4, logo atrás do peão em a5, e pode acompanhá-lo pela coluna.',
    insight:'Torre atrás do peão passado é uma regra prática; sempre confira os lances concretos da posição.',
    practice:{setup:{board:'g2K h1R h5P a8k'}, answer:'h1h4', prompt:'Posicione a torre atrás do peão branco da coluna h.', hint:'O peão está em h5; a casa imediatamente atrás é h4.', success:'A torre chegou a h4 e passou a apoiar o peão de h5 por trás.'}
  },
  {
    id:'xeque-duplo', unit:'finais', title:'Calcule o xeque duplo', level:'Avançado', duration:4,
    setup:{board:'g1K e1R e2B e8k'}, move:'e2b5',
    before:'O bispo bloqueia a torre na coluna e. Existe uma casa onde ele pode sair da coluna e ainda atacar o rei.',
    after:'Bispo b5 dá xeque pela diagonal e libera a torre para dar xeque pela coluna: dois ataques ao rei no mesmo lance.',
    insight:'Contra um xeque duplo, bloquear ou capturar apenas uma das peças não basta; o rei precisa se mover.',
    practice:{setup:{board:'g1K d1R d2B d8k'}, answer:'d2a5', prompt:'Encontre o lance de bispo que também abre a coluna da torre e cria xeque duplo.', hint:'De a5, o bispo alcança d8 pela diagonal; a torre fica livre na coluna d.', success:'Ba5+ ataca pela diagonal e revela o xeque da torre na coluna d.'}
  },
  {
    id:'mate-torre', unit:'finais', title:'Feche a rede de mate', level:'Avançado', duration:4,
    setup:{board:'f7K a1R h8k'}, move:'a1h1',
    before:'O rei branco cobre g8 e g7. A torre pode ocupar a coluna h e cortar as outras fugas.',
    after:'Torre h1 dá xeque pela coluna. O rei preto não pode ir a h7, g7 ou g8: é mate.',
    insight:'O mate de torre funciona quando o rei aliado cobre as casas de fuga que a torre não alcança.',
    practice:{setup:{board:'c7K h1R a8k'}, answer:'h1a1', prompt:'Use a torre para dar mate ao rei em a8.', hint:'O rei branco cobre b8 e b7. A torre precisa controlar a coluna a.', success:'Ta1 é mate: a torre controla a coluna a e o rei branco cobre as outras fugas.'}
  }
];
