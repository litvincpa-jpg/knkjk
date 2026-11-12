export interface PairsSave {
  stars: Record<string, number>;
  bestMoves: Record<string, number>;
  sound: boolean;
}

const KEY = 'zuma-luma:pairs:v1';
const DEFAULT: PairsSave = { stars: {}, bestMoves: {}, sound: true };

export function loadPairsSave(): PairsSave {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const data = JSON.parse(raw) as Partial<PairsSave>;
    return { stars: { ...(data.stars ?? {}) }, bestMoves: { ...(data.bestMoves ?? {}) }, sound: data.sound !== false };
  } catch {
    return DEFAULT;
  }
}

export function storePairsSave(data: PairsSave) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* Локальное сохранение недоступно — игра продолжает работать. */
  }
}
