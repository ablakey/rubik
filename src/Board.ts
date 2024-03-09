import { assert } from "ts-essentials";
import { Coord } from "./utils";

export type Direction = keyof typeof Direction;

const Direction = {
  Up: [0, -1],
  Right: [1, 0],
  Down: [0, 1],
  Left: [-1, 0],
} as const;

const ANIMATION_DURATION = 500;
const BORDER_COLOUR = "#222222";
const BG_COLOUR = "#222222";
const BORDER_WIDTH = 0.2;

export class Board {
  width: number;
  height: number;
  private elements: { cell: HTMLDivElement; text: HTMLDivElement }[] = [];
  private clickEvent?: (coord: Coord, value: string) => void;

  constructor(
    parentEl: HTMLDivElement,
    options?: {
      width?: number;
      height?: number;
      onClick?: (coord: Coord, value: string) => void;
      cellStyle?: (coord: Coord) => string | undefined;
    },
  ) {
    this.clickEvent = options?.onClick;
    this.width = options?.width ?? 8;
    this.height = options?.height ?? 8;

    const containerEl = document.createElement("div");
    parentEl.appendChild(containerEl);
    containerEl.style.cssText = `
      min-height: 100%;
      position: relative;
      `;

    const frameEl = document.createElement("div");
    containerEl.appendChild(frameEl);
    frameEl.style.cssText = `
      position: absolute;
      margin: auto;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      max-width: 100%;
      max-height: 100%;
      container-type: inline-size;
      aspect-ratio: ${this.width} / ${this.height};
      `;

    const boardEl = document.createElement("div");
    frameEl.appendChild(boardEl);
    boardEl.style.cssText = `
      display: grid;
      height: 100%;
      grid-template-columns: repeat(${this.width}, 1fr);

    `;

    for (let i = 0; i < this.width * this.height; i++) {
      const text = document.createElement("div");
      text.style.cssText = `
        text-align: center;
        line-height: ${this.cellWidth}cqw;
        margin: -${this.cellWidth}cqw;
        font-size: ${this.cellWidth}cqw;
      `;

      const extraStyle = options?.cellStyle?.(this.fromIndex(i)) ?? "";

      const cell = document.createElement("div");
      cell.style.cssText =
        `
        background-color: ${BG_COLOUR};
        border: ${BORDER_WIDTH}cqw solid ${BORDER_COLOUR};
        display: flex;
        justify-content: center;
        align-items: center;
      ` + extraStyle;

      cell.addEventListener("mouseup", () => {
        this.clickEvent?.(this.fromIndex(i), text.textContent ?? "");
      });

      cell.appendChild(text);
      boardEl.appendChild(cell);
      this.elements.push({ cell, text });
    }
  }

  private get cellWidth() {
    return (1 / this.width) * 90;
  }

  public toIndex(coord: Coord): number {
    return coord[1] * this.width + coord[0];
  }

  public fromIndex(index: number): Coord {
    const y = Math.floor(index / this.width);
    const x = index - y * this.width;
    return [x, y];
  }

  private getEl(coord: Coord) {
    const { cell, text } = this.elements[this.toIndex(coord)];
    return { cell, text };
  }

  public set(coord: Coord, icon: string) {
    const { text } = this.getEl(coord);
    text.style.fontSize = `${this.cellWidth}cqw`;
    text.textContent = icon;
  }

  public async move(coord: Coord, direction: Direction) {
    const dir = Direction[direction];
    const { text } = this.getEl(coord);
    assert(text.textContent);

    const translateX = this.cellWidth * 1.2 * dir[0];
    const translateY = this.cellWidth * 1.2 * dir[1];

    await text.animate([{ transform: `translate(${translateX}cqw, ${translateY}cqw)` }], {
      duration: ANIMATION_DURATION,
    }).finished;
  }
}
