import { lessons, units, gameFromSetup } from '../dist/lessons.js';

const ids = new Set();
const errors = [];
for (const lesson of lessons) {
  if (ids.has(lesson.id)) errors.push(`${lesson.id}: ID duplicado`);
  ids.add(lesson.id);
  if (!units.some(unit => unit.id === lesson.unit)) errors.push(`${lesson.id}: unidade desconhecida`);
  for (const [kind, setup, move] of [
    ['demonstração', lesson.setup, lesson.move],
    ['desafio', lesson.practice.setup, lesson.practice.answer]
  ]) {
    try {
      const game = gameFromSetup(setup);
      const result = game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] });
      if (!result) errors.push(`${lesson.id}: lance ilegal na ${kind}: ${move}`);
    } catch (error) { errors.push(`${lesson.id}: ${kind}: ${error.message}`); }
  }
  if (lesson.extraMoves) {
    try {
      const game = gameFromSetup(lesson.setup);
      game.move({ from: lesson.move.slice(0, 2), to: lesson.move.slice(2, 4), promotion: lesson.move[4] });
      for (const move of lesson.extraMoves) game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] });
    } catch (error) { errors.push(`${lesson.id}: sequência extra: ${error.message}`); }
  }
}
if (lessons.length !== 30) errors.push(`Esperadas 30 aulas, encontradas ${lessons.length}`);
for (const id of ['mate-em-um','mate-torre']) {
  const lesson = lessons.find(item => item.id === id);
  if (!lesson) continue;
  for (const [kind, setup, move] of [
    ['demonstração', lesson.setup, lesson.move],
    ['desafio', lesson.practice.setup, lesson.practice.answer]
  ]) {
    try {
      const game = gameFromSetup(setup);
      game.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] });
      if (!game.isCheckmate()) errors.push(`${id}: ${kind} não termina em mate`);
    } catch (error) { errors.push(`${id}: ${kind}: ${error.message}`); }
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`${lessons.length} aulas validadas: posições, lances e mates.`);
