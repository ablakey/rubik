import { Game } from "./Game";

async function main() {
  const game = new Game();
  game.restart();
}

window.onload = main;
