// Mulberry32 — fast, good distribution, seedable
export function createRng(seed: number) {
  let s = seed >>> 0
  return function () {
    s += 0x6d2b79f5
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function rollDie(rng: () => number, faces = 6): number {
  return Math.floor(rng() * faces) + 1
}
