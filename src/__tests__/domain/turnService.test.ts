import { describe, it, expect } from 'vitest'
import { computeNewPosition, advanceToNextPlayer } from '../../domain/services/turnService'
import { makeGame, makePlayer } from '../fixtures'

// ── computeNewPosition ─────────────────────────────────────────────────────────

describe('computeNewPosition', () => {
  it('advances by the dice total within the Rat Race', () => {
    const game = makeGame()
    const player = makePlayer({ boardTrack: 'rat_race', boardPosition: 0 })
    expect(computeNewPosition(player, [5], game)).toBe(5)
  })

  it('sums multi-die rolls', () => {
    const game = makeGame()
    const player = makePlayer({ boardTrack: 'rat_race', boardPosition: 4 })
    expect(computeNewPosition(player, [2, 3], game)).toBe(9)
  })

  it('wraps around the end of the 40-space Rat Race', () => {
    const game = makeGame()
    const player = makePlayer({ boardTrack: 'rat_race', boardPosition: 38 })
    expect(computeNewPosition(player, [1, 2], game)).toBe(1) // (38 + 3) % 40
  })

  it('wraps around the shorter 24-space Fast Track', () => {
    const game = makeGame()
    const player = makePlayer({ boardTrack: 'fast_track', boardPosition: 23 })
    expect(computeNewPosition(player, [2], game)).toBe(1) // (23 + 2) % 24
  })
})

// ── advanceToNextPlayer ─────────────────────────────────────────────────────────

describe('advanceToNextPlayer', () => {
  it('with a single player: loops back to 0 and bumps round + turn', () => {
    const game = { ...makeGame(), round: 1, turn: 1, currentPlayerIndex: 0 }
    const next = advanceToNextPlayer(game)
    expect(next.currentPlayerIndex).toBe(0)
    expect(next.round).toBe(2)
    expect(next.turn).toBe(2)
  })

  it('advances to the next player without changing the round', () => {
    const game = {
      ...makeGame(),
      players: [makePlayer({ id: 'p0' }), makePlayer({ id: 'p1' })],
      currentPlayerIndex: 0,
      round: 3,
      turn: 7,
    }
    const next = advanceToNextPlayer(game)
    expect(next.currentPlayerIndex).toBe(1)
    expect(next.round).toBe(3)
    expect(next.turn).toBe(8)
  })

  it('wraps from the last player back to 0 and increments the round', () => {
    const game = {
      ...makeGame(),
      players: [makePlayer({ id: 'p0' }), makePlayer({ id: 'p1' })],
      currentPlayerIndex: 1,
      round: 3,
      turn: 7,
    }
    const next = advanceToNextPlayer(game)
    expect(next.currentPlayerIndex).toBe(0)
    expect(next.round).toBe(4)
  })

  it('resets the turn phase and clears the dice roll', () => {
    const game = { ...makeGame(), currentTurnPhase: 'end_check' as const, lastDiceRoll: [4] }
    const next = advanceToNextPlayer(game)
    expect(next.currentTurnPhase).toBe('idle')
    expect(next.lastDiceRoll).toBeNull()
  })
})
