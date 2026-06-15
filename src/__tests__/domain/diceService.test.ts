import { describe, it, expect } from 'vitest'
import { initDice, rollDice, diceCountFor, diceTotal, rollTwoDice } from '../../domain/services/diceService'
import { makePlayer } from '../fixtures'

// ── rollDice ─────────────────────────────────────────────────────────────────

describe('rollDice', () => {
  it('returns the requested number of dice, each in 1–6', () => {
    initDice(42)
    const roll = rollDice(2)
    expect(roll).toHaveLength(2)
    for (const d of roll) {
      expect(d).toBeGreaterThanOrEqual(1)
      expect(d).toBeLessThanOrEqual(6)
    }
  })

  it('rolls at least one die when asked for 0', () => {
    initDice(42)
    expect(rollDice(0)).toHaveLength(1)
  })

  it('is deterministic for a given seed', () => {
    initDice(123)
    const a = rollDice(3)
    initDice(123)
    const b = rollDice(3)
    expect(a).toEqual(b)
  })

  it('produces a different sequence for a different seed', () => {
    initDice(1)
    const a = Array.from({ length: 10 }, () => rollDice(1)[0])
    initDice(2)
    const b = Array.from({ length: 10 }, () => rollDice(1)[0])
    expect(a).not.toEqual(b)
  })
})

// ── diceCountFor ─────────────────────────────────────────────────────────────

describe('diceCountFor', () => {
  it('rolls a single die in the Rat Race', () => {
    expect(diceCountFor(makePlayer({ boardTrack: 'rat_race', extraDiceTurns: 0 }))).toBe(1)
  })

  it('rolls two dice during a Charity extra-dice streak', () => {
    expect(diceCountFor(makePlayer({ boardTrack: 'rat_race', extraDiceTurns: 2 }))).toBe(2)
  })

  it('rolls two dice on the Fast Track', () => {
    expect(diceCountFor(makePlayer({ boardTrack: 'fast_track' }))).toBe(2)
  })
})

// ── diceTotal ────────────────────────────────────────────────────────────────

describe('diceTotal', () => {
  it('sums the dice', () => {
    expect(diceTotal([3, 4])).toBe(7)
    expect(diceTotal([6])).toBe(6)
  })

  it('is 0 for an empty roll', () => {
    expect(diceTotal([])).toBe(0)
  })
})

// ── rollTwoDice (back-compat) ────────────────────────────────────────────────

describe('rollTwoDice', () => {
  it('returns a two-element tuple in range', () => {
    initDice(7)
    const [a, b] = rollTwoDice()
    for (const d of [a, b]) {
      expect(d).toBeGreaterThanOrEqual(1)
      expect(d).toBeLessThanOrEqual(6)
    }
  })
})
