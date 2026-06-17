import { describe, it, expect } from 'vitest'
import {
  allocatePayday,
  distributeProfit,
  absorbLoss,
  sealedReserve,
  currentQuarter,
  gameTime,
  PROFIT_TAP,
  TAX_TAP,
  QUARTER_ROUNDS,
  MONTHS_PER_YEAR,
} from '../../domain/rules/profitFirst'
import { computeSummary, applyCardEffect } from '../../domain/services/financialCalc'
import { evaluateAnchors } from '../../domain/rules/anchorRules'
import { makePlayer, makeFinances, makeAnchors } from '../fixtures'

describe('allocatePayday — skim Profit/Tax first', () => {
  it('skims TAP% into sealed envelopes and lands the remainder in cash', () => {
    const fin = makeFinances({ cashBalance: 0, profitAccount: 0, taxAccount: 0 })
    const out = allocatePayday(fin, 1000)
    expect(out.profitAccount).toBe(Math.round(1000 * PROFIT_TAP)) // 150
    expect(out.taxAccount).toBe(Math.round(1000 * TAX_TAP)) // 150
    expect(out.cashBalance).toBe(700) // remainder
  })

  it('conserves every cent — no rounding leak', () => {
    const fin = makeFinances({ cashBalance: 0, profitAccount: 0, taxAccount: 0 })
    const pay = 333 // odd amount → forces rounding
    const out = allocatePayday(fin, pay)
    expect((out.profitAccount ?? 0) + (out.taxAccount ?? 0) + out.cashBalance).toBe(pay)
  })

  it('does not skim a non-positive payday — nothing to take profit from', () => {
    const fin = makeFinances({ cashBalance: 500, profitAccount: 0, taxAccount: 0 })
    const out = allocatePayday(fin, -200)
    expect(out.cashBalance).toBe(300)
    expect(out.profitAccount).toBe(0)
    expect(out.taxAccount).toBe(0)
  })

  it('accumulates across paydays', () => {
    let fin = makeFinances({ cashBalance: 0, profitAccount: 0, taxAccount: 0 })
    fin = allocatePayday(fin, 1000)
    fin = allocatePayday(fin, 1000)
    expect(fin.profitAccount).toBe(300)
  })
})

describe('distributeProfit — quarterly reward', () => {
  it('pays half the Profit account to spendable cash and advances the quarter', () => {
    const player = makePlayer({
      finances: makeFinances({ cashBalance: 1000, profitAccount: 800, taxAccount: 500 }),
      lastProfitQuarter: 0,
    })
    const { player: after, windfall } = distributeProfit(player, 1)
    expect(windfall).toBe(400)
    expect(after.finances.cashBalance).toBe(1400)
    expect(after.finances.profitAccount).toBe(400) // retained reserve
    expect(after.finances.taxAccount).toBe(500) // Tax is untouched by distribution
    expect(after.lastProfitQuarter).toBe(1)
  })

  it('still advances the quarter on a barren account (no retry spam)', () => {
    const player = makePlayer({
      finances: makeFinances({ profitAccount: 0 }),
      lastProfitQuarter: 0,
    })
    const { player: after, windfall } = distributeProfit(player, 2)
    expect(windfall).toBe(0)
    expect(after.lastProfitQuarter).toBe(2)
  })
})

describe('currentQuarter — the round clock', () => {
  it('groups rounds into quarters of QUARTER_ROUNDS', () => {
    expect(currentQuarter(1)).toBe(0)
    expect(currentQuarter(QUARTER_ROUNDS)).toBe(1)
    expect(currentQuarter(QUARTER_ROUNDS * 2)).toBe(2)
  })
})

describe('gameTime — the in-game calendar', () => {
  it('starts at Year 1, Q1, Month 1 on round 1', () => {
    expect(gameTime(1)).toMatchObject({ year: 1, quarter: 1, monthOfYear: 1, month: 1 })
  })

  it('one round = one month', () => {
    expect(gameTime(5).month).toBe(5)
    expect(gameTime(5).monthOfYear).toBe(5)
  })

  it('groups months into quarters of MONTHS_PER_QUARTER', () => {
    expect(gameTime(QUARTER_ROUNDS).quarter).toBe(1)       // last month of Q1
    expect(gameTime(QUARTER_ROUNDS + 1).quarter).toBe(2)   // first month of Q2
  })

  it('rolls over to the next year after MONTHS_PER_YEAR rounds', () => {
    expect(gameTime(MONTHS_PER_YEAR)).toMatchObject({ year: 1, monthOfYear: MONTHS_PER_YEAR })
    expect(gameTime(MONTHS_PER_YEAR + 1)).toMatchObject({ year: 2, quarter: 1, monthOfYear: 1 })
  })

  it('clamps non-positive rounds to month 1 and builds a readable label', () => {
    expect(gameTime(0).month).toBe(1)
    expect(gameTime(MONTHS_PER_YEAR + 5).label).toBe('Year 2 · Q2 · Month 5')
  })
})

describe('absorbLoss — crisis buffer', () => {
  it('leaves envelopes untouched when cash covers the loss', () => {
    const fin = makeFinances({ cashBalance: 1000, profitAccount: 500, taxAccount: 500 })
    const out = absorbLoss(fin, 600)
    expect(out.cashBalance).toBe(400)
    expect(out.profitAccount).toBe(500)
    expect(out.taxAccount).toBe(500)
  })

  it('absorbs an overdraw from Tax first, then Profit', () => {
    const fin = makeFinances({ cashBalance: 100, profitAccount: 500, taxAccount: 300 })
    const out = absorbLoss(fin, 500) // 400 shortfall: 300 from Tax, 100 from Profit
    expect(out.cashBalance).toBe(0)
    expect(out.taxAccount).toBe(0)
    expect(out.profitAccount).toBe(400)
  })

  it('only the part the envelopes cannot cover hits cash (can still go negative)', () => {
    const fin = makeFinances({ cashBalance: 0, profitAccount: 100, taxAccount: 100 })
    const out = absorbLoss(fin, 500) // 200 absorbed, 300 unfunded
    expect(out.cashBalance).toBe(-300)
    expect(out.profitAccount).toBe(0)
    expect(out.taxAccount).toBe(0)
  })

  it('routes a cash_loss CardEffect through the buffer', () => {
    const player = makePlayer({
      finances: makeFinances({ cashBalance: 100, profitAccount: 0, taxAccount: 1000 }),
    })
    const after = applyCardEffect(player, { type: 'cash_loss', amount: 600 }, 1)
    expect(after.finances.cashBalance).toBe(0) // 500 shortfall taken from Tax
    expect(after.finances.taxAccount).toBe(500)
  })
})

describe('sealed reserve in summary + anchors', () => {
  it('counts sealed money in net worth', () => {
    const fin = makeFinances({ cashBalance: 1000, profitAccount: 400, taxAccount: 200 })
    const summary = computeSummary(fin)
    expect(sealedReserve(fin)).toBe(600)
    expect(summary.sealedReserve).toBe(600)
    // netWorth = cash(1000) + sealed(600) + assets(0) − liabilities(0)
    expect(summary.netWorth).toBe(1600)
  })

  it('sealed reserve satisfies the `safe` anchor (6mo runway), so discipline is not punished', () => {
    // expenses = 1500/mo → 6mo buffer = 9000. cash 5000 + sealed 4000 = 9000.
    const fin = makeFinances({ cashBalance: 5000, profitAccount: 4000 })
    const player = makePlayer({
      finances: fin,
      anchors: makeAnchors(['door', 'scale']), // prerequisites already cleared
      positiveCashFlowTurns: 3,
    })
    const after = evaluateAnchors(player, 5)
    expect(after.anchors.find((a) => a.anchorId === 'safe')?.unlocked).toBe(true)
  })

  it('without the sealed reserve the same cash falls short of the `safe` buffer', () => {
    const player = makePlayer({
      finances: makeFinances({ cashBalance: 5000, profitAccount: 0 }),
      anchors: makeAnchors(['door', 'scale']),
      positiveCashFlowTurns: 3,
    })
    const after = evaluateAnchors(player, 5)
    expect(after.anchors.find((a) => a.anchorId === 'safe')?.unlocked).toBe(false)
  })
})
