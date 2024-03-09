import { Board } from "./Board";
import { Coord, shuffle } from "./utils";

const Red = "🟥";
const Yellow = "🟨";
const Blue = "🟦";
const White = "⬜";
const Green = "🟩";
const Orange = "🟧";
const Empty = "";

function generateLayout() {
  return shuffle([
    ...[Red, Yellow, Blue, White, Green, Orange].map((p) => [p, p, p, p]).flat(),
    Empty,
  ]);
}

export class Game {
  private board: Board;
  private goalBoard: Board;

  wins = 0;
  moves = 0;
  goalLayout!: string[];

  constructor() {
    const gameBoardEl = document.querySelector("#board-container") as HTMLDivElement;
    const goalBoardEl = document.querySelector("#goal-container") as HTMLDivElement;
    this.board = new Board(gameBoardEl, {
      width: 5,
      height: 5,
      onClick: this.onClick.bind(this),
      cellStyle: (coord) => {
        if (coord[0] === 0 || coord[1] === 0 || coord[0] === 4 || coord[1] === 4) {
          return "opacity: 0.3;";
        }
      },
    });

    this.goalBoard = new Board(goalBoardEl, { width: 3, height: 3 });
  }

  private onClick(coord: Coord, value: string) {
    // Find the blank on this axis.
    const empty = this.board.find((v) => v === Empty);

    if (empty === undefined) {
      return;
    }

    const deltaX = empty.coord[0] - coord[0];
    const deltaY = empty.coord[1] - coord[1];

    if (deltaX === 0 || deltaY === 0) {
      console.log(deltaX, deltaY);
    }
  }

  restart() {
    const layout = generateLayout();
    layout.forEach((p, idx) => this.board.set(this.board.fromIndex(idx), p));

    this.goalLayout = generateLayout().slice(0, 9);
    this.goalLayout.forEach((p, idx) => {
      this.goalBoard.set(this.goalBoard.fromIndex(idx), p);
    });
  }
}
