import { Board, fromIndex } from "./Board";
import { Coord, shuffle } from "./utils";

const Red = "🟥";
const Yellow = "🟨";
const Blue = "🟦";
const White = "⬜";
const Green = "🟩";
const Orange = "🟩";
const Empty = "";

function generateLayout() {
  return shuffle([
    ...[Red, Yellow, Blue, White, Green, Orange].map((p) => [p, p, p, p]).flat(),
    Empty,
  ]);
}

export class Game {
  private board: Board;
  wins = 0;
  moves = 0;
  goalLayout!: string[];

  constructor() {
    const frameEl = document.querySelector(".board-container .container .frame") as HTMLDivElement;
    this.board = new Board(frameEl, this.onClick.bind(this));
    this.restart();

    const goalEl = document.querySelector(".foobar .frame") as HTMLDivElement;
    this.board = new Board(goalEl, this.onClick.bind(this));
  }

  private onClick(coord: Coord, value: string) {
    console.log(coord, value);
  }

  restart() {
    const layout = generateLayout();
    layout.forEach((p, idx) => this.board.set(fromIndex(idx), p));

    this.goalLayout = generateLayout();
  }
}
