import { describe, it, expect, beforeEach } from 'vitest'
import {
  computeSummary,
  buyoutIncome,
  takeBankLoan,
  payOffLiability,
  sellAsset,
  applyCardEffect,
} from '../../domain/services/financialCalc'
import { useGameStore } from '../../store/gameStore'
import { makePlayer, makeFinances } from '../fixtures'

// ── Children / child expense ────────────────────────────────────────────────

describe('child expenses', () => {
  it('adds numberOfChildren × perChildExpense to total expenses', () => {
    const fin = makeFinances({
      incomeSources: [{ id: 's', label: 'Salary', monthlyAmount: 4000, isPassive: false }],
      expenseLines: [{ id: 'r', label: 'Rent', monthlyAmount: 1000, isFixed: true }],
      numberOfChildren: 2,
      perChildExpense: 140,
    })
    const s = computeSummary(fin)
    expect(s.childExpense).toBe(280)
    expect(s.totalMonthlyExpenses).toBe(1280)
    expect(s.monthlyCashFlow).toBe(2720)
  })

  it('add_child effect respects the cap of 3', () => {
    let p = makePlayer({ finances: makeFinances({ numberOfChildren: 2, perChildExpense: 100 }) })
    p = applyCardEffect(p, { type: 'add_child' }, 1)
    expect(p.finances.numberOfChildren).toBe(3)
    p = applyCardEffect(p, { type: 'add_child' }, 1)
    expect(p.finances.numberOfChildren).toBe(3) // capped
  })
})

// ── Bank loans ────────────────────────────────────────────────────────────────

describe('takeBankLoan', () => {
  it('borrows in $1,000 units at $100/$1,000 payment and accumulates', () => {
    let p = makePlayer({ finances: makeFinances({ cashBalance: 1000, liabilities: [] }) })
    p = takeBankLoan(p, 3000)
    expect(p.finances.cashBalance).toBe(4000)
    const loan = p.finances.liabilities.find((l) => l.id === 'bank_loan')!
    expect(loan.totalOwed).toBe(3000)
    expect(loan.monthlyPayment).toBe(300)
    const pay = p.finances.expenseLines.find((e) => e.id === 'bank_loan_payment')!
    expect(pay.monthlyAmount).toBe(300)
    // A second loan accumulates into the same liability.
    p = takeBankLoan(p, 2000)
    expect(p.finances.liabilities.find((l) => l.id === 'bank_loan')!.totalOwed).toBe(5000)
    expect(p.finances.expenseLines.find((e) => e.id === 'bank_loan_payment')!.monthlyAmount).toBe(500)
  })

  it('ignores amounts under $1,000', () => {
    const p = makePlayer({ finances: makeFinances({ cashBalance: 1000 }) })
    expect(takeBankLoan(p, 500).finances.cashBalance).toBe(1000)
  })
})

// ── Paying off debt ─────────────────────────────────────────────────────────

describe('payOffLiability', () => {
  it('pays a normal debt in full and removes its expense line', () => {
    const p = makePlayer({
      finances: makeFinances({
        cashBalance: 60000,
        liabilities: [{ id: 'car', label: 'Car Loan', totalOwed: 5000, monthlyPayment: 200 }],
        expenseLines: [{ id: 'carpay', label: 'Car Payment', monthlyAmount: 200, isFixed: true, liabilityId: 'car' }],
      }),
    })
    const after = payOffLiability(p, 'car')
    expect(after.finances.cashBalance).toBe(55000)
    expect(after.finances.liabilities.find((l) => l.id === 'car')).toBeUndefined()
    expect(after.finances.expenseLines.find((e) => e.liabilityId === 'car')).toBeUndefined()
  })

  it('refuses a payoff the player cannot afford', () => {
    const p = makePlayer({
      finances: makeFinances({ cashBalance: 100, liabilities: [{ id: 'car', label: 'Car', totalOwed: 5000, monthlyPayment: 200 }] }),
    })
    expect(payOffLiability(p, 'car').finances.cashBalance).toBe(100)
  })

  it('pays down a bank loan in $1,000 units, reducing the payment by $100', () => {
    let p = makePlayer({ finances: makeFinances({ cashBalance: 5000 }) })
    p = takeBankLoan(p, 3000) // owed 3000, pay 300, cash 8000
    p = payOffLiability(p, 'bank_loan', 1) // pay $1,000
    const loan = p.finances.liabilities.find((l) => l.id === 'bank_loan')!
    expect(loan.totalOwed).toBe(2000)
    expect(loan.monthlyPayment).toBe(200)
    expect(p.finances.cashBalance).toBe(7000)
  })
})

// ── Selling an asset ──────────────────────────────────────────────────────────

describe('sellAsset', () => {
  it('settles sale price minus mortgage and removes asset, income, and liability', () => {
    let p = makePlayer({ finances: makeFinances({ cashBalance: 100000 }) })
    p = applyCardEffect(p, {
      type: 'acquire_asset',
      asset: { name: 'Condo', assetClass: 'real_estate', purchasePrice: 50000, currentValue: 50000, monthlyPassiveIncome: 300, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 40000, cardId: '' },
    }, 1)
    expect(p.finances.cashBalance).toBe(90000) // paid the $10k down payment
    const asset = p.finances.assets[0]
    const sold = sellAsset(p, asset.id, 65000)
    expect(sold.finances.cashBalance).toBe(90000 + (65000 - 40000)) // settlement net of mortgage
    expect(sold.finances.assets).toHaveLength(0)
    expect(sold.finances.incomeSources.find((i) => i.assetId === asset.id)).toBeUndefined()
    expect(sold.finances.liabilities.find((l) => l.assetId === asset.id)).toBeUndefined()
  })
})

// ── Fast Track buyout ─────────────────────────────────────────────────────────

describe('buyoutIncome', () => {
  it('is 100× passive income', () => {
    const fin = makeFinances({ incomeSources: [{ id: 'r', label: 'Rental', monthlyAmount: 2000, isPassive: true }] })
    expect(buyoutIncome(fin)).toBe(200000)
  })
})

// ── Store flows for the new spaces ─────────────────────────────────────────────

describe('store: rulebook spaces', () => {
  beforeEach(() => {
    const { resetGame, initGame } = useGameStore.getState()
    resetGame()
    initGame([{ name: 'Solo', color: '#fff', profile: { quadrant: 'E', label: 'T', description: '', savings: 0, finances: makeFinances() } }], 7)
  })
  const game = () => useGameStore.getState().game!
  const setGame = (patch: object) => useGameStore.setState({ game: { ...game(), ...patch } })

  it('Charity: donating reduces cash by 10% of income and grants 2 dice for 3 turns', () => {
    setGame({ currentTurnPhase: 'charity_prompt' })
    const income = computeSummary(game().players[0].finances).totalMonthlyIncome
    const beforeCash = game().players[0].finances.cashBalance
    useGameStore.getState().acceptCharity()
    const p = game().players[0]
    expect(p.finances.cashBalance).toBe(beforeCash - Math.round(income * 0.1))
    expect(p.extraDiceTurns).toBe(3)
    expect(game().currentTurnPhase).toBe('end_check')
  })

  it('Business purchase adds its cash flow to CASHFLOW Day income', () => {
    setGame({
      currentTurnPhase: 'action',
      players: [makePlayer({ boardTrack: 'fast_track', cashflowDayIncome: 0, cashflowDayGoal: 100000, finances: makeFinances({ cashBalance: 100000 }) })],
      pendingPurchase: { kind: 'business', spaceId: 'ft_1', label: 'Oil Wells', cost: 50000, cashFlow: 16000 },
    })
    useGameStore.getState().buyPending()
    const p = game().players[0]
    expect(p.cashflowDayIncome).toBe(16000)
    expect(p.finances.cashBalance).toBe(50000)
    expect(p.businessesOwned).toContain('ft_1')
  })

  it('Buying a Dream then ending the turn wins the game', () => {
    setGame({
      currentTurnPhase: 'action',
      players: [makePlayer({ boardTrack: 'fast_track', finances: makeFinances({ cashBalance: 200000 }) })],
      pendingPurchase: { kind: 'dream', spaceId: 'ft_2', label: 'Private Jet', cost: 150000, cashFlow: 0 },
    })
    useGameStore.getState().buyPending()
    expect(game().players[0].dreamsOwned).toContain('ft_2')
    useGameStore.getState().dispatch({ type: 'END_TURN' })
    expect(game().status).toBe('completed_win')
  })
})

// ── Fast Track Charity dice chooser ───────────────────────────────────────────

describe('rollDiceWith (Fast Track Charity perk)', () => {
  const prof = { quadrant: 'E' as const, label: 'T', description: '', savings: 0, finances: makeFinances() }
  beforeEach(() => {
    const { resetGame, initGame } = useGameStore.getState()
    resetGame()
    initGame([{ name: 'Solo', color: '#fff', profile: prof }], 3)
  })
  const game = () => useGameStore.getState().game!
  const setPlayer0 = (patch: object) =>
    useGameStore.setState({ game: { ...game(), currentTurnPhase: 'idle', players: [{ ...game().players[0], ...patch }] } })

  it('rolls the chosen number of dice', () => {
    setPlayer0({ boardTrack: 'fast_track', fastTrackDiceChoice: true })
    useGameStore.getState().rollDiceWith(3)
    expect(game().lastDiceRoll).toHaveLength(3)
    expect(game().currentTurnPhase).toBe('rolling')
  })

  it('clamps the count to 1–3', () => {
    setPlayer0({ boardTrack: 'fast_track', fastTrackDiceChoice: true })
    useGameStore.getState().rollDiceWith(9)
    expect(game().lastDiceRoll).toHaveLength(3)
  })
})

// ── Dream cost-doubling (landing on another player's Dream) ───────────────────

describe('Dream cost-doubling', () => {
  const prof = { quadrant: 'E' as const, label: 'T', description: '', savings: 0, finances: makeFinances({ cashBalance: 600000 }) }
  beforeEach(() => {
    const { resetGame, initGame } = useGameStore.getState()
    resetGame()
    // Player B (idx 1) chose dream_island, which sits on board space ft_1.
    initGame(
      [
        { name: 'A', color: '#fff', profile: prof, dreamId: null },
        { name: 'B', color: '#000', profile: prof, dreamId: 'dream_island' },
      ],
      9,
    )
  })
  const game = () => useGameStore.getState().game!

  it("landing on another player's Dream leaves a marker and offers no purchase", () => {
    useGameStore.setState({
      game: {
        ...game(),
        currentPlayerIndex: 0,
        currentTurnPhase: 'rolling',
        lastDiceRoll: [1], // fast-track 0 → 1 (ft_1 = dream_island)
        players: game().players.map((p, i) => (i === 0 ? { ...p, boardTrack: 'fast_track', boardPosition: 0 } : p)),
      },
    })
    useGameStore.getState().dispatch({ type: 'MOVE_COMPLETE' })
    expect(game().dreamMarkers['dream_island']).toBe(1)
    expect(game().pendingPurchase).toBeNull() // can't buy someone else's Dream
    expect(game().activeCard?.type).toBe('event')
  })

  it("the chooser then pays double for their own Dream", () => {
    // Seed one marker, then let player B (the chooser) land on ft_1.
    useGameStore.setState({
      game: {
        ...game(),
        currentPlayerIndex: 1,
        currentTurnPhase: 'rolling',
        lastDiceRoll: [1],
        dreamMarkers: { dream_island: 1 },
        players: game().players.map((p, i) => (i === 1 ? { ...p, boardTrack: 'fast_track', boardPosition: 0 } : p)),
      },
    })
    useGameStore.getState().dispatch({ type: 'MOVE_COMPLETE' })
    // dream_island base cost is $250,000 → ×(1+1 marker) = $500,000
    expect(game().pendingPurchase).not.toBeNull()
    expect(game().pendingPurchase!.cost).toBe(500000)
  })
})
