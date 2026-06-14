import { describe, it, expect } from 'vitest'
import {
  computeSummary,
  checkBankruptcy,
  applyCardEffect,
  applyPayday,
} from '../../domain/services/financialCalc'
import { makePlayer, makeFinances } from '../fixtures'

describe('computeSummary', () => {
  it('sums income, expenses, and derives cash flow', () => {
    const fin = makeFinances({
      incomeSources: [
        { id: 'a', label: 'Salary', monthlyAmount: 4000, isPassive: false },
        { id: 'b', label: 'Rental', monthlyAmount: 1000, isPassive: true },
      ],
      expenseLines: [
        { id: 'c', label: 'Rent', monthlyAmount: 1500, isFixed: true },
        { id: 'd', label: 'Food', monthlyAmount: 500, isFixed: false },
      ],
    })
    const s = computeSummary(fin)
    expect(s.totalMonthlyIncome).toBe(5000)
    expect(s.totalPassiveIncome).toBe(1000)
    expect(s.totalMonthlyExpenses).toBe(2000)
    expect(s.monthlyCashFlow).toBe(3000)
  })

  it('includes cash balance in total asset value', () => {
    const fin = makeFinances({ cashBalance: 8000, assets: [] })
    const s = computeSummary(fin)
    expect(s.totalAssetValue).toBe(8000)
  })

  it('sums asset currentValue and cash', () => {
    const fin = makeFinances({
      cashBalance: 2000,
      assets: [
        {
          id: 'ast1', name: 'Duplex', assetClass: 'real_estate',
          purchasePrice: 100000, currentValue: 120000,
          monthlyPassiveIncome: 800, monthlyExpense: 100,
          leverageUsed: true, liabilityAmount: 80000, acquiredAtTurn: 1, cardId: '',
        },
      ],
    })
    const s = computeSummary(fin)
    expect(s.totalAssetValue).toBe(122000)
  })

  it('computes net worth as assets minus liabilities', () => {
    const fin = makeFinances({
      cashBalance: 5000,
      liabilities: [{ id: 'l1', label: 'Mortgage', totalOwed: 80000, monthlyPayment: 600 }],
    })
    const s = computeSummary(fin)
    expect(s.netWorth).toBe(5000 - 80000)
  })

  it('isPassiveIncomePositive when passive income >= expenses', () => {
    const fin = makeFinances({
      incomeSources: [{ id: 'p', label: 'Passive', monthlyAmount: 2000, isPassive: true }],
      expenseLines: [{ id: 'e', label: 'Expense', monthlyAmount: 1500, isFixed: true }],
    })
    expect(computeSummary(fin).isPassiveIncomePositive).toBe(true)
  })

  it('isPassiveIncomePositive is false when passive income < expenses', () => {
    const fin = makeFinances({
      incomeSources: [{ id: 'p', label: 'Passive', monthlyAmount: 500, isPassive: true }],
      expenseLines: [{ id: 'e', label: 'Expense', monthlyAmount: 2000, isFixed: true }],
    })
    expect(computeSummary(fin).isPassiveIncomePositive).toBe(false)
  })

  it('handles zero income and zero expenses gracefully', () => {
    const fin = makeFinances({ incomeSources: [], expenseLines: [], cashBalance: 0 })
    const s = computeSummary(fin)
    expect(s.totalMonthlyIncome).toBe(0)
    expect(s.monthlyCashFlow).toBe(0)
    expect(s.isPassiveIncomePositive).toBe(true) // 0 >= 0
  })
})

describe('checkBankruptcy', () => {
  it('returns false when cash is positive', () => {
    expect(checkBankruptcy(makeFinances({ cashBalance: 100 }))).toBe(false)
  })

  it('returns false when cash negative but net worth positive (asset cover)', () => {
    const fin = makeFinances({
      cashBalance: -1000,
      assets: [{
        id: 'a', name: 'Stock', assetClass: 'stocks',
        purchasePrice: 10000, currentValue: 20000,
        monthlyPassiveIncome: 0, monthlyExpense: 0,
        leverageUsed: false, liabilityAmount: 0, acquiredAtTurn: 1, cardId: '',
      }],
    })
    expect(checkBankruptcy(fin)).toBe(false)
  })

  it('returns true when both cash and net worth are negative', () => {
    const fin = makeFinances({
      cashBalance: -500,
      liabilities: [{ id: 'l1', label: 'Debt', totalOwed: 50000, monthlyPayment: 500 }],
    })
    expect(checkBankruptcy(fin)).toBe(true)
  })
})

describe('applyCardEffect', () => {
  it('cash_gain adds to cash balance', () => {
    const player = makePlayer()
    const result = applyCardEffect(player, { type: 'cash_gain', amount: 1000 }, 1)
    expect(result.finances.cashBalance).toBe(6000)
  })

  it('cash_loss subtracts from cash balance', () => {
    const player = makePlayer()
    const result = applyCardEffect(player, { type: 'cash_loss', amount: 2000 }, 1)
    expect(result.finances.cashBalance).toBe(3000)
  })

  it('cash_loss can produce negative balance (not capped)', () => {
    const player = makePlayer()
    const result = applyCardEffect(player, { type: 'cash_loss', amount: 10000 }, 1)
    expect(result.finances.cashBalance).toBe(-5000)
  })

  it('gain_income adds new income source', () => {
    const player = makePlayer()
    const result = applyCardEffect(
      player,
      { type: 'gain_income', monthlyAmount: 500, label: 'Rental', isPassive: true },
      1,
    )
    expect(result.finances.incomeSources).toHaveLength(2)
    const added = result.finances.incomeSources.find((s) => s.label === 'Rental')!
    expect(added.monthlyAmount).toBe(500)
    expect(added.isPassive).toBe(true)
  })

  it('lose_income removes income source by id', () => {
    const player = makePlayer()
    const idToRemove = player.finances.incomeSources[0].id
    const result = applyCardEffect(player, { type: 'lose_income', sourceId: idToRemove }, 1)
    expect(result.finances.incomeSources).toHaveLength(0)
  })

  it('add_expense appends expense line', () => {
    const player = makePlayer()
    const result = applyCardEffect(
      player,
      { type: 'add_expense', monthlyAmount: 400, label: 'Car payment', isFixed: true },
      1,
    )
    expect(result.finances.expenseLines).toHaveLength(2)
    const added = result.finances.expenseLines.find((e) => e.label === 'Car payment')!
    expect(added.monthlyAmount).toBe(400)
  })

  it('remove_expense removes expense line by id', () => {
    const player = makePlayer()
    const idToRemove = player.finances.expenseLines[0].id
    const result = applyCardEffect(player, { type: 'remove_expense', expenseId: idToRemove }, 1)
    expect(result.finances.expenseLines).toHaveLength(0)
  })

  it('add_liability creates liability, expense line, and boosts cash', () => {
    const player = makePlayer()
    const result = applyCardEffect(
      player,
      { type: 'add_liability', amount: 50000, monthlyPayment: 600, label: 'Mortgage' },
      1,
    )
    expect(result.finances.liabilities).toHaveLength(1)
    expect(result.finances.liabilities[0].totalOwed).toBe(50000)
    expect(result.finances.expenseLines).toHaveLength(2)
    expect(result.finances.cashBalance).toBe(55000) // 5000 + 50000
  })

  it('acquire_asset deducts down payment and adds asset + passive income', () => {
    const player = makePlayer()
    const result = applyCardEffect(
      player,
      {
        type: 'acquire_asset',
        asset: {
          name: 'Duplex', assetClass: 'real_estate',
          purchasePrice: 10000, currentValue: 10000,
          monthlyPassiveIncome: 800, monthlyExpense: 0,
          leverageUsed: false, liabilityAmount: 0, cardId: '',
        },
      },
      1,
    )
    expect(result.finances.cashBalance).toBe(-5000) // 5000 - 10000 down payment
    expect(result.finances.assets).toHaveLength(1)
    const passive = result.finances.incomeSources.find((s) => s.isPassive)
    expect(passive?.monthlyAmount).toBe(800)
  })

  it('acquire_asset with leverage: down payment = price - liability', () => {
    const player = makePlayer()
    const result = applyCardEffect(
      player,
      {
        type: 'acquire_asset',
        asset: {
          name: 'Duplex', assetClass: 'real_estate',
          purchasePrice: 100000, currentValue: 100000,
          monthlyPassiveIncome: 1200, monthlyExpense: 200,
          leverageUsed: true, liabilityAmount: 80000, cardId: '',
        },
      },
      1,
    )
    expect(result.finances.cashBalance).toBe(-15000) // 5000 - (100000 - 80000) down payment
    expect(result.finances.expenseLines).toHaveLength(2) // rent + maintenance
  })

  it('quadrant_advance promotes E → S', () => {
    const player = makePlayer({ quadrant: 'E' })
    const result = applyCardEffect(player, { type: 'quadrant_advance' }, 1)
    expect(result.quadrant).toBe('S')
  })

  it('quadrant_advance promotes through all quadrants', () => {
    let p = makePlayer({ quadrant: 'E' })
    p = applyCardEffect(p, { type: 'quadrant_advance' }, 1)
    expect(p.quadrant).toBe('S')
    p = applyCardEffect(p, { type: 'quadrant_advance' }, 2)
    expect(p.quadrant).toBe('B')
    p = applyCardEffect(p, { type: 'quadrant_advance' }, 3)
    expect(p.quadrant).toBe('I')
  })

  it('quadrant_advance caps at I', () => {
    const player = makePlayer({ quadrant: 'I' })
    const result = applyCardEffect(player, { type: 'quadrant_advance' }, 1)
    expect(result.quadrant).toBe('I')
  })

  it('anchor_unlock marks anchor as unlocked with turn', () => {
    const player = makePlayer()
    const result = applyCardEffect(player, { type: 'anchor_unlock', anchorId: 'door' }, 5)
    const door = result.anchors.find((a) => a.anchorId === 'door')!
    expect(door.unlocked).toBe(true)
    expect(door.unlockedAtTurn).toBe(5)
  })

  it('anchor_unlock does not affect other anchors', () => {
    const player = makePlayer()
    const result = applyCardEffect(player, { type: 'anchor_unlock', anchorId: 'engine' }, 5)
    const shield = result.anchors.find((a) => a.anchorId === 'shield')!
    expect(shield.unlocked).toBe(false)
  })

  it('fast_track_entry moves player to fast track at position 0', () => {
    const player = makePlayer({ boardPosition: 15 })
    const result = applyCardEffect(player, { type: 'fast_track_entry' }, 1)
    expect(result.boardTrack).toBe('fast_track')
    expect(result.boardPosition).toBe(0)
  })

  it('does not mutate original player', () => {
    const player = makePlayer()
    const original = player.finances.cashBalance
    applyCardEffect(player, { type: 'cash_gain', amount: 9999 }, 1)
    expect(player.finances.cashBalance).toBe(original)
  })

  // ── Social Capital ──
  it('gain_social adds to the pool, clamped to the cap', () => {
    const player = makePlayer({ socialCapital: 2, socialCapitalCap: 6 })
    const result = applyCardEffect(player, { type: 'gain_social', amount: 3, label: 'Intro' }, 1)
    expect(result.socialCapital).toBe(5)
  })

  it('gain_social never exceeds the cap', () => {
    const player = makePlayer({ socialCapital: 5, socialCapitalCap: 6 })
    const result = applyCardEffect(player, { type: 'gain_social', amount: 10, label: 'Intro' }, 1)
    expect(result.socialCapital).toBe(6)
  })

  it('spend_social deducts, never going below zero', () => {
    const player = makePlayer({ socialCapital: 2, socialCapitalCap: 6 })
    const result = applyCardEffect(player, { type: 'spend_social', amount: 5 }, 1)
    expect(result.socialCapital).toBe(0)
  })

  it('social_gate spends cost and applies onAfford when affordable', () => {
    const player = makePlayer({ socialCapital: 5, socialCapitalCap: 6 })
    const result = applyCardEffect(
      player,
      {
        type: 'social_gate',
        cost: 5,
        onAfford: [{ type: 'gain_social', amount: 6, label: 'goodwill' }],
        onShort: [{ type: 'cash_loss', amount: 2000 }],
      },
      1,
    )
    expect(result.socialCapital).toBe(6) // 5 - 5 + 6, clamped to cap
    expect(result.finances.cashBalance).toBe(player.finances.cashBalance)
  })

  it('social_gate applies onShort and spends nothing when too poor', () => {
    const player = makePlayer({ socialCapital: 2, socialCapitalCap: 6 })
    const result = applyCardEffect(
      player,
      {
        type: 'social_gate',
        cost: 5,
        onAfford: [{ type: 'gain_social', amount: 6, label: 'goodwill' }],
        onShort: [{ type: 'cash_loss', amount: 2000 }],
      },
      1,
    )
    expect(result.socialCapital).toBe(2) // unchanged — couldn't afford
    expect(result.finances.cashBalance).toBe(player.finances.cashBalance - 2000)
  })
})

describe('applyPayday', () => {
  it('adds monthly cash flow to cash balance', () => {
    // income=4000, expense=1500, cash_flow=2500
    const player = makePlayer()
    const result = applyPayday(player)
    expect(result.finances.cashBalance).toBe(7500)
  })

  it('deducts negative cash flow on payday (expenses > income)', () => {
    const player = makePlayer({
      finances: makeFinances({
        incomeSources: [{ id: 'a', label: 'Job', monthlyAmount: 1000, isPassive: false }],
        expenseLines: [{ id: 'b', label: 'Rent', monthlyAmount: 3000, isFixed: true }],
        cashBalance: 10000,
      }),
    })
    const result = applyPayday(player)
    expect(result.finances.cashBalance).toBe(8000) // 10000 - 2000
  })
})
