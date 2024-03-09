import { assert } from "ts-essentials";
import { Coord } from "./utils";

export type Direction = keyof typeof Direction;

const Direction = {
  Up: [0, -1],
  Right: [1, 0],
  Down: [0, 1],
  Left: [-1, 0],
} as const;

const WIDTH = 5;
const HEIGHT = 5;
const ANIMATION_DURATION = 500;
const BORDER_COLOUR = "#222222";
const BG_COLOUR = "#222222";
const BORDER_WIDTH = 0.2;

const CELL_WIDTH = (1 / WIDTH) * 90;

export function toIndex(coord: Coord): number {
  return coord[1] * WIDTH + coord[0];
}

export function fromIndex(index: number): Coord {
  const y = Math.floor(index / WIDTH);
  const x = index - y * WIDTH;
  return [x, y];
}

export class Board {
  private elements: { cell: HTMLDivElement; text: HTMLDivElement }[] = [];
  private clickEvent?: (coord: Coord, value: string) => void;

  constructor(frameEl: HTMLDivElement, onClick?: (coord: Coord, value: string) => void) {
    this.clickEvent = onClick;

    frameEl.style.aspectRatio = `${WIDTH} / ${HEIGHT}`;

    const board = frameEl.children[0] as HTMLDivElement;
    board.style.gridTemplateColumns = `repeat(${WIDTH}, 1fr)`;

    for (let i = 0; i < WIDTH * HEIGHT; i++) {
      const text = document.createElement("div");
      text.style.cssText = `
        text-align: center;
        line-height: ${CELL_WIDTH}cqw;
        margin: -${CELL_WIDTH}cqw;
        font-size: ${CELL_WIDTH}cqw;
      `;

      const cell = document.createElement("div");
      cell.style.cssText = `
        background-color: ${BG_COLOUR};
        border: ${BORDER_WIDTH}cqw solid ${BORDER_COLOUR};
        display: flex;
        justify-content: center;
        align-items: center;
      `;

      cell.addEventListener("mouseup", () => {
        this.clickEvent?.(fromIndex(i), text.textContent ?? "");
      });

      cell.appendChild(text);
      board.appendChild(cell);
      this.elements.push({ cell, text });
    }
  }

  private getEl(coord: Coord) {
    const { cell, text } = this.elements[toIndex(coord)];
    return { cell, text };
  }

  public set(coord: Coord, icon: string) {
    const { text } = this.getEl(coord);
    text.style.fontSize = `${CELL_WIDTH}cqw`;
    text.textContent = icon;
  }

  public async move(coord: Coord, direction: Direction) {
    const dir = Direction[direction];
    const { text } = this.getEl(coord);
    assert(text.textContent);

    const translateX = CELL_WIDTH * 1.2 * dir[0];
    const translateY = CELL_WIDTH * 1.2 * dir[1];

    await text.animate([{ transform: `translate(${translateX}cqw, ${translateY}cqw)` }], {
      duration: ANIMATION_DURATION,
    }).finished;
  }
}
