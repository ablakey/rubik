import { assert } from "ts-essentials";
import { Coord } from "./utils";

export type Direction = keyof typeof Direction;

const Direction = {
  Up: [0, -1],
  Right: [1, 0],
  Down: [0, 1],
  Left: [-1, 0],
} as const;

const ANIMATION_DURATION = 250;
const BORDER_COLOUR = "#222222";
const BG_COLOUR = "#222222";
const BORDER_WIDTH = 0.2;

export class Board {
  width: number;
  height: number;
  disableInput = false;
  private elements: { cell: HTMLDivElement; text: HTMLDivElement }[] = [];
  private clickEvent?: (coord: Coord, value: string) => Promise<void>;

  constructor(
    parentEl: HTMLDivElement,
    options?: {
      width?: number;
      height?: number;
      onClick?: (coord: Coord, value: string) => Promise<void>;
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

      const cell = document.createElement("div");
      cell.style.cssText = `
        background-color: ${BG_COLOUR};
        border: ${BORDER_WIDTH}cqw solid ${BORDER_COLOUR};
        display: flex;
        justify-content: center;
        align-items: center;
      `;

      ["touchstart", "click"].forEach((e) => {
        cell.addEventListener(e, async () => {
          if (!this.disableInput) {
            this.disableInput = true;
            await this.clickEvent?.(this.fromIndex(i), text.textContent ?? "");
            this.disableInput = false;
          }
        });
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

  public forEach(callback: (value: string, coord: Coord, index: number) => void) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const coord: Coord = [x, y];
        const value = this.get(coord);
        callback(value, coord, x + y * this.width);
      }
    }
  }

  public map<T>(callback: (value: string, coord: Coord, index: number) => T): T[] {
    const results: T[] = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const coord: Coord = [x, y];
        const value = this.get(coord);
        const result = callback(value, coord, x + y * this.width);
        results.push(result);
      }
    }
    return results;
  }

  public find(callback: (value: string, coord: Coord) => boolean) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const coord: Coord = [x, y];
        const value = this.get(coord);
        const isMatch = callback(value, coord);
        if (isMatch) {
          return { coord, value };
        }
      }
    }
  }

  public get(coord: Coord) {
    const { text } = this.getEl(coord);
    return text.textContent ?? "";
  }

  public set(coord: Coord, value: string | undefined, options?: { opacity?: string }) {
    const { text } = this.getEl(coord);

    if (options?.opacity !== undefined) {
      text.style.opacity = options.opacity;
    }
    if (value !== undefined) {
      text.textContent = value;
    }
  }

  public async animateHide(coord: Coord, options?: { duration?: number }) {
    const { text } = this.getEl(coord);
    text.style.fontSize = `${this.cellWidth}cqw`;
    await text.animate([{ fontSize: "0cqw" }], {
      duration: options?.duration ?? ANIMATION_DURATION,
    }).finished;
    text.textContent = "";
  }

  public async animateShow(coord: Coord, icon: string, options?: { duration?: number }) {
    const { text } = this.getEl(coord);
    text.style.fontSize = "0cqw";
    text.textContent = icon;
    await text.animate([{ fontSize: `${this.cellWidth}cqw` }], {
      duration: options?.duration ?? ANIMATION_DURATION,
    }).finished;
    text.style.fontSize = `${this.cellWidth}cqw`;
  }

  public async animateMove(coord: Coord, direction: Direction | Coord) {
    const dir = Array.isArray(direction) ? direction : Direction[direction];
    const { text } = this.getEl(coord);
    assert(text.textContent);

    const translateX = this.cellWidth * 1.1 * dir[0];
    const translateY = this.cellWidth * 1.1 * dir[1];

    await text.animate([{ transform: `translate(${translateX}cqw, ${translateY}cqw)` }], {
      duration: ANIMATION_DURATION,
    }).finished;
  }
}
