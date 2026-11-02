import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const dom=new JSDOM(html,{url:'https://example.test/'});
for (const key of ['window','document','location','history','localStorage']) globalThis[key]=dom.window[key];
dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
await import('../dist/app.js');

function assert(condition,message) { if (!condition) throw new Error(message); }
function click(selector) {
  const element=document.querySelector(selector);
  assert(element,`Elemento ausente: ${selector}`);
  element.click();
}
function square(name) {
  const element=[...document.querySelectorAll('#board button')].find(item=>item.getAttribute('aria-label')?.startsWith(`${name},`));
  assert(element,`Casa ausente: ${name}`);
  element.click();
}
function openLesson(unitIndex,lessonIndex) {
  document.querySelectorAll('.unit-card')[unitIndex].click();
  document.querySelectorAll('.lesson-chip')[lessonIndex].click();
}

assert(document.querySelectorAll('.unit-card').length===6,'Deveria mostrar seis módulos');
assert(document.querySelectorAll('#board button').length===64,'O tabuleiro deve ter 64 casas');
assert(document.querySelector('#lesson-title').textContent==='A torre segue linhas','A trilha deve iniciar pelos fundamentos');
click('#next-btn'); click('#next-btn'); click('#practice-btn');
square('b2'); square('b7');
assert(document.querySelector('#board-status').textContent==='Concluído','A primeira aula não concluiu');
assert(localStorage.getItem('xadrez-professor-progress-v1').includes('torre'),'Progresso não salvo');

openLesson(3,1); click('#practice-btn'); square('d5'); square('c7');
assert(document.querySelector('#board-status').textContent==='Concluído','Desafio do garfo falhou');
assert(document.querySelector('#copy-body').textContent.includes('Cc7+'),'Explicação do garfo ausente');

openLesson(1,2); click('#practice-btn'); square('e1'); square('c1');
assert(document.querySelector('#board-status').textContent==='Concluído','Roque longo falhou');
assert(document.querySelector('#board button[aria-label^="c1,"]').getAttribute('aria-label').includes('rei branco'),'Rei não chegou a c1');
assert(document.querySelector('#board button[aria-label^="d1,"]').getAttribute('aria-label').includes('torre branca'),'Torre não chegou a d1');

openLesson(1,4); click('#practice-btn'); square('c5'); square('b6');
assert(document.querySelector('#board-status').textContent==='Concluído','En passant falhou');
assert(document.querySelector('#board button[aria-label^="b5,"]').getAttribute('aria-label').includes('vazia'),'Peão capturado en passant permaneceu no tabuleiro');

assert(document.querySelector('#header-progress').textContent==='4 / 30 aulas','Contagem de progresso incorreta');
console.log('Fluxos validados: replay, garfo, roque, en passant e progresso.');
