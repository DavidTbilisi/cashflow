import { describe, it, expect } from 'vitest'
import {
  clampSocial,
  SOCIAL_BASE,
  SOCIAL_CAP,
  CHARITY_SOCIAL_GAIN,
  NECST_DISCOUNT_COST,
  DREAM_NEUTRALIZE_COST,
} from '../../domain/services/socialService'
import { TIME_BASE, TIME_CAPACITY, DOODAD_NEGOTIATE_COST } from '../../domain/services/timeService'
import type { ESBIQuadrant } from '../../domain/entities/types'

const QUADRANTS: ESBIQuadrant[] = ['E', 'S', 'B', 'I']

// ── clampSocial ─────────────────────────────────────────────────────────────────

describe('clampSocial', () => {
  it('leaves an in-range value untouched', () => {
    expect(clampSocial(4, 6)).toBe(4)
  })

  it('floors negative values at 0', () => {
    expect(clampSocial(-3, 6)).toBe(0)
  })

  it('caps values above the maximum', () => {
    expect(clampSocial(10, 6)).toBe(6)
  })

  it('handles the boundary values exactly', () => {
    expect(clampSocial(0, 6)).toBe(0)
    expect(clampSocial(6, 6)).toBe(6)
  })
})

// ── Social Capital constants ─────────────────────────────────────────────────────

describe('Social Capital scaling', () => {
  it('base SC never exceeds its cap for any quadrant', () => {
    for (const q of QUADRANTS) {
      expect(SOCIAL_BASE[q]).toBeLessThanOrEqual(SOCIAL_CAP[q])
    }
  })

  it('the cap widens monotonically as you climb E→S→B→I', () => {
    expect(SOCIAL_CAP.E).toBeLessThan(SOCIAL_CAP.S)
    expect(SOCIAL_CAP.S).toBeLessThan(SOCIAL_CAP.B)
    expect(SOCIAL_CAP.B).toBeLessThan(SOCIAL_CAP.I)
  })

  it('SC sink costs are positive and within an E-quadrant starting reach', () => {
    expect(CHARITY_SOCIAL_GAIN).toBeGreaterThan(0)
    expect(NECST_DISCOUNT_COST).toBeGreaterThan(0)
    expect(DREAM_NEUTRALIZE_COST).toBeGreaterThan(0)
    // The most expensive sink must still fit under an Investor's cap.
    expect(DREAM_NEUTRALIZE_COST).toBeLessThanOrEqual(SOCIAL_CAP.I)
  })
})

// ── Time-as-Asset constants (timeService) ────────────────────────────────────────

describe('Time-as-Asset scaling', () => {
  it('base free time never exceeds its capacity for any quadrant', () => {
    for (const q of QUADRANTS) {
      expect(TIME_BASE[q]).toBeLessThanOrEqual(TIME_CAPACITY[q])
    }
  })

  it('an Employee can always afford to negotiate at least one Doodad', () => {
    expect(DOODAD_NEGOTIATE_COST).toBeGreaterThan(0)
    expect(TIME_BASE.E).toBeGreaterThanOrEqual(DOODAD_NEGOTIATE_COST)
  })
})
