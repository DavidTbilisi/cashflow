import { describe, it, expect } from 'vitest'
import type { Asset, IncomeSource } from '../../domain/entities/types'
import { canAdvanceQuadrant, evaluateQuadrant } from '../../domain/rules/quadrantRules'
import { makePlayer, makeFinances } from '../fixtures'

const sideGig: IncomeSource = { id: 'gig', label: 'Side gig', monthlyAmount: 800, isPassive: false }
const dividend: IncomeSource = { id: 'div', label: 'Dividends', monthlyAmount: 300, isPassive: true }

function businessAsset(): Asset {
  return {
    id: 'biz', name: 'Laundromat', assetClass: 'business',
    purchasePrice: 20000, currentValue: 20000, monthlyPassiveIncome: 0,
    monthlyExpense: 0, leverageUsed: false, liabilityAmount: 0,
    acquiredAtTurn: 1, cardId: '',
  }
}

// ── evaluateQuadrant: the per-turn ESBI counterpart of evaluateAnchors ─────────

describe('evaluateQuadrant', () => {
  it('keeps E when only the single salary income exists (gate not met)', () => {
    const p = makePlayer({ quadrant: 'E' }) // default finances = salary only
    expect(canAdvanceQuadrant(p)).toBe(false)
    expect(evaluateQuadrant(p).quadrant).toBe('E')
  })

  it('advances E → S once a second active income source exists', () => {
    const p = makePlayer({
      quadrant: 'E',
      finances: makeFinances({
        incomeSources: [{ id: 'salary', label: 'Salary', monthlyAmount: 4000, isPassive: false }, sideGig],
      }),
    })
    expect(evaluateQuadrant(p).quadrant).toBe('S')
  })

  it('advances S → B once a business-class asset is owned', () => {
    const p = makePlayer({ quadrant: 'S', finances: makeFinances({ assets: [businessAsset()] }) })
    expect(evaluateQuadrant(p).quadrant).toBe('B')
  })

  it('keeps S when no business asset is owned', () => {
    const p = makePlayer({ quadrant: 'S' })
    expect(evaluateQuadrant(p).quadrant).toBe('S')
  })

  it('advances B → I once passive income is positive', () => {
    const p = makePlayer({
      quadrant: 'B',
      finances: makeFinances({
        incomeSources: [{ id: 'salary', label: 'Salary', monthlyAmount: 4000, isPassive: false }, dividend],
      }),
    })
    expect(evaluateQuadrant(p).quadrant).toBe('I')
  })

  it('never advances past I', () => {
    const p = makePlayer({ quadrant: 'I', finances: makeFinances({ assets: [businessAsset()] }) })
    expect(canAdvanceQuadrant(p)).toBe(false)
    expect(evaluateQuadrant(p).quadrant).toBe('I')
  })

  it('advances at most one quadrant per call', () => {
    // Eligible E (two incomes) that ALSO owns a business + passive income still
    // steps only E → S; the next call would re-check the new quadrant's gate.
    const p = makePlayer({
      quadrant: 'E',
      finances: makeFinances({
        incomeSources: [
          { id: 'salary', label: 'Salary', monthlyAmount: 4000, isPassive: false },
          sideGig,
          dividend,
        ],
        assets: [businessAsset()],
      }),
    })
    expect(evaluateQuadrant(p).quadrant).toBe('S')
  })
})
