import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../store/gameStore'
import { makePlayer, makeFinances, makeAnchors, NECST_CARD } from '../fixtures'
import type { GameState, Card } from '../../domain/entities/types'
import { ALL_BOARD_SPACES } from '../../domain/data/boardSpaces'
import { buildDecks } from '../../domain/services/cardService'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getGame(): GameState {
  const g = useGameStore.getState().game
  if (!g) throw new Error('No active game')
  return g
}

function getPlayer(index = 0) {
  return getGame().players[index]
}

/** Force the store into a known mid-turn state, bypassing dice randomness */
function setRollingState(roll: [number, number]) {
  useGameStore.setState({
    game: {
      ...getGame(),
      currentTurnPhase: 'rolling',
      lastDiceRoll: roll,
    },
  })
}

/** Teleport current player to a position so that adding `roll` lands them exactly on `targetPos` */
function positionForLanding(targetPos: number, roll: number, trackLength: number): number {
  return ((targetPos - roll) % trackLength + trackLength) % trackLength
}

const { dispatch, resolveCard, resolveNECST, resetGame } = useGameStore.getState()

/** Resolve whatever prompt a landing produced, declining everything, to reach end_check. */
function settleTurn() {
  const store = useGameStore.getState()
  const phase = getGame().currentTurnPhase
  if (phase === 'choose_deal') {
    store.chooseDeal('small')
    resolveCard(getGame().activeCard!, false)
  } else if (phase === 'charity_prompt') {
    store.declineCharity()
  } else if (phase === 'market_prompt') {
    store.passMarket()
  } else if (phase === 'action') {
    if (getGame().pendingPurchase) store.skipPending()
    else resolveCard(getGame().activeCard!, false)
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetGame()
  useGameStore.getState().initGame(
    [{ name: 'Alice', color: '#ff0000', profile: { quadrant: 'E', label: 'Employee', description: '', savings: 0, finances: makeFinances() } }],
    42,
  )
})

// ── initGame ─────────────────────────────────────────────────────────────────

describe('initGame', () => {
  it('creates a game in in_progress status', () => {
    expect(getGame().status).toBe('in_progress')
  })

  it('starts in idle phase', () => {
    expect(getGame().currentTurnPhase).toBe('idle')
  })

  it('creates player at position 0 on rat race', () => {
    const p = getPlayer()
    expect(p.boardTrack).toBe('rat_race')
    expect(p.boardPosition).toBe(0)
  })

  it('populates all board spaces', () => {
    expect(getGame().boardSpaces.length).toBeGreaterThan(0)
  })

  it('populates all draw decks', () => {
    const decks = getGame().drawDecks
    expect(Object.keys(decks).length).toBeGreaterThanOrEqual(6)
  })

  it('two games with same seed have identical deck orders', () => {
    const decksBefore = getGame().drawDecks
    resetGame()
    useGameStore.getState().initGame(
      [{ name: 'Bob', color: '#0000ff', profile: { quadrant: 'E', label: '', description: '', savings: 0, finances: makeFinances() } }],
      42,
    )
    const decksAfter = getGame().drawDecks
    for (const type of Object.keys(decksBefore) as Array<keyof typeof decksBefore>) {
      expect(decksBefore[type]?.map((c) => c.id)).toEqual(decksAfter[type]?.map((c) => c.id))
    }
  })

  it('resetGame clears game state', () => {
    resetGame()
    expect(useGameStore.getState().game).toBeNull()
  })
})

// ── ROLL_DICE ─────────────────────────────────────────────────────────────────

describe('ROLL_DICE', () => {
  it('transitions phase from idle → rolling', () => {
    dispatch({ type: 'ROLL_DICE' })
    expect(getGame().currentTurnPhase).toBe('rolling')
  })

  it('sets lastDiceRoll with one die in the Rat Race', () => {
    dispatch({ type: 'ROLL_DICE' })
    const roll = getGame().lastDiceRoll!
    expect(roll).toHaveLength(1) // Rat Race rolls a single die (rules-accurate)
    expect(roll[0]).toBeGreaterThanOrEqual(1)
    expect(roll[0]).toBeLessThanOrEqual(6)
  })

  it('is a no-op when not in idle phase', () => {
    dispatch({ type: 'ROLL_DICE' }) // phase → rolling
    dispatch({ type: 'ROLL_DICE' }) // should be ignored
    expect(getGame().currentTurnPhase).toBe('rolling')
  })
})

// ── MOVE_COMPLETE — neutral space ─────────────────────────────────────────────

describe('MOVE_COMPLETE on a terminal (anchor) space', () => {
  it('advances player position and moves to end_check', () => {
    // Index 4 is the Door anchor milestone → resolves straight to end_check.
    const roll = [4] // single die, total 4 → position 0 → 4
    useGameStore.setState({
      game: {
        ...getGame(),
        players: [makePlayer({ boardPosition: 0, boardTrack: 'rat_race' })],
        currentTurnPhase: 'rolling',
        lastDiceRoll: roll,
      },
    })
    dispatch({ type: 'MOVE_COMPLETE' })
    const p = getPlayer()
    expect(p.boardPosition).toBe(4)
    expect(getGame().currentTurnPhase).toBe('end_check')
  })
})

// ── MOVE_COMPLETE — payday space ──────────────────────────────────────────────

describe('MOVE_COMPLETE on payday space', () => {
  it('applies payday (adds monthly cash flow) and moves to end_check', () => {
    // RAT_RACE payday spaces: 0, 10, 20, 30
    // Place player at position 8, roll [1,2]=3 → lands on position 11... no
    // Place player at 8, roll [1,1]=2 → 10 (payday)
    const roll: [number, number] = [1, 1] // total 2
    const startCash = 5000
    useGameStore.setState({
      game: {
        ...getGame(),
        players: [makePlayer({ boardPosition: 8, finances: makeFinances({ cashBalance: startCash }) })],
        currentTurnPhase: 'rolling',
        lastDiceRoll: roll,
      },
    })
    dispatch({ type: 'MOVE_COMPLETE' })
    const p = getPlayer()
    expect(p.boardPosition).toBe(10)
    // cashFlow = income(4000) - expense(1500) = +2500
    expect(p.finances.cashBalance).toBe(startCash + 2500)
    expect(getGame().currentTurnPhase).toBe('end_check')
  })

  it('wraps position to 0 (payday) when roll goes past end of track', () => {
    // 40-space rat race — put player at 38, roll [1,2]=3 → wraps to 1
    // Actually wrap: (38 + 3) % 40 = 1 → card_draw, not payday
    // (38 + 2) % 40 = 0 → payday
    const roll: [number, number] = [1, 1] // total=2, (38+2)%40=0 = payday
    useGameStore.setState({
      game: {
        ...getGame(),
        players: [makePlayer({ boardPosition: 38, finances: makeFinances({ cashBalance: 1000 }) })],
        currentTurnPhase: 'rolling',
        lastDiceRoll: roll,
      },
    })
    dispatch({ type: 'MOVE_COMPLETE' })
    const p = getPlayer()
    expect(p.boardPosition).toBe(0)
    expect(p.finances.cashBalance).toBe(3500) // 1000 + 2500 cash flow
  })
})

// ── MOVE_COMPLETE — card draw space ──────────────────────────────────────────

describe('MOVE_COMPLETE on card_draw space', () => {
  it('sets activeCard and transitions to action phase', () => {
    // Index 37 is a custom card_draw tile (Obstacle deck). 35 → 37 passes only the
    // Fast Track entry tile (36), no payday.
    const roll = [2] // single die, total 2 → 35 → 37
    useGameStore.setState({
      game: {
        ...getGame(),
        players: [makePlayer({ boardPosition: 35 })],
        currentTurnPhase: 'rolling',
        lastDiceRoll: roll,
      },
    })
    dispatch({ type: 'MOVE_COMPLETE' })
    expect(getGame().activeCard).not.toBeNull()
    expect(getGame().currentTurnPhase).toBe('action')
  })

  it('lands on Opportunity → choose_deal phase', () => {
    const roll = [1] // 0 → 1 (opportunity)
    useGameStore.setState({
      game: {
        ...getGame(),
        players: [makePlayer({ boardPosition: 0 })],
        currentTurnPhase: 'rolling',
        lastDiceRoll: roll,
      },
    })
    dispatch({ type: 'MOVE_COMPLETE' })
    expect(getGame().currentTurnPhase).toBe('choose_deal')
  })
})

// ── MOVE_COMPLETE — fast_track_entry ─────────────────────────────────────────

describe('MOVE_COMPLETE on fast_track_entry space', () => {
  it('promotes an eligible player (passive > expenses) and applies the buyout', () => {
    // Index 36 = fast_track_entry; 33 → 36. Player qualifies: passive 2000 > expenses 1500.
    const roll = [3]
    useGameStore.setState({
      game: {
        ...getGame(),
        players: [makePlayer({
          boardPosition: 33,
          finances: makeFinances({ incomeSources: [{ id: 'r', label: 'Rental', monthlyAmount: 2000, isPassive: true }] }),
        })],
        currentTurnPhase: 'rolling',
        lastDiceRoll: roll,
      },
    })
    dispatch({ type: 'MOVE_COMPLETE' })
    const p = getPlayer()
    expect(p.boardTrack).toBe('fast_track')
    expect(p.boardPosition).toBe(0)
    expect(p.cashflowDayIncome).toBe(200000) // 100 × passive income
    expect(p.cashflowDayGoal).toBe(250000) // + $50,000
    expect(getGame().currentTurnPhase).toBe('end_check')
  })

  it('does NOT promote a player who is not yet financially free', () => {
    const roll = [3]
    useGameStore.setState({
      game: {
        ...getGame(),
        players: [makePlayer({ boardPosition: 33 })], // salary only, passive 0
        currentTurnPhase: 'rolling',
        lastDiceRoll: roll,
      },
    })
    dispatch({ type: 'MOVE_COMPLETE' })
    expect(getPlayer().boardTrack).toBe('rat_race')
    expect(getGame().currentTurnPhase).toBe('end_check')
  })
})

// ── CARD_RESOLVED ─────────────────────────────────────────────────────────────

describe('CARD_RESOLVED', () => {
  it('clears activeCard and moves to end_check', () => {
    const dummyCard: Card = {
      id: 'dummy', type: 'income', title: 'Test', description: '', effects: [],
    }
    useGameStore.setState({
      game: { ...getGame(), currentTurnPhase: 'action', activeCard: dummyCard },
    })
    dispatch({ type: 'CARD_RESOLVED' })
    expect(getGame().activeCard).toBeNull()
    expect(getGame().currentTurnPhase).toBe('end_check')
  })
})

// ── resolveCard ───────────────────────────────────────────────────────────────

describe('resolveCard', () => {
  const incomeCard: Card = {
    id: 'inc_test',
    type: 'income',
    title: 'Side Hustle',
    description: 'Extra income.',
    effects: [{ type: 'cash_gain', amount: 3000 }],
  }

  const expenseCard: Card = {
    id: 'exp_test',
    type: 'expense_liability',
    title: 'Car Repair',
    description: 'Unexpected expense.',
    effects: [{ type: 'cash_loss', amount: 1000 }],
  }

  beforeEach(() => {
    useGameStore.setState({
      game: { ...getGame(), currentTurnPhase: 'action', activeCard: incomeCard },
    })
  })

  it('accepted income card increases cash balance', () => {
    const before = getPlayer().finances.cashBalance
    resolveCard(incomeCard, true)
    expect(getPlayer().finances.cashBalance).toBe(before + 3000)
  })

  it('rejected card does not change finances', () => {
    const before = getPlayer().finances.cashBalance
    resolveCard(incomeCard, false)
    expect(getPlayer().finances.cashBalance).toBe(before)
  })

  it('accepted expense card decreases cash balance', () => {
    useGameStore.setState({
      game: { ...getGame(), currentTurnPhase: 'action', activeCard: expenseCard },
    })
    const before = getPlayer().finances.cashBalance
    resolveCard(expenseCard, true)
    expect(getPlayer().finances.cashBalance).toBe(before - 1000)
  })

  it('clears activeCard and transitions to end_check', () => {
    resolveCard(incomeCard, true)
    expect(getGame().activeCard).toBeNull()
    expect(getGame().currentTurnPhase).toBe('end_check')
  })

  it('is a no-op when no activeCard', () => {
    useGameStore.setState({ game: { ...getGame(), activeCard: null } })
    const before = getPlayer().finances.cashBalance
    resolveCard(incomeCard, true)
    expect(getPlayer().finances.cashBalance).toBe(before)
  })
})

// ── resolveNECST ──────────────────────────────────────────────────────────────

describe('resolveNECST', () => {
  beforeEach(() => {
    useGameStore.setState({
      game: { ...getGame(), currentTurnPhase: 'action', activeCard: NECST_CARD },
    })
  })

  it('all-yes answers → applies onPass effects (cash_gain 5000)', () => {
    const before = getPlayer().finances.cashBalance
    resolveNECST({ need: true, entry: true, control: true, scale: true, time: true })
    expect(getPlayer().finances.cashBalance).toBe(before + 5000)
  })

  it('all-no answers → applies onFail effects (cash_loss 2000)', () => {
    const before = getPlayer().finances.cashBalance
    resolveNECST({ need: false, entry: false, control: false, scale: false, time: false })
    expect(getPlayer().finances.cashBalance).toBe(before - 2000)
  })

  it('exactly 3 yes → passes (threshold defaults to 3)', () => {
    const before = getPlayer().finances.cashBalance
    resolveNECST({ need: true, entry: true, control: true, scale: false, time: false })
    expect(getPlayer().finances.cashBalance).toBe(before + 5000)
  })

  it('exactly 2 yes → fails', () => {
    const before = getPlayer().finances.cashBalance
    resolveNECST({ need: true, entry: true, control: false, scale: false, time: false })
    expect(getPlayer().finances.cashBalance).toBe(before - 2000)
  })

  it('clears activeCard after resolution', () => {
    resolveNECST({ need: true, entry: true, control: true, scale: true, time: true })
    expect(getGame().activeCard).toBeNull()
    expect(getGame().currentTurnPhase).toBe('end_check')
  })

  it('respects custom necstPassThreshold on the card', () => {
    const highBarCard: Card = {
      ...NECST_CARD,
      necstPassThreshold: 5,
    }
    useGameStore.setState({
      game: { ...getGame(), activeCard: highBarCard },
    })
    const before = getPlayer().finances.cashBalance
    // 4 out of 5 — fails at threshold 5
    resolveNECST({ need: true, entry: true, control: true, scale: true, time: false })
    expect(getPlayer().finances.cashBalance).toBe(before - 2000)
  })
})

// ── END_TURN ──────────────────────────────────────────────────────────────────

describe('END_TURN', () => {
  beforeEach(() => {
    useGameStore.setState({ game: { ...getGame(), currentTurnPhase: 'end_check' } })
  })

  it('transitions phase back to idle', () => {
    dispatch({ type: 'END_TURN' })
    expect(getGame().currentTurnPhase).toBe('idle')
  })

  it('increments turn counter', () => {
    const before = getGame().turn
    dispatch({ type: 'END_TURN' })
    expect(getGame().turn).toBe(before + 1)
  })

  it('is a no-op when phase is not end_check', () => {
    useGameStore.setState({ game: { ...getGame(), currentTurnPhase: 'idle' } })
    const before = getGame().turn
    dispatch({ type: 'END_TURN' })
    expect(getGame().turn).toBe(before)
  })

  it('with two players: advances currentPlayerIndex to 1', () => {
    const p2 = makePlayer({ id: 'p1', name: 'Bob', color: '#00ff00' })
    useGameStore.setState({
      game: { ...getGame(), players: [getPlayer(), p2], currentTurnPhase: 'end_check' },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().currentPlayerIndex).toBe(1)
  })

  it('with two players: wraps back to 0 and increments round', () => {
    const p2 = makePlayer({ id: 'p1', name: 'Bob', color: '#00ff00' })
    useGameStore.setState({
      game: {
        ...getGame(),
        players: [getPlayer(), p2],
        currentPlayerIndex: 1,
        round: 1,
        currentTurnPhase: 'end_check',
      },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().currentPlayerIndex).toBe(0)
    expect(getGame().round).toBe(2)
  })

  it('clears lastDiceRoll after turn ends', () => {
    useGameStore.setState({
      game: { ...getGame(), currentTurnPhase: 'end_check', lastDiceRoll: [3, 4] },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().lastDiceRoll).toBeNull()
  })
})

// ── Win conditions via END_TURN ───────────────────────────────────────────────

describe('win conditions triggered at END_TURN', () => {
  it('win: all anchors unlocked → status = completed_win', () => {
    useGameStore.setState({
      game: {
        ...getGame(),
        currentTurnPhase: 'end_check',
        players: [
          makePlayer({
            anchors: makeAnchors(['door', 'scale', 'safe', 'chain', 'engine', 'shield']),
          }),
        ],
      },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().status).toBe('completed_win')
    expect(getGame().winnerId).toBe('p0')
  })

  it('win: bought a Dream on the fast track → status = completed_win', () => {
    useGameStore.setState({
      game: {
        ...getGame(),
        currentTurnPhase: 'end_check',
        players: [makePlayer({ boardTrack: 'fast_track', dreamsOwned: ['dream_jet'] })],
      },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().status).toBe('completed_win')
  })

  it('win: reached the CASHFLOW Day goal on the fast track → status = completed_win', () => {
    useGameStore.setState({
      game: {
        ...getGame(),
        currentTurnPhase: 'end_check',
        players: [makePlayer({ boardTrack: 'fast_track', cashflowDayIncome: 60000, cashflowDayGoal: 50000 })],
      },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().status).toBe('completed_win')
  })

  it('win: B/I quadrant on fast track → status = completed_win', () => {
    useGameStore.setState({
      game: {
        ...getGame(),
        currentTurnPhase: 'end_check',
        players: [makePlayer({ quadrant: 'I', boardTrack: 'fast_track' })],
      },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().status).toBe('completed_win')
  })
})

// ── Fail conditions via END_TURN ──────────────────────────────────────────────

describe('fail conditions triggered at END_TURN', () => {
  it('fail: bankruptcy → status = completed_fail', () => {
    useGameStore.setState({
      game: {
        ...getGame(),
        currentTurnPhase: 'end_check',
        players: [
          makePlayer({
            finances: makeFinances({
              cashBalance: -1000,
              liabilities: [{ id: 'l1', label: 'Debt', totalOwed: 50000, monthlyPayment: 500 }],
            }),
          }),
        ],
      },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().status).toBe('completed_fail')
    expect(getGame().failureReason).toBeTruthy()
  })

  it('fail: turnsStuckInRatRace >= 3 → status = completed_fail', () => {
    useGameStore.setState({
      game: {
        ...getGame(),
        currentTurnPhase: 'end_check',
        players: [makePlayer({ turnsStuckInRatRace: 3, boardTrack: 'rat_race' })],
      },
    })
    dispatch({ type: 'END_TURN' })
    expect(getGame().status).toBe('completed_fail')
  })

  it('completed game ignores further dispatches', () => {
    useGameStore.setState({
      game: {
        ...getGame(),
        status: 'completed_win',
        currentTurnPhase: 'idle',
      },
    })
    dispatch({ type: 'ROLL_DICE' })
    expect(getGame().currentTurnPhase).toBe('idle')
  })
})

// ── Anchor evaluation at END_TURN ─────────────────────────────────────────────

describe('anchor evaluation at END_TURN', () => {
  it('automatically unlocks door anchor when player has income', () => {
    useGameStore.setState({
      game: {
        ...getGame(),
        currentTurnPhase: 'end_check',
        players: [
          makePlayer({
            finances: makeFinances({
              incomeSources: [{ id: 'sal', label: 'Salary', monthlyAmount: 4000, isPassive: false }],
            }),
          }),
        ],
      },
    })
    dispatch({ type: 'END_TURN' })
    const door = getPlayer().anchors.find((a) => a.anchorId === 'door')!
    expect(door.unlocked).toBe(true)
  })

  it('increments positiveCashFlowTurns when CF is positive', () => {
    const before = getPlayer().positiveCashFlowTurns
    useGameStore.setState({
      game: { ...getGame(), currentTurnPhase: 'end_check' },
    })
    dispatch({ type: 'END_TURN' })
    // After END_TURN, the player with positive CF should have incremented counter
    // Note: anchor eval happens before player index advances
    // We need to read the state after the turn ended — check turn 2's player 0
    // After END_TURN the currentPlayerIndex may have changed — but there's only 1 player
    const after = getGame().players[0].positiveCashFlowTurns
    expect(after).toBeGreaterThan(before)
  })
})

// ── Full turn loop integration ────────────────────────────────────────────────

describe('full turn loop', () => {
  it('completes a turn cycle: idle → rolling → end_check → idle', () => {
    // Step 1: Roll dice
    dispatch({ type: 'ROLL_DICE' })
    expect(getGame().currentTurnPhase).toBe('rolling')

    // Step 2: Move complete — landing may open a prompt (deal/charity/market/card)
    dispatch({ type: 'MOVE_COMPLETE' })
    expect(['action', 'end_check', 'choose_deal', 'charity_prompt', 'market_prompt']).toContain(getGame().currentTurnPhase)

    // Step 3: Resolve whatever prompt appeared
    settleTurn()
    expect(getGame().currentTurnPhase).toBe('end_check')

    // Step 4: End turn
    dispatch({ type: 'END_TURN' })
    expect(getGame().currentTurnPhase).toBe('idle')
    expect(getGame().turn).toBe(2)
  })

  it('multiple turns increment turn counter correctly', () => {
    for (let i = 0; i < 3; i++) {
      dispatch({ type: 'ROLL_DICE' }) // may consume a skipped turn instead of rolling
      if (getGame().currentTurnPhase === 'rolling') {
        dispatch({ type: 'MOVE_COMPLETE' })
        settleTurn()
        dispatch({ type: 'END_TURN' })
      }
    }
    expect(getGame().turn).toBe(4)
  })
})
