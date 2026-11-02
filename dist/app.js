import { lessons, units, gameFromSetup } from './lessons.js';

const $ = id => document.getElementById(id);
const files = 'abcdefgh';
const symbols = { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙', k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟' };
const names = { K:'rei branco', Q:'dama branca', R:'torre branca', B:'bispo branco', N:'cavalo branco', P:'peão branco', k:'rei preto', q:'dama preta', r:'torre preta', b:'bispo preto', n:'cavalo preto', p:'peão preto' };
const board = $('board');
const squareNodes = new Map();
const pieceNodes = new Map();
let progress = loadProgress();
let current = lessons[0];
let selectedUnit = current.unit;
let frames = [];
let step = 0;
let mode = 'demo';
let practiceGame = null;
let selected = null;
let attempts = 0;
let hints = 0;
let timer = null;

function loadProgress() {
  try { return JSON.parse(localStorage.getItem('xadrez-professor-progress-v1') || '{}'); }
  catch { return {}; }
}
function saveProgress() {
  try { localStorage.setItem('xadrez-professor-progress-v1', JSON.stringify(progress)); }
  catch { /* A aula continua funcionando quando o navegador bloqueia armazenamento. */ }
}
function moveObject(uci) { return { from:uci.slice(0,2), to:uci.slice(2,4), promotion:uci[4] }; }
function squareDistance(a,b) {
  return Math.abs(files.indexOf(a[0])-files.indexOf(b[0])) + Math.abs(Number(a[1])-Number(b[1]));
}
function piecePositions(game) {
  const result = new Map();
  game.board().forEach((row, rowIndex) => row.forEach((piece, columnIndex) => {
    if (!piece) return;
    const code = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
    const square = files[columnIndex] + (8-rowIndex);
    if (!result.has(code)) result.set(code, []);
    result.get(code).push(square);
  }));
  return result;
}
function pieceTransform(square) {
  return `translate(${files.indexOf(square[0])*100}%, ${(8-Number(square[1]))*100}%)`;
}
function ensureSquares() {
  if (squareNodes.size) return;
  for (let rank=8; rank>=1; rank--) for (let column=0; column<8; column++) {
    const square = files[column] + rank;
    const button = document.createElement('button');
    button.type='button';
    button.addEventListener('click', () => chooseSquare(square));
    if (column===0) { const label=document.createElement('span'); label.className='rank-label'; label.textContent=rank; button.append(label); }
    board.append(button);
    squareNodes.set(square,button);
  }
}
function drawBoard(game, marked=[], last=[]) {
  ensureSquares();
  const positions=piecePositions(game);
  const lookup=new Map();
  for (const [code,squares] of positions) for (const square of squares) lookup.set(square,code);
  const legalTargets = selected && mode==='practice'
    ? new Set(practiceGame.moves({square:selected,verbose:true}).map(move => move.to)) : new Set();
  for (const [square,button] of squareNodes) {
    const column=files.indexOf(square[0]), rank=Number(square[1]);
    button.className=`square ${(column+rank)%2 ? 'light':'dark'}`;
    if (marked.includes(square)) button.classList.add('attacked');
    if (last.includes(square)) button.classList.add('last-move');
    if (mode==='practice') button.classList.add('selectable');
    if (selected===square) button.classList.add('selected');
    if (legalTargets.has(square)) button.classList.add('target');
    button.setAttribute('aria-label',`${square}${lookup.has(square)?', '+names[lookup.get(square)]:', vazia'}`);
  }
  const allCodes=new Set([...positions.keys(),...pieceNodes.keys()]);
  for (const code of allCodes) {
    const destinations=[...(positions.get(code)||[])];
    const slots=pieceNodes.get(code)||[];
    while (slots.length<destinations.length) {
      const element=document.createElement('span');
      element.className=`piece ${code===code.toUpperCase()?'white':'black'}`;
      element.textContent=symbols[code]; element.setAttribute('aria-hidden','true');
      board.append(element);
      slots.push({element,square:null});
    }
    pieceNodes.set(code,slots);
    const unassigned=[...destinations];
    for (const slot of slots) {
      if (!unassigned.length) { slot.element.style.opacity='0'; continue; }
      let best=0;
      if (slot.square) for (let i=1;i<unassigned.length;i++)
        if (squareDistance(slot.square,unassigned[i])<squareDistance(slot.square,unassigned[best])) best=i;
      const square=unassigned.splice(best,1)[0];
      slot.square=square;
      slot.element.style.transform=pieceTransform(square);
      slot.element.style.opacity='1';
    }
  }
}
function createFrames(lesson) {
  const game=gameFromSetup(lesson.setup);
  const result=[{fen:game.fen(), kicker:'OLHE A POSIÇÃO', title:'Observe o tabuleiro.', body:lesson.before, note:'Veja o lance, volte e avance no seu ritmo.', marked:[], last:[]}];
  const first=game.move(moveObject(lesson.move));
  result.push({fen:game.fen(), kicker:`LANCE · ${first.san}`, title:'Veja o lance em ação.', body:lesson.after, note:`Lance demonstrado: ${first.san}`, marked:[], last:[first.from,first.to]});
  for (let i=0;i<(lesson.extraMoves||[]).length;i++) {
    const move=game.move(moveObject(lesson.extraMoves[i]));
    result.push({fen:game.fen(), kicker:`RESPOSTA · ${move.san}`, title:'Acompanhe a sequência.', body:lesson.extraText[i], note:`Lance demonstrado: ${move.san}`, marked:[], last:[move.from,move.to]});
  }
  result.push({fen:game.fen(), kicker:'IDEIA PRINCIPAL', title:'Guarde esta ideia.', body:lesson.insight, note:'Agora resolva uma posição diferente.', marked:[], last:[]});
  return result;
}
function stopPlayback() {
  if (timer) clearInterval(timer);
  timer=null;
  $('play-icon').textContent='▶'; $('play-label').textContent='Reproduzir';
  $('play-btn').setAttribute('aria-label','Reproduzir demonstração');
}
function updatePlaybackLabel() {
  $('play-icon').textContent='Ⅱ'; $('play-label').textContent='Pausar';
  $('play-btn').setAttribute('aria-label','Pausar demonstração');
}
function renderDemo() {
  mode='demo'; selected=null;
  const frame=frames[step];
  drawBoard(gameFromFen(frame.fen),frame.marked,frame.last);
  $('board-heading').textContent='Observe o lance'; $('board-status').textContent='Demonstração';
  $('step-count').textContent=`${String(step+1).padStart(2,'0')} / ${String(frames.length).padStart(2,'0')}`;
  $('progress-fill').style.width=`${Math.round((step+1)/frames.length*100)}%`;
  $('copy-kicker').textContent=frame.kicker; $('copy-title').textContent=frame.title; $('copy-body').textContent=frame.body;
  $('board-note').innerHTML=`<span class="note-spark">✦</span> ${frame.note}`;
  $('prev-btn').disabled=step===0; $('next-btn').disabled=step===frames.length-1;
  $('practice-btn').firstChild.textContent=step===frames.length-1?'Agora é sua vez ':'Pular para o desafio ';
  $('demo-controls').classList.remove('hidden'); $('practice-controls').classList.add('hidden'); $('success-controls').classList.add('hidden');
}
function gameFromFen(fen) {
  const game=gameFromSetup({board:'e1K e8k'});
  game.load(fen);
  return game;
}
function goToStep(value) { stopPlayback(); step=Math.max(0,Math.min(frames.length-1,value)); renderDemo(); }
function play() {
  if (timer) { stopPlayback(); return; }
  if (step===frames.length-1) step=0;
  renderDemo(); updatePlaybackLabel();
  timer=setInterval(() => {
    if (step<frames.length-1) { step++; renderDemo(); updatePlaybackLabel(); }
    else stopPlayback();
  },1900);
}
function showMessage(message, error=false) {
  $('hint-box').textContent=message;
  $('hint-box').classList.toggle('error',error);
}
function startPractice() {
  stopPlayback(); mode='practice'; practiceGame=gameFromSetup(current.practice.setup);
  selected=null; attempts=0; hints=0;
  drawBoard(practiceGame);
  $('board-heading').textContent='Encontre o lance'; $('board-status').textContent='Sua vez';
  $('step-count').textContent='DESAFIO'; $('progress-fill').style.width='82%';
  $('copy-kicker').textContent='APLIQUE O QUE APRENDEU'; $('copy-title').textContent='Agora é com você.';
  $('copy-body').textContent=current.practice.prompt;
  $('board-note').innerHTML='<span class="note-spark">✦</span> Toque na peça e escolha uma casa de destino.';
  showMessage('Toque na peça que deseja mover e depois na casa escolhida.');
  $('demo-controls').classList.add('hidden'); $('practice-controls').classList.remove('hidden'); $('success-controls').classList.add('hidden');
}
function chooseSquare(square) {
  if (mode!=='practice') return;
  const piece=practiceGame.get(square);
  if (!selected) {
    if (piece && piece.color===practiceGame.turn()) { selected=square; drawBoard(practiceGame); showMessage('Peça selecionada. Escolha a casa de destino.'); }
    else showMessage('Selecione uma peça da cor que deve jogar.',true);
    return;
  }
  if (piece && piece.color===practiceGame.turn()) {
    selected=selected===square?null:square; drawBoard(practiceGame);
    showMessage(selected?'Peça selecionada. Escolha a casa de destino.':'Seleção cancelada.');
    return;
  }
  const candidates=practiceGame.moves({square:selected,verbose:true}).filter(move => move.to===square);
  const chosen=candidates.find(move => move.promotion==='q')||candidates[0];
  if (!chosen) {
    attempts++;
    showMessage('Esse movimento não é legal nesta posição. Observe o caminho da peça e a segurança do rei.',true);
    selected=null; drawBoard(practiceGame); return;
  }
  const answer=current.practice.answer;
  const correct=chosen.from===answer.slice(0,2) && chosen.to===answer.slice(2,4) && (!answer[4] || chosen.promotion===answer[4]);
  if (!correct) {
    attempts++; selected=null; drawBoard(practiceGame);
    showMessage(`Esse lance é legal, mas não cumpre o objetivo da aula. ${attempts>=2?current.practice.hint:'Tente enxergar a ideia demonstrada.'}`,true);
    return;
  }
  practiceGame.move(moveObject(answer)); selected=null; finishLesson(chosen);
}
function giveHint() {
  hints++;
  showMessage(hints===1?current.practice.hint:`Casa de destino: ${current.practice.answer.slice(2,4)}. Procure qual peça chega até lá.`);
}
function resetPractice() {
  practiceGame=gameFromSetup(current.practice.setup); selected=null; drawBoard(practiceGame);
  showMessage('Posição reiniciada. Tente encontrar o lance novamente.');
}
function finishLesson(move) {
  mode='success'; drawBoard(practiceGame,[move.to],[move.from,move.to]);
  $('board-heading').textContent='Você encontrou!'; $('board-status').textContent='Concluído';
  $('step-count').textContent='CONCLUÍDO'; $('progress-fill').style.width='100%';
  $('copy-kicker').textContent=`MUITO BEM · ${move.san}`; $('copy-title').textContent='Ideia aplicada!';
  $('copy-body').textContent=current.practice.success;
  $('board-note').innerHTML='<span class="note-spark">✦</span> Você resolveu uma posição diferente da demonstração.';
  $('success-box').textContent=attempts+hints>0?'✓ Aula concluída. Ela voltará como revisão para consolidar a ideia.':'✓ Aula concluída sem dicas. Você reconheceu a ideia em outra posição.';
  $('practice-controls').classList.add('hidden'); $('success-controls').classList.remove('hidden');
  const needsReview=attempts>0||hints>0;
  progress[current.id]={completedAt:Date.now(),attempts,hints,needsReview,nextReviewAt:needsReview?Date.now()+24*60*60*1000:null};
  saveProgress(); renderCurriculum();
  $('next-lesson-btn').firstChild.textContent=lessons.indexOf(current)===lessons.length-1?'Voltar à primeira aula ':'Próxima aula ';
}
function completedCount() { return lessons.filter(lesson => progress[lesson.id]?.completedAt).length; }
function recommendedLesson() {
  const now=Date.now();
  return lessons.find(lesson => progress[lesson.id]?.needsReview && progress[lesson.id]?.nextReviewAt<=now)
    || lessons.find(lesson => !progress[lesson.id]?.completedAt)
    || lessons[0];
}
function renderCurriculum() {
  const completed=completedCount();
  $('header-progress').textContent=`${completed} / ${lessons.length} aulas`;
  $('summary-number').textContent=lessons.length;
  $('summary-copy').textContent=completed?`${completed} aulas concluídas`:'Comece pelo primeiro lance';
  $('summary-fill').style.width=`${completed/lessons.length*100}%`;
  const grid=$('unit-grid'); grid.replaceChildren();
  for (const unit of units) {
    const members=lessons.filter(lesson => lesson.unit===unit.id);
    const done=members.filter(lesson => progress[lesson.id]?.completedAt).length;
    const button=document.createElement('button'); button.type='button';
    button.className=`unit-card${selectedUnit===unit.id?' active':''}`;
    button.innerHTML=`<span class="unit-icon" aria-hidden="true">${unit.icon}</span><span><strong>${unit.title}</strong><small>${unit.level} · ${done}/${members.length} aulas</small></span>`;
    button.setAttribute('aria-pressed',String(selectedUnit===unit.id));
    button.addEventListener('click',()=>selectLesson(members[0].id,true));
    grid.append(button);
  }
  const unit=units.find(item=>item.id===selectedUnit);
  const members=lessons.filter(lesson=>lesson.unit===selectedUnit);
  const done=members.filter(lesson=>progress[lesson.id]?.completedAt).length;
  $('selected-unit-title').textContent=unit.title;
  $('selected-unit-progress').textContent=`${done} de ${members.length} concluídas`;
  const list=$('lesson-list'); list.replaceChildren();
  for (const lesson of members) {
    const item=progress[lesson.id];
    const button=document.createElement('button'); button.type='button';
    button.className=`lesson-chip${current.id===lesson.id?' active':''}${item?.completedAt?' done':''}${item?.needsReview?' needs-review':''}`;
    const order=String(lessons.indexOf(lesson)+1).padStart(2,'0');
    const status=item?.needsReview?'REVISAR':item?.completedAt?'CONCLUÍDA':`AULA ${order}`;
    const small=document.createElement('small'); small.textContent=status;
    const name=document.createElement('span'); name.textContent=lesson.title;
    button.append(small,name); button.addEventListener('click',()=>selectLesson(lesson.id,true));
    list.append(button);
  }
}
function selectLesson(id,scroll=false) {
  stopPlayback();
  current=lessons.find(lesson=>lesson.id===id)||lessons[0];
  selectedUnit=current.unit; frames=createFrames(current); step=0; mode='demo'; selected=null;
  const number=String(lessons.indexOf(current)+1).padStart(2,'0');
  $('lesson-eyebrow').textContent=`AULA ${number} · ${current.level.toUpperCase()}`;
  $('lesson-title').textContent=current.title;
  $('lesson-subtitle').textContent=units.find(unit=>unit.id===current.unit).description;
  $('lesson-duration').textContent=`${current.duration} minutos`;
  $('course-position').textContent=`${number} / ${lessons.length} · Aula atual`;
  document.title=`${current.title} — Xadrez Professor`;
  const url=new URL(location.href); url.searchParams.set('aula',current.id); history.replaceState(null,'',url);
  renderCurriculum(); renderDemo();
  if (scroll) $('lesson-title').scrollIntoView({behavior:'smooth',block:'start'});
}

$('prev-btn').addEventListener('click',()=>goToStep(step-1));
$('next-btn').addEventListener('click',()=>goToStep(step+1));
$('play-btn').addEventListener('click',play);
$('practice-btn').addEventListener('click',startPractice);
$('hint-btn').addEventListener('click',giveHint);
$('reset-btn').addEventListener('click',resetPractice);
$('replay-again-btn').addEventListener('click',()=>selectLesson(current.id,false));
$('next-lesson-btn').addEventListener('click',()=>{
  const next=lessons[lessons.indexOf(current)+1]||lessons[0]; selectLesson(next.id,true);
});
$('recommended-btn').addEventListener('click',()=>selectLesson(recommendedLesson().id,true));

const requested=new URL(location.href).searchParams.get('aula');
selectLesson(lessons.some(lesson=>lesson.id===requested)?requested:recommendedLesson().id);
