import { Board, fromIndex } from "./Board";
import { shuffle } from "./utils";

const pieces = {
  Red: "🟥",
  Yellow: "🟨",
  Blue: "🟦",
  White: "⬜",
  Green: "🟩",
  Orange: "🟩",
};

const Empty = "";

export class Game {
  board: Board;

  constructor() {
    this.board = new Board();
  }

  restart() {
    const layout = shuffle([
      ...Object.values(pieces)
        .map((p) => [p, p, p, p])
        .flat(),
      Empty,
    ]);

    layout.forEach((p, idx) => this.board.set(fromIndex(idx), p));
  }
}
