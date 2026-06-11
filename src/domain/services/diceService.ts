import { createRng, rollDie } from '../../utils/randomSeed'
import type { PlayerState } from '../entities/types'

let _rng: (() => number) | null = null

export function initDice(seed: number) {
  _rng = createRng(seed)
}

/** Roll `count` dice (rulebook: Rat Race = 1, Fast Track = 2, Charity = 2). */
export function rollDice(count: number): number[] {
  if (!_rng) _rng = createRng(42)
  return Array.from({ length: Math.max(1, count) }, () => rollDie(_rng!))
}

/** How many dice this player rolls right now. */
export function diceCountFor(player: PlayerState): number {
  if (player.boardTrack === 'fast_track') {
    return 2 // Fast Track rolls two dice (Charity on the Fast Track may vary this).
  }
  // Rat Race rolls one die; Charity grants a second die for a few turns.
  return player.extraDiceTurns > 0 ? 2 : 1
}

export function diceTotal(roll: number[]): number {
  return roll.reduce((s, d) => s + d, 0)
}

// Back-compat helper retained for any 2-dice callers/tests.
export function rollTwoDice(): [number, number] {
  const [a, b] = rollDice(2)
  return [a, b]
}
