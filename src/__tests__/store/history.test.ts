import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../store/gameStore'
import { makeFinances } from '../fixtures'
import { computeSummary } from '../../domain/services/financialCalc'

function getGame() {
  const g = useGameStore.getState().game
  if (!g) throw new Error('No active game')
  return g
}

const { dispatch, resolveCard, resetGame } = useGameStore.getState()

function initAlice() {
  useGameStore.getState().initGame(
    [{ name: 'Alice', color: '#aaa', profile: { quadrant: 'E', label: '', description: '', savings: 0, finances: makeFinances() } }],
    42,
  )
}

function roll(dice: [number, number]) {
  useGameStore.setState({ game: { ...getGame(), currentTurnPhase: 'rolling', lastDiceRoll: dice } })
}

function settleLanding() {
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

function completeTurn(dice: [number, number]) {
  roll(dice)
  dispatch({ type: 'MOVE_COMPLETE' })
  settleLanding()
  dispatch({ type: 'END_TURN' })
}

beforeEach(() => {
  resetGame()
  initAlice()
})

// ── History capture ───────────────────────────────────────────────────────────

describe('history capture', () => {
  it('starts empty', () => {
    expect(getGame().history).toEqual({})
  })

  it('appends one point per completed turn', () => {
    completeTurn([1, 1])
    const pid = getGame().players[0].id
    expect(getGame().history[pid]).toHaveLength(1)
    completeTurn([1, 1])
    expect(getGame().history[pid]).toHaveLength(2)
  })

  it('history netWorth matches computeSummary after turn', () => {
    completeTurn([1, 1])
    const pid = getGame().players[0].id
    const player = getGame().players[0]
    const expected = computeSummary(player.finances).netWorth
    expect(getGame().history[pid][0].netWorth).toBe(expected)
  })

  it('captures cashBalance in history point', () => {
    completeTurn([1, 1])
    const pid = getGame().players[0].id
    const player = getGame().players[0]
    expect(getGame().history[pid][0].cashBalance).toBe(player.finances.cashBalance)
  })

  it('clamps at HISTORY_CAP (300)', () => {
    // Fill past cap by patching history directly
    const pid = `p0`
    const fakePoint = { turn: 0, netWorth: 0, passiveIncome: 0, totalIncome: 0, totalExpenses: 0, cashFlow: 0, cashBalance: 0 }
    useGameStore.setState({
      game: { ...getGame(), history: { [pid]: Array(300).fill(fakePoint) } },
    })
    completeTurn([1, 1])
    expect(getGame().history[pid]).toHaveLength(300)
  })
})

// ── Turn log ──────────────────────────────────────────────────────────────────

describe('turnLog', () => {
  it('starts empty', () => {
    expect(getGame().turnLog).toEqual([])
  })

  it('appends a landing entry on MOVE_COMPLETE', () => {
    roll([1, 1])
    dispatch({ type: 'MOVE_COMPLETE' })
    const log = getGame().turnLog
    expect(log.length).toBeGreaterThan(0)
    expect(log[log.length - 1].kind).toBe('landing')
  })

  it('landing entry contains roll, fromPos, toPos', () => {
    const fromPos = getGame().players[0].boardPosition
    roll([1, 2])
    dispatch({ type: 'MOVE_COMPLETE' })
    const entry = getGame().turnLog[getGame().turnLog.length - 1]
    expect(entry.roll).toBe(3)
    expect(entry.fromPos).toBe(fromPos)
    expect(entry.toPos).toBe(fromPos + 3)
  })

  it('payday landing entry has positive cashDelta', () => {
    // position player so rolling 10 lands on payday (pos 10)
    useGameStore.setState({ game: { ...getGame(), players: [{ ...getGame().players[0], boardPosition: 0 }] } })
    roll([5, 5])
    dispatch({ type: 'MOVE_COMPLETE' })
    const entry = getGame().turnLog.find((e) => e.kind === 'landing' && e.toPos === 10)
    expect(entry?.cashDelta).toBeGreaterThan(0)
  })

  it('appends a skip note when player has skipTurns', () => {
    useGameStore.setState({ game: { ...getGame(), players: [{ ...getGame().players[0], skipTurns: 2 }] } })
    dispatch({ type: 'ROLL_DICE' })
    const entry = getGame().turnLog.find((e) => e.kind === 'note')
    expect(entry).toBeTruthy()
    expect(entry?.text).toMatch(/skipped/)
  })

  it('clamps turnLog at LOG_CAP (200)', () => {
    const fakeEntry = { id: 'x', turn: 0, round: 0, playerId: 'p0', playerName: 'A', kind: 'note' as const, text: 'x' }
    useGameStore.setState({ game: { ...getGame(), turnLog: Array(200).fill(fakeEntry) } })
    roll([1, 1])
    dispatch({ type: 'MOVE_COMPLETE' })
    expect(getGame().turnLog).toHaveLength(200)
  })
})
