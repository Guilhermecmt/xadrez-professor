# Xadrez Professor

Curso interativo de xadrez em português. São 30 microaulas em seis módulos, dos movimentos das peças a táticas, estratégia e finais. Cada aula mostra uma posição, reproduz os lances com explicações e pede que o aluno aplique a ideia em outra posição.

**Demo pública:** [guilhermecmt.github.io/xadrez-professor](https://guilhermecmt.github.io/xadrez-professor/)

## O que já funciona

- Tabuleiro interativo com movimentos legais validados por [chess.js](https://github.com/jhlywa/chess.js).
- Replay com pausa, avanço e retorno, sincronizado com as explicações.
- Um desafio por aula, com feedback para lances ilegais ou que não cumprem o objetivo.
- Dicas sob demanda e revisão sugerida após erros ou uso de dicas.
- Progresso salvo no navegador, sem cadastro ou servidor.
- Layout responsivo para computador e celular.

## Trilha

| Módulo | Temas |
| --- | --- |
| Conheça as peças | Torre, bispo, dama, cavalo e peão |
| Regras do jogo | Xeque, captura, roque, promoção e *en passant* |
| Comece bem | Centro, desenvolvimento, segurança do rei, torres conectadas e espaço |
| Encontre a tática | Mate em um, garfo, cravada, espeto e ataque descoberto |
| Pense em planos | Peça solta, troca favorável, coluna aberta, posto avançado e peão passado |
| Calcule e finalize | Rei ativo, oposição, torre atrás do peão, xeque duplo e mate de torre |

## Executar localmente

Requer Node.js 22 ou superior para os testes. O site em si é estático.

```bash
npm ci
npm run check
python -m http.server 8000 --directory dist
```

Abra o endereço local exibido pelo servidor. Também é possível servir `dist/` com qualquer servidor HTTP estático.

## Organização

- `dist/lessons.js`: conteúdo e posições das 30 aulas.
- `dist/app.js`: navegação, tabuleiro, replay, desafios e progresso.
- `dist/index.html`, `dist/style.css`, `dist/course.css`: interface.
- `scripts/validate-lessons.js`: verifica posições e lances com as regras do xadrez.
- `scripts/test-course.js`: percorre os fluxos de replay, garfo, roque, *en passant* e progresso.

O projeto está em fase de validação pedagógica. As posições e os lances são conferidos automaticamente; as explicações ainda precisam de observação com alunos e revisão de um instrutor. O código de terceiros incluído em `dist/vendor/` conserva sua licença BSD-2-Clause.
