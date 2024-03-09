export type Coord = [number, number];

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function shuffle<T>(arr: T[]) {
  const newArr = [...arr];
  let currentIndex = newArr.length,
    randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [newArr[currentIndex], newArr[randomIndex]] = [newArr[randomIndex], newArr[currentIndex]];
  }

  return newArr;
}
