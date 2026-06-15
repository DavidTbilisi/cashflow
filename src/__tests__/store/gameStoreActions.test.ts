import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, selectCurrentPlayer } from '../../store/gameStore'
import { makePlayer, makeFinances } from '../fixtures'
import type { GameState, Card, Asset } from '../../domain/entities/types'
import { TIME_BASE, TIME_CAPACITY } from '../../domain/services/timeService'
import { SOCIAL_CAP, CHARITY_SOCIAL_GAIN } from '../../domain/services/socialService'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGame(): GameState {
  const g = useGameStore.getState().game
  if (!g) throw new Error('No active game')
  return g
}

function getPlayer(index = 0) {
  return getGame().players[index]
}

/** Patch the current game in one shot. */
function patch(partial: Partial<GameState>) {
  useGameStore.setState({ game: { ...getGame(), ...partial } })
}

/** Place a single player and trigger MOVE_COMPLETE for the given roll. */
function moveSingle(playerOverrides: Parameters<typeof makePlayer>[0], roll: number[]) {
  patch({
    players: [makePlayer(playerOverrides)],
    currentTurnPhase: 'rolling',
    lastDiceRoll: roll,
  })
  useGameStore.getState().dispatch({ type: 'MOVE_COMPLETE' })
}

const SELLABLE_ASSET: Asset = {
  id: 'a1',
  name: 'Duplex',
  assetClass: 'real_estate',
  purchasePrice: 50000,
  currentValue: 50000,
  monthlyPassiveIncome: 300,
  monthlyExpense: 0,
  leverageUsed: false,
  liabilityAmount: 0,
  acquiredAtTurn: 1,
  cardId: 'c1',
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  useGameStore.getState().resetGame()
  useGameStore.getState().initGame(
    [{ name: 'Alice', color: '#ff0000', profile: { quadrant: 'E', label: 'Employee', description: '', savings: 0, finances: makeFinances() } }],
    42,
  )
})

// ── Landing routes (routeLanding) ──────────────────────────────────────────────

describe('landing: Charity', () => {
  it('opens the charity prompt', () => {
    moveSingle({ boardPosition: 10 }, [1]) // → 11 (Charity)
    expect(getGame().currentTurnPhase).toBe('charity_prompt')
  })
})

describe('landing: Expense (doodad)', () => {
  it('draws a doodad card and enters the action phase', () => {
    moveSingle({ boardPosition: 1 }, [1]) // → 2 (Expense)
    expect(getGame().activeCard).not.toBeNull()
    expect(getGame().activeCard!.type).toBe('doodad')
    expect(getGame().currentTurnPhase).toBe('action')
  })
})

describe('landing: The Market (no matching asset)', () => {
  it('shows the market card as a plain action when nothing is sellable', () => {
    moveSingle({ boardPosition: 5, finances: makeFinances({ assets: [] }) }, [1]) // → 6 (Market)
    expect(getGame().activeCard).not.toBeNull()
    expect(getGame().currentTurnPhase).toBe('action')
    expect(getGame().marketOffer).toBeNull()
  })
})

describe('landing: Baby', () => {
  it('adds a child and shows the Baby event', () => {
    moveSingle({ boardPosition: 8, finances: makeFinances({ numberOfChildren: 0 }) }, [1]) // → 9 (Baby)
    expect(getPlayer().finances.numberOfChildren).toBe(1)
    expect(getGame().activeCard!.title).toBe('Baby!')
    expect(getGame().currentTurnPhase).toBe('action')
  })

  it('does not exceed the 3-child cap', () => {
    moveSingle({ boardPosition: 8, finances: makeFinances({ numberOfChildren: 3 }) }, [1])
    expect(getPlayer().finances.numberOfChildren).toBe(3)
  })
})

describe('landing: Downsized', () => {
  it('charges total expenses and sets skipTurns to 2', () => {
    moveSingle({ boardPosition: 30, finances: makeFinances({ cashBalance: 10000 }) }, [1]) // → 31 (Downsized)
    const p = getPlayer()
    expect(p.finances.cashBalance).toBe(10000 - 1500) // total expenses = rent 1500
    expect(p.skipTurns).toBe(2)
    expect(p.extraDiceTurns).toBe(0)
    expect(getGame().activeCard!.title).toBe('Downsized!')
  })
})

describe('landing: Tax Audit (fast track)', () => {
  it('removes half the cash on hand', () => {
    moveSingle({ boardTrack: 'fast_track', boardPosition: 3, finances: makeFinances({ cashBalance: 10000 }) }, [1]) // → ft_4
    expect(getPlayer().finances.cashBalance).toBe(5000)
    expect(getGame().activeCard!.title).toBe('Tax Audit')
  })
})

describe('landing: Lawsuit (fast track)', () => {
  it('removes half the cash on hand', () => {
    moveSingle({ boardTrack: 'fast_track', boardPosition: 15, finances: makeFinances({ cashBalance: 8000 }) }, [1]) // → ft_16
    expect(getPlayer().finances.cashBalance).toBe(4000)
    expect(getGame().activeCard!.title).toBe('Lawsuit')
  })
})

describe('landing: Divorce (fast track)', () => {
  it('wipes out all cash on hand', () => {
    moveSingle({ boardTrack: 'fast_track', boardPosition: 12, finances: makeFinances({ cashBalance: 9000 }) }, [1]) // → ft_13
    expect(getPlayer().finances.cashBalance).toBe(0)
    expect(getGame().activeCard!.title).toBe('Divorce')
  })
})

describe('landing: Business Investment (fast track)', () => {
  it('offers the business as a pending purchase', () => {
    moveSingle({ boardTrack: 'fast_track', boardPosition: 1 }, [1]) // → ft_2 (Oil Wells)
    const pp = getGame().pendingPurchase!
    expect(pp.kind).toBe('business')
    expect(pp.cost).toBe(50000) // Oil Wells down payment
    expect(pp.cashFlow).toBe(16000)
    expect(getGame().currentTurnPhase).toBe('action')
  })

  it('is skipped when the business is already owned by another player', () => {
    const owner = makePlayer({ id: 'p1', name: 'Bob', businessesOwned: ['ft_2'] })
    patch({
      players: [makePlayer({ boardTrack: 'fast_track', boardPosition: 1 }), owner],
      currentPlayerIndex: 0,
      currentTurnPhase: 'rolling',
      lastDiceRoll: [1],
    })
    useGameStore.getState().dispatch({ type: 'MOVE_COMPLETE' })
    expect(getGame().pendingPurchase).toBeNull()
    expect(getGame().currentTurnPhase).toBe('end_check')
  })
})

describe('landing: Dream (fast track)', () => {
  it('offers an unchosen Dream as a pending purchase', () => {
    moveSingle({ boardTrack: 'fast_track', boardPosition: 0, dreamId: null }, [1]) // → ft_1 (Private Island)
    const pp = getGame().pendingPurchase!
    expect(pp.kind).toBe('dream')
    expect(pp.cost).toBe(250000) // Private Island base cost
  })

  it('placing a marker on a rival\'s Dream raises its cost', () => {
    const rival = makePlayer({ id: 'p1', name: 'Bob', dreamId: 'dream_island' })
    patch({
      players: [makePlayer({ boardTrack: 'fast_track', boardPosition: 0, dreamId: null }), rival],
      currentPlayerIndex: 0,
      currentTurnPhase: 'rolling',
      lastDiceRoll: [1],
    })
    useGameStore.getState().dispatch({ type: 'MOVE_COMPLETE' })
    expect(getGame().dreamMarkers['dream_island']).toBe(1)
    expect(getGame().activeCard!.title).toBe('Private Island')
    expect(getGame().pendingPurchase).toBeNull()
  })
})

// ── rollDiceWith ────────────────────────────────────────────────────────────────

describe('rollDiceWith', () => {
  it('rolls the requested number of dice (clamped to 1–3)', () => {
    useGameStore.getState().rollDiceWith(5)
    expect(getGame().lastDiceRoll).toHaveLength(3)
    expect(getGame().currentTurnPhase).toBe('rolling')
  })

  it('rolls at least one die when asked for 0', () => {
    useGameStore.getState().rollDiceWith(0)
    expect(getGame().lastDiceRoll).toHaveLength(1)
  })

  it('is a no-op when the player must skip a turn', () => {
    patch({ players: [makePlayer({ skipTurns: 1 })] })
    useGameStore.getState().rollDiceWith(2)
    expect(getGame().currentTurnPhase).toBe('idle')
    expect(getGame().lastDiceRoll).toBeNull()
  })

  it('is a no-op when not idle', () => {
    patch({ currentTurnPhase: 'action' })
    useGameStore.getState().rollDiceWith(2)
    expect(getGame().lastDiceRoll).toBeNull()
  })
})

// ── Charity actions ─────────────────────────────────────────────────────────────

describe('acceptCharity', () => {
  beforeEach(() => patch({ currentTurnPhase: 'charity_prompt' }))

  it('pays the 10% tithe, grants 3 extra-dice turns, and earns Social Capital', () => {
    const cashBefore = getPlayer().finances.cashBalance
    const scBefore = getPlayer().socialCapital
    useGameStore.getState().acceptCharity()
    const p = getPlayer()
    expect(p.finances.cashBalance).toBe(cashBefore - 400) // 10% of 4000 income
    expect(p.extraDiceTurns).toBe(3)
    expect(p.socialCapital).toBe(scBefore + CHARITY_SOCIAL_GAIN)
    expect(getGame().currentTurnPhase).toBe('end_check')
  })

  it('is a no-op outside the charity prompt', () => {
    patch({ currentTurnPhase: 'idle' })
    const cashBefore = getPlayer().finances.cashBalance
    useGameStore.getState().acceptCharity()
    expect(getPlayer().finances.cashBalance).toBe(cashBefore)
  })
})

describe('declineCharity', () => {
  it('moves straight to end_check without charging anything', () => {
    patch({ currentTurnPhase: 'charity_prompt' })
    const cashBefore = getPlayer().finances.cashBalance
    useGameStore.getState().declineCharity()
    expect(getPlayer().finances.cashBalance).toBe(cashBefore)
    expect(getGame().currentTurnPhase).toBe('end_check')
  })
})

// ── Market actions ──────────────────────────────────────────────────────────────

describe('sellMarketAsset', () => {
  it('sells the matching asset and banks the proceeds', () => {
    const marketCard: Card = { id: 'mkt1', type: 'market', title: 'Buyer', description: '', effects: [] }
    patch({
      players: [makePlayer({ finances: makeFinances({ cashBalance: 1000, assets: [SELLABLE_ASSET] }) })],
      activeCard: marketCard,
      marketOffer: [{ assetId: 'a1', assetName: 'Duplex', salePrice: 60000 }],
      currentTurnPhase: 'market_prompt',
    })
    useGameStore.getState().sellMarketAsset('a1')
    const p = getPlayer()
    expect(p.finances.cashBalance).toBe(1000 + 60000)
    expect(p.finances.assets).toHaveLength(0)
    expect(getGame().currentTurnPhase).toBe('end_check')
  })

  it('is a no-op for an asset id not in the offer', () => {
    patch({
      players: [makePlayer({ finances: makeFinances({ assets: [SELLABLE_ASSET] }) })],
      marketOffer: [{ assetId: 'a1', assetName: 'Duplex', salePrice: 60000 }],
      currentTurnPhase: 'market_prompt',
    })
    const cashBefore = getPlayer().finances.cashBalance
    useGameStore.getState().sellMarketAsset('nope')
    expect(getPlayer().finances.cashBalance).toBe(cashBefore)
  })
})

describe('passMarket', () => {
  it('discards the market card and ends the action', () => {
    const marketCard: Card = { id: 'mkt2', type: 'market', title: 'Buyer', description: '', effects: [] }
    patch({ activeCard: marketCard, currentTurnPhase: 'market_prompt' })
    useGameStore.getState().passMarket()
    expect(getGame().currentTurnPhase).toBe('end_check')
    expect(getGame().discardPiles['market']).toContainEqual(marketCard)
  })
})

// ── Pending purchases ───────────────────────────────────────────────────────────

describe('buyPending', () => {
  it('buys a business: deducts cash, records ownership, grows Day income', () => {
    patch({
      players: [makePlayer({ finances: makeFinances({ cashBalance: 60000 }), cashflowDayIncome: 10000 })],
      pendingPurchase: { kind: 'business', spaceId: 'ft_2', label: 'Oil Wells', cost: 50000, cashFlow: 16000 },
    })
    useGameStore.getState().buyPending()
    const p = getPlayer()
    expect(p.finances.cashBalance).toBe(10000)
    expect(p.businessesOwned).toContain('ft_2')
    expect(p.cashflowDayIncome).toBe(26000)
    expect(getGame().currentTurnPhase).toBe('end_check')
  })

  it('buys a Dream: deducts cash and records ownership', () => {
    patch({
      players: [makePlayer({ finances: makeFinances({ cashBalance: 100000 }) })],
      pendingPurchase: { kind: 'dream', spaceId: 'ft_1', label: 'Private Island', cost: 100000, cashFlow: 0 },
    })
    useGameStore.getState().buyPending()
    const p = getPlayer()
    expect(p.finances.cashBalance).toBe(0)
    expect(p.dreamsOwned).toContain('ft_1')
  })

  it('is a no-op when the player cannot afford it', () => {
    patch({
      players: [makePlayer({ finances: makeFinances({ cashBalance: 1000 }) })],
      pendingPurchase: { kind: 'business', spaceId: 'ft_2', label: 'Oil Wells', cost: 50000, cashFlow: 16000 },
    })
    useGameStore.getState().buyPending()
    expect(getPlayer().finances.cashBalance).toBe(1000)
    expect(getPlayer().businessesOwned).toHaveLength(0)
  })
})

describe('skipPending', () => {
  it('clears the pending purchase and ends the action', () => {
    patch({
      pendingPurchase: { kind: 'business', spaceId: 'ft_2', label: 'Oil Wells', cost: 50000, cashFlow: 16000 },
      currentTurnPhase: 'action',
    })
    useGameStore.getState().skipPending()
    expect(getGame().pendingPurchase).toBeNull()
    expect(getGame().currentTurnPhase).toBe('end_check')
  })
})

// ── Loans & debt ────────────────────────────────────────────────────────────────

describe('takeLoan', () => {
  it('borrows in the Rat Race: adds cash and a bank-loan liability', () => {
    patch({ players: [makePlayer({ boardTrack: 'rat_race', finances: makeFinances({ cashBalance: 2000, liabilities: [] }) })] })
    useGameStore.getState().takeLoan(5000)
    const p = getPlayer()
    expect(p.finances.cashBalance).toBe(7000)
    expect(p.finances.liabilities.find((l) => l.id === 'bank_loan')!.totalOwed).toBe(5000)
  })

  it('refuses to lend on the Fast Track', () => {
    patch({ players: [makePlayer({ boardTrack: 'fast_track', finances: makeFinances({ cashBalance: 2000 }) })] })
    useGameStore.getState().takeLoan(5000)
    expect(getPlayer().finances.cashBalance).toBe(2000)
  })
})

describe('payOffDebt', () => {
  it('pays down a bank loan in $1,000 units', () => {
    patch({
      players: [makePlayer({
        finances: makeFinances({
          cashBalance: 10000,
          liabilities: [{ id: 'bank_loan', label: 'Bank Loan', totalOwed: 5000, monthlyPayment: 500 }],
          expenseLines: [{ id: 'bank_loan_payment', label: 'Bank Loan Payment', monthlyAmount: 500, isFixed: true, liabilityId: 'bank_loan' }],
        }),
      })],
    })
    useGameStore.getState().payOffDebt('bank_loan', 2)
    const p = getPlayer()
    expect(p.finances.cashBalance).toBe(8000)
    expect(p.finances.liabilities.find((l) => l.id === 'bank_loan')!.totalOwed).toBe(3000)
  })
})

// ── Fast Track promotion ────────────────────────────────────────────────────────

describe('moveToFastTrack', () => {
  it('promotes a financially-free player and sets the CASHFLOW Day goal', () => {
    patch({
      players: [makePlayer({
        finances: makeFinances({ incomeSources: [{ id: 'r', label: 'Rental', monthlyAmount: 2000, isPassive: true }] }),
      })],
      currentTurnPhase: 'idle',
    })
    useGameStore.getState().moveToFastTrack()
    const p = getPlayer()
    expect(p.boardTrack).toBe('fast_track')
    expect(p.cashflowDayIncome).toBe(200000)
    expect(p.cashflowDayGoal).toBe(250000)
  })

  it('does nothing for a player who is not financially free', () => {
    patch({ currentTurnPhase: 'idle' }) // salary-only fixture → passive 0
    useGameStore.getState().moveToFastTrack()
    expect(getPlayer().boardTrack).toBe('rat_race')
  })

  it('is a no-op outside the idle phase', () => {
    patch({
      players: [makePlayer({
        finances: makeFinances({ incomeSources: [{ id: 'r', label: 'Rental', monthlyAmount: 2000, isPassive: true }] }),
      })],
      currentTurnPhase: 'action',
    })
    useGameStore.getState().moveToFastTrack()
    expect(getPlayer().boardTrack).toBe('rat_race')
  })
})

// ── borrowAndBuy ────────────────────────────────────────────────────────────────

describe('borrowAndBuy', () => {
  const dealCard: Card = {
    id: 'deal1',
    type: 'small_deal',
    title: 'Rental Duplex',
    description: '',
    effects: [{
      type: 'acquire_asset',
      asset: {
        name: 'Duplex', assetClass: 'real_estate', purchasePrice: 50000, currentValue: 50000,
        monthlyPassiveIncome: 300, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 45000, cardId: '',
      },
    }],
  }

  it('borrows the shortfall, buys the asset, and logs one event', () => {
    patch({
      players: [makePlayer({ finances: makeFinances({ cashBalance: 2000, liabilities: [] }) })],
      activeCard: dealCard,
      currentTurnPhase: 'action',
    })
    useGameStore.getState().borrowAndBuy(dealCard)
    const p = getPlayer()
    // down payment = 50000 − 45000 = 5000; shortfall 3000 → borrow 3000 → buy → cash 0
    expect(p.finances.cashBalance).toBe(0)
    expect(p.finances.assets).toHaveLength(1)
    expect(p.finances.liabilities.find((l) => l.id === 'bank_loan')!.totalOwed).toBe(3000)
    expect(getGame().turnLog.some((l) => l.kind === 'purchase')).toBe(true)
    expect(getGame().currentTurnPhase).toBe('end_check')
  })

  it('is a no-op when the player can already afford the deal', () => {
    patch({
      players: [makePlayer({ finances: makeFinances({ cashBalance: 10000, liabilities: [] }) })],
      activeCard: dealCard,
      currentTurnPhase: 'action',
    })
    useGameStore.getState().borrowAndBuy(dealCard)
    const p = getPlayer()
    expect(p.finances.cashBalance).toBe(10000) // untouched
    expect(p.finances.assets).toHaveLength(0)
  })
})

// ── negotiateDoodad ─────────────────────────────────────────────────────────────

describe('negotiateDoodad', () => {
  const wantDoodad: Card = {
    id: 'dd1', type: 'doodad', title: 'New Gadget', description: '',
    lifestyleCategory: 'want', effects: [{ type: 'cash_loss', amount: 1000 }],
  }

  it('spends time to halve a discretionary (want) Doodad', () => {
    patch({
      players: [makePlayer({ freeTimeUnits: 5 })],
      activeCard: wantDoodad,
      currentTurnPhase: 'action',
      doodadNegotiated: false,
    })
    useGameStore.getState().negotiateDoodad()
    const card = getGame().activeCard!
    expect((card.effects[0] as { amount: number }).amount).toBe(500)
    expect(getPlayer().freeTimeUnits).toBe(3) // 5 − 2
    expect(getGame().doodadNegotiated).toBe(true)
  })

  it('refuses to negotiate a mandatory (need) Doodad', () => {
    patch({
      activeCard: { ...wantDoodad, lifestyleCategory: 'need' },
      currentTurnPhase: 'action',
      doodadNegotiated: false,
    })
    useGameStore.getState().negotiateDoodad()
    expect((getGame().activeCard!.effects[0] as { amount: number }).amount).toBe(1000)
    expect(getGame().doodadNegotiated).toBe(false)
  })

  it('is a no-op without enough free time', () => {
    patch({
      players: [makePlayer({ freeTimeUnits: 1 })],
      activeCard: wantDoodad,
      currentTurnPhase: 'action',
      doodadNegotiated: false,
    })
    useGameStore.getState().negotiateDoodad()
    expect((getGame().activeCard!.effects[0] as { amount: number }).amount).toBe(1000)
  })

  it('cannot be applied twice', () => {
    patch({
      players: [makePlayer({ freeTimeUnits: 5 })],
      activeCard: wantDoodad,
      currentTurnPhase: 'action',
      doodadNegotiated: true,
    })
    useGameStore.getState().negotiateDoodad()
    expect(getPlayer().freeTimeUnits).toBe(5) // unchanged
  })
})

// ── resolveCard with a NECST gate effect ───────────────────────────────────────

describe('resolveCard skips necst_gate effects', () => {
  it('applies non-gate effects and ignores the gate', () => {
    const card: Card = {
      id: 'mixed', type: 'income', title: 'Mixed', description: '',
      effects: [
        { type: 'cash_gain', amount: 1000 },
        { type: 'necst_gate', onPass: [{ type: 'cash_gain', amount: 9999 }], onFail: [] },
      ],
    }
    patch({ activeCard: card, currentTurnPhase: 'action' })
    const before = getPlayer().finances.cashBalance
    useGameStore.getState().resolveCard(card, true)
    expect(getPlayer().finances.cashBalance).toBe(before + 1000) // gate not applied
  })
})

// ── END_TURN side-effects ───────────────────────────────────────────────────────

describe('END_TURN: quadrant advancement', () => {
  it('advances B→I and resets time/social caps to the new quadrant', () => {
    patch({
      players: [makePlayer({
        quadrant: 'B',
        socialCapital: 5,
        finances: makeFinances({ incomeSources: [{ id: 'r', label: 'Rental', monthlyAmount: 1000, isPassive: true }] }),
      })],
      currentTurnPhase: 'end_check',
    })
    useGameStore.getState().dispatch({ type: 'END_TURN' })
    const p = getGame().players[0]
    expect(p.quadrant).toBe('I')
    expect(p.freeTimeUnits).toBe(TIME_BASE['I'])
    expect(p.timeCapacity).toBe(TIME_CAPACITY['I'])
    expect(p.socialCapitalCap).toBe(SOCIAL_CAP['I'])
  })
})

describe('END_TURN: Charity extra-dice countdown', () => {
  it('decrements extraDiceTurns each Rat Race turn', () => {
    patch({
      players: [makePlayer({ extraDiceTurns: 3, boardTrack: 'rat_race' })],
      currentTurnPhase: 'end_check',
    })
    useGameStore.getState().dispatch({ type: 'END_TURN' })
    expect(getGame().players[0].extraDiceTurns).toBe(2)
  })
})

// ── Dev / utility actions ────────────────────────────────────────────────────────

describe('forceNextDice', () => {
  it('forces the result of the next roll, then reverts', () => {
    useGameStore.getState().forceNextDice([5])
    useGameStore.getState().dispatch({ type: 'ROLL_DICE' })
    expect(getGame().lastDiceRoll).toEqual([5])
  })
})

describe('debug actions', () => {
  it('debugGiveMoney adds cash to the current player', () => {
    const before = getPlayer().finances.cashBalance
    useGameStore.getState().debugGiveMoney(1234)
    expect(getPlayer().finances.cashBalance).toBe(before + 1234)
  })

  it('debugForceTrack promotes to the fast track and back', () => {
    patch({ players: [makePlayer({ finances: makeFinances({ incomeSources: [{ id: 'r', label: 'Rental', monthlyAmount: 500, isPassive: true }] }) })] })
    useGameStore.getState().debugForceTrack('fast_track')
    expect(getPlayer().boardTrack).toBe('fast_track')
    useGameStore.getState().debugForceTrack('rat_race')
    expect(getPlayer().boardTrack).toBe('rat_race')
    expect(getPlayer().boardPosition).toBe(0)
  })

  it('debugSetDice primes the next roll', () => {
    useGameStore.getState().debugSetDice([6])
    useGameStore.getState().dispatch({ type: 'ROLL_DICE' })
    expect(getGame().lastDiceRoll).toEqual([6])
  })
})

// ── selectCurrentPlayer selector ─────────────────────────────────────────────────

describe('selectCurrentPlayer', () => {
  it('returns the active player', () => {
    expect(selectCurrentPlayer(useGameStore.getState())?.name).toBe('Alice')
  })

  it('returns null when there is no game', () => {
    useGameStore.getState().resetGame()
    expect(selectCurrentPlayer(useGameStore.getState())).toBeNull()
  })
})
