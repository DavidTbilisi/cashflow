import { describe, it, expect } from 'vitest'
import { evaluateWinConditions, canEnterFastTrack } from '../../domain/rules/winRules'
import { makePlayer, makeGame, makeFinances, makeAnchors } from '../fixtures'

describe('evaluateWinConditions — win paths', () => {
  it('win: bought a Dream on the Fast Track', () => {
    const game = makeGame({ boardTrack: 'fast_track', dreamsOwned: ['dream_jet'] })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('win')
    if (result.status === 'win') {
      expect(result.winnerId).toBe('p0')
      expect(result.reason).toMatch(/dream/i)
    }
  })

  it('win: reached the CASHFLOW Day income goal on the Fast Track', () => {
    const game = makeGame({ boardTrack: 'fast_track', cashflowDayIncome: 60000, cashflowDayGoal: 50000 })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('win')
    if (result.status === 'win') {
      expect(result.reason).toMatch(/cashflow day/i)
    }
  })

  it('no win: passive >= expenses on the Fast Track is the entry gate, not a victory', () => {
    const game = makeGame({
      boardTrack: 'fast_track',
      finances: makeFinances({
        incomeSources: [
          { id: 'sal', label: 'Salary', monthlyAmount: 2000, isPassive: false },
          { id: 'pas', label: 'Rental', monthlyAmount: 2000, isPassive: true },
        ],
      }),
    })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('continue')
  })

  it('no win: passive income >= expenses but still on rat race', () => {
    const game = makeGame({
      boardTrack: 'rat_race', // must be on fast_track
      finances: makeFinances({
        incomeSources: [
          { id: 'sal', label: 'Salary', monthlyAmount: 2000, isPassive: false },
          { id: 'pas', label: 'Rental', monthlyAmount: 2000, isPassive: true },
        ],
      }),
    })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('continue')
  })

  it('win: all six anchors unlocked', () => {
    const game = makeGame({
      anchors: makeAnchors(['door', 'scale', 'safe', 'chain', 'engine', 'shield']),
    })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('win')
    if (result.status === 'win') {
      expect(result.reason).toMatch(/anchor/i)
    }
  })

  it('win: B quadrant player on fast track', () => {
    const game = makeGame({ quadrant: 'B', boardTrack: 'fast_track' })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('win')
    if (result.status === 'win') {
      expect(result.reason).toMatch(/fast track/i)
    }
  })

  it('win: I quadrant player on fast track', () => {
    const game = makeGame({ quadrant: 'I', boardTrack: 'fast_track' })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('win')
  })

  it('no win: E quadrant on fast track is not enough', () => {
    const game = makeGame({ quadrant: 'E', boardTrack: 'fast_track' })
    const result = evaluateWinConditions(game)
    // Would only win via passive income condition
    expect(result.status).toBe('continue')
  })
})

describe('evaluateWinConditions — fail paths', () => {
  it('fail: bankruptcy (negative cash AND negative net worth)', () => {
    const game = makeGame({
      finances: makeFinances({
        cashBalance: -1000,
        liabilities: [{ id: 'l1', label: 'Debt', totalOwed: 50000, monthlyPayment: 500 }],
      }),
    })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('fail')
    if (result.status === 'fail') {
      expect(result.loserId).toBe('p0')
      expect(result.reason).toMatch(/bankrupt/i)
    }
  })

  it('fail: turnsStuckInRatRace >= 3 on rat race', () => {
    const game = makeGame({ turnsStuckInRatRace: 3, boardTrack: 'rat_race' })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('fail')
    if (result.status === 'fail') {
      expect(result.reason).toMatch(/rat race/i)
    }
  })

  it('no fail: turnsStuckInRatRace >= 3 but on fast track (already escaped)', () => {
    const game = makeGame({ turnsStuckInRatRace: 5, boardTrack: 'fast_track' })
    const result = evaluateWinConditions(game)
    // not a fail for rat race if on fast track; may win via B/I quadrant etc.
    // with default E quadrant and no passive income should be continue
    expect(result.status).toBe('continue')
  })

  it('no fail: negative cash but positive net worth (asset coverage)', () => {
    const game = makeGame({
      finances: makeFinances({
        cashBalance: -500,
        assets: [
          {
            id: 'ast1', name: 'Stock', assetClass: 'stocks',
            purchasePrice: 5000, currentValue: 50000,
            monthlyPassiveIncome: 0, monthlyExpense: 0,
            leverageUsed: false, liabilityAmount: 0, acquiredAtTurn: 1, cardId: '',
          },
        ],
      }),
    })
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('continue')
  })
})

describe('evaluateWinConditions — continue path', () => {
  it('returns continue when no conditions met', () => {
    const game = makeGame()
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('continue')
  })

  it('checks all players (first winner wins)', () => {
    const player1 = makePlayer({ id: 'p0', name: 'Alice' })
    const player2 = makePlayer({
      id: 'p1',
      name: 'Bob',
      anchors: makeAnchors(['door', 'scale', 'safe', 'chain', 'engine', 'shield']),
    })
    const game = { ...makeGame(), players: [player1, player2] }
    const result = evaluateWinConditions(game)
    expect(result.status).toBe('win')
    if (result.status === 'win') {
      expect(result.winnerId).toBe('p1')
    }
  })
})

describe('canEnterFastTrack', () => {
  it('true when passive income exceeds expenses in the Rat Race', () => {
    const player = makePlayer({
      finances: makeFinances({
        expenseLines: [{ id: 'e', label: 'Living', monthlyAmount: 1500, isFixed: true }],
        incomeSources: [{ id: 'p', label: 'Rental', monthlyAmount: 2000, isPassive: true }],
      }),
    })
    expect(canEnterFastTrack(player)).toBe(true)
  })

  it('false when passive income does not cover expenses', () => {
    const player = makePlayer() // salary only, no passive income
    expect(canEnterFastTrack(player)).toBe(false)
  })

  it('false once already on the Fast Track', () => {
    const player = makePlayer({
      boardTrack: 'fast_track',
      finances: makeFinances({ incomeSources: [{ id: 'p', label: 'Rental', monthlyAmount: 9000, isPassive: true }] }),
    })
    expect(canEnterFastTrack(player)).toBe(false)
  })
})
