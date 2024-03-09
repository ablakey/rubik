export type Coord = [number, number];

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function shuffle<T>(arr: T[]) {
  let currentIndex = arr.length,
    randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
}
