import { describe, it, expect } from 'vitest'
import { evaluateAnchors, makeDefaultAnchors, allAnchorsUnlocked } from '../../domain/rules/anchorRules'
import { makePlayer, makeFinances, makeAnchors } from '../fixtures'
import type { PlayerState } from '../../domain/entities/types'

// Helpers for building players that satisfy each anchor's prerequisite conditions

function withAllPriorAnchors(stop: number): PlayerState {
  const order = ['door', 'scale', 'safe', 'chain', 'engine', 'shield'] as const
  const unlocked = order.slice(0, stop) as typeof order[number][]
  return makePlayer({ anchors: makeAnchors(unlocked) })
}

describe('makeDefaultAnchors', () => {
  it('returns 6 anchors all locked', () => {
    const anchors = makeDefaultAnchors()
    expect(anchors).toHaveLength(6)
    expect(anchors.every((a) => !a.unlocked)).toBe(true)
  })

  it('has anchors in correct order', () => {
    const anchors = makeDefaultAnchors()
    const ids = anchors.map((a) => a.anchorId)
    expect(ids).toEqual(['door', 'scale', 'safe', 'chain', 'engine', 'shield'])
  })
})

describe('allAnchorsUnlocked', () => {
  it('returns false when none unlocked', () => {
    expect(allAnchorsUnlocked(makePlayer())).toBe(false)
  })

  it('returns false when only some unlocked', () => {
    const player = makePlayer({ anchors: makeAnchors(['door', 'scale', 'safe']) })
    expect(allAnchorsUnlocked(player)).toBe(false)
  })

  it('returns true when all six unlocked', () => {
    const player = makePlayer({
      anchors: makeAnchors(['door', 'scale', 'safe', 'chain', 'engine', 'shield']),
    })
    expect(allAnchorsUnlocked(player)).toBe(true)
  })
})

describe('door anchor', () => {
  it('unlocks when player has any income', () => {
    const player = makePlayer({
      finances: makeFinances({
        incomeSources: [{ id: 'a', label: 'Salary', monthlyAmount: 1, isPassive: false }],
      }),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'door')!.unlocked).toBe(true)
  })

  it('does not unlock when income is zero', () => {
    const player = makePlayer({
      finances: makeFinances({ incomeSources: [] }),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'door')!.unlocked).toBe(false)
  })
})

describe('scale anchor', () => {
  it('unlocks when door is set and positiveCashFlowTurns is already >= 3 before the call', () => {
    // The counter increment happens AFTER the anchor loop, so we need 3 coming in
    const player = makePlayer({
      finances: makeFinances(), // CF = +2500/mo
      anchors: makeAnchors(['door']),
      positiveCashFlowTurns: 3,
    })
    const result = evaluateAnchors(player, 4)
    expect(result.anchors.find((a) => a.anchorId === 'scale')!.unlocked).toBe(true)
  })

  it('does not unlock scale when door has not been established (no income to auto-unlock it)', () => {
    // Without income, door cannot auto-unlock in the same pass, so scale stays locked too
    const player = makePlayer({
      finances: makeFinances({ incomeSources: [] }), // no income → door won't unlock
      anchors: makeAnchors([]),
      positiveCashFlowTurns: 5,
    })
    const result = evaluateAnchors(player, 6)
    expect(result.anchors.find((a) => a.anchorId === 'door')!.unlocked).toBe(false)
    expect(result.anchors.find((a) => a.anchorId === 'scale')!.unlocked).toBe(false)
  })

  it('does not unlock if CF turns below threshold', () => {
    const player = makePlayer({
      finances: makeFinances(),
      anchors: makeAnchors(['door']),
      positiveCashFlowTurns: 0, // will become 1 after evaluateAnchors
    })
    const result = evaluateAnchors(player, 2)
    expect(result.anchors.find((a) => a.anchorId === 'scale')!.unlocked).toBe(false)
  })
})

describe('safe anchor', () => {
  it('unlocks when door+scale set and 6 months expenses in cash', () => {
    // expenses=1500/mo → buffer=9000
    const player = makePlayer({
      finances: makeFinances({ cashBalance: 9000 }),
      anchors: makeAnchors(['door', 'scale']),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'safe')!.unlocked).toBe(true)
  })

  it('does not unlock if cash below 6-month buffer', () => {
    const player = makePlayer({
      finances: makeFinances({ cashBalance: 5000 }), // buffer=9000, 5000 < 9000
      anchors: makeAnchors(['door', 'scale']),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'safe')!.unlocked).toBe(false)
  })
})

describe('chain anchor', () => {
  it('unlocks when door+scale+safe set and has leverage (liability linked to asset)', () => {
    const player = makePlayer({
      finances: makeFinances({
        cashBalance: 15000,
        liabilities: [
          { id: 'lib1', label: 'Mortgage', totalOwed: 80000, monthlyPayment: 600, assetId: 'ast1' },
        ],
      }),
      anchors: makeAnchors(['door', 'scale', 'safe']),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'chain')!.unlocked).toBe(true)
  })

  it('does not unlock when liabilities have no assetId', () => {
    const player = makePlayer({
      finances: makeFinances({
        cashBalance: 15000,
        liabilities: [
          { id: 'lib1', label: 'Car loan', totalOwed: 10000, monthlyPayment: 300 },
        ],
      }),
      anchors: makeAnchors(['door', 'scale', 'safe']),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'chain')!.unlocked).toBe(false)
  })
})

describe('engine anchor', () => {
  it('unlocks when door+scale+safe+chain set and has passive income', () => {
    const player = makePlayer({
      finances: makeFinances({
        cashBalance: 15000,
        incomeSources: [
          { id: 'sal', label: 'Salary', monthlyAmount: 4000, isPassive: false },
          { id: 'pas', label: 'Rental', monthlyAmount: 500, isPassive: true },
        ],
        liabilities: [
          { id: 'l1', label: 'Mortgage', totalOwed: 80000, monthlyPayment: 600, assetId: 'a1' },
        ],
      }),
      anchors: makeAnchors(['door', 'scale', 'safe', 'chain']),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'engine')!.unlocked).toBe(true)
  })

  it('does not unlock without passive income', () => {
    const player = makePlayer({
      finances: makeFinances({
        cashBalance: 15000,
        liabilities: [
          { id: 'l1', label: 'Mortgage', totalOwed: 80000, monthlyPayment: 600, assetId: 'a1' },
        ],
      }),
      anchors: makeAnchors(['door', 'scale', 'safe', 'chain']),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'engine')!.unlocked).toBe(false)
  })
})

describe('shield anchor', () => {
  it('unlocks when all prior anchors set and passive >= 50% expenses', () => {
    // expenses = 1500, need passive >= 750
    const player = makePlayer({
      finances: makeFinances({
        cashBalance: 15000,
        incomeSources: [
          { id: 'sal', label: 'Salary', monthlyAmount: 4000, isPassive: false },
          { id: 'pas', label: 'Rental', monthlyAmount: 800, isPassive: true }, // 800 >= 750
        ],
        liabilities: [
          { id: 'l1', label: 'Mortgage', totalOwed: 80000, monthlyPayment: 600, assetId: 'a1' },
        ],
      }),
      anchors: makeAnchors(['door', 'scale', 'safe', 'chain', 'engine']),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'shield')!.unlocked).toBe(true)
  })

  it('does not unlock when passive covers less than 50% of expenses', () => {
    // expenses = 1500, passive = 600 (40%)
    const player = makePlayer({
      finances: makeFinances({
        cashBalance: 15000,
        incomeSources: [
          { id: 'sal', label: 'Salary', monthlyAmount: 4000, isPassive: false },
          { id: 'pas', label: 'Rental', monthlyAmount: 600, isPassive: true },
        ],
        liabilities: [
          { id: 'l1', label: 'Mortgage', totalOwed: 80000, monthlyPayment: 600, assetId: 'a1' },
        ],
      }),
      anchors: makeAnchors(['door', 'scale', 'safe', 'chain', 'engine']),
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'shield')!.unlocked).toBe(false)
  })
})

describe('sequential anchor gating', () => {
  it('cannot unlock scale without door even if CF turns >= 3 (no income prevents door auto-unlock)', () => {
    const player = makePlayer({
      finances: makeFinances({ incomeSources: [] }), // no income → door stays locked
      anchors: makeAnchors([]),
      positiveCashFlowTurns: 10,
    })
    const result = evaluateAnchors(player, 11)
    expect(result.anchors.find((a) => a.anchorId === 'scale')!.unlocked).toBe(false)
  })

  it('cannot unlock engine by skipping prior anchors', () => {
    const player = makePlayer({
      finances: makeFinances({
        incomeSources: [
          { id: 'sal', label: 'Salary', monthlyAmount: 4000, isPassive: false },
          { id: 'pas', label: 'Rental', monthlyAmount: 800, isPassive: true },
        ],
      }),
      anchors: makeAnchors(['door']), // missing scale, safe, chain
    })
    const result = evaluateAnchors(player, 1)
    expect(result.anchors.find((a) => a.anchorId === 'engine')!.unlocked).toBe(false)
  })
})

describe('positiveCashFlowTurns counter', () => {
  it('increments when monthly cash flow > 0', () => {
    const player = makePlayer({ positiveCashFlowTurns: 1 }) // CF = +2500
    const result = evaluateAnchors(player, 2)
    expect(result.positiveCashFlowTurns).toBe(2)
  })

  it('resets to 0 when monthly cash flow <= 0', () => {
    const player = makePlayer({
      finances: makeFinances({
        incomeSources: [{ id: 'a', label: 'Job', monthlyAmount: 1000, isPassive: false }],
        expenseLines: [{ id: 'b', label: 'Bills', monthlyAmount: 2000, isFixed: true }],
      }),
      positiveCashFlowTurns: 5,
    })
    const result = evaluateAnchors(player, 6)
    expect(result.positiveCashFlowTurns).toBe(0)
  })
})

describe('already-unlocked anchors', () => {
  it('does not overwrite an anchor that is already unlocked', () => {
    const player = makePlayer({
      finances: makeFinances(),
      anchors: makeAnchors(['door']).map((a) =>
        a.anchorId === 'door' ? { ...a, unlockedAtTurn: 2 } : a,
      ),
    })
    const result = evaluateAnchors(player, 10)
    expect(result.anchors.find((a) => a.anchorId === 'door')!.unlockedAtTurn).toBe(2)
  })
})
