import { Board } from "./Board";
import { Coord, shuffle, sleep } from "./utils";

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
    });

    this.goalBoard = new Board(goalBoardEl, { width: 3, height: 3 });
  }

  private async onClick(coord: Coord, value: string) {
    const empty = this.board.find((v) => v === Empty)!;

    // Don't move if clicked on empty.
    if (value === Empty) {
      return;
    }

    const deltaX = empty.coord[0] - coord[0];
    const deltaY = empty.coord[1] - coord[1];
    const count = Math.abs(deltaX + deltaY);

    const diffX = deltaX === 0 ? 0 : deltaX / Math.abs(deltaX);
    const diffY = deltaY === 0 ? 0 : deltaY / Math.abs(deltaY);

    // Don't allow diagonals.
    if (diffX && diffY) {
      return;
    }

    const promises = [];

    for (let n = 0; n < count; n++) {
      const origin: Coord = [empty.coord[0] - diffX * (n + 1), empty.coord[1] - diffY * (n + 1)];
      const destination: Coord = [origin[0] + diffX, origin[1] + diffY];

      const run = async () => {
        await this.board.animateMove(origin, [diffX, diffY]);
        this.board.set(destination, this.board.get(origin));
        this.board.set(origin, "");
      };
      promises.push(run);
    }

    await Promise.all(promises.map((p) => p()));

    this.highlightMatches();

    this.checkForWin();
  }

  isMatch(goalCoord: Coord) {
    const goalValue = this.goalBoard.get(goalCoord);
    const boardValue = this.board.get([goalCoord[0] + 1, goalCoord[1] + 1]);
    return goalValue === boardValue;
  }

  checkForWin() {
    const matches = this.goalBoard.map((value, coord) => {
      return value === this.board.get([coord[0] + 1, coord[1] + 1]);
    });

    if (matches.every((v) => v)) {
      this.winGame();
    }
  }

  highlightMatches() {
    this.goalBoard.forEach((_, coord) => {
      this.board.set([coord[0] + 1, coord[1] + 1], undefined, {
        opacity: this.isMatch(coord) ? "1.0" : "0.4",
      });
    });
  }

  async clearBoard() {
    const promises: (() => Promise<void>)[] = [];

    this.board.forEach((_, __, idx) => {
      promises.push(async () => {
        const coord = this.board.fromIndex(idx);
        await sleep(50 * idx);
        await this.board.animateHide(coord, { duration: 250 });
        this.board.set(coord, "");
      });
    });

    await Promise.all(promises.map((p) => p()));
  }

  async clearGoalBoard() {
    const promises: (() => Promise<void>)[] = [];

    this.goalBoard.forEach((_, __, idx) => {
      promises.push(async () => {
        const coord = this.goalBoard.fromIndex(idx);
        await sleep(50 * idx);
        await this.goalBoard.animateHide(coord, { duration: 250 });
        this.goalBoard.set(coord, "");
      });
    });

    await Promise.all(promises.map((p) => p()));
  }

  async winGame() {
    this.board.disableInput = true;
    await this.clearBoard();
    await this.clearGoalBoard();
    await sleep(1000);
    this.restart();
    this.board.disableInput = false;
  }

  restart() {
    // Generate goal.
    generateLayout()
      .filter((n) => n !== "")
      .slice(0, 9)
      .forEach((value, idx) => {
        const coord = this.goalBoard.fromIndex(idx);
        this.goalBoard.animateShow(coord, value);
        this.goalBoard.set(coord, value);
      });

    // Randomize board.
    const layout = generateLayout();
    layout.forEach((value, idx) => {
      const coord = this.board.fromIndex(idx);
      this.board.animateShow(coord, value);
      this.board.set(coord, value, { opacity: "0.4" });
    });

    this.highlightMatches();
  }
}
