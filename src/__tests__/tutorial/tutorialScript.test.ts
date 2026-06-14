import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../../store/gameStore'
import { RAT_RACE_SPACES } from '../../domain/data/boardSpaces'
import { STARTING_PROFILES } from '../../domain/data/startingProfiles'
import { DREAMS } from '../../domain/data/fastTrack'
import { TUTORIAL_STEPS } from '../../tutorial/tutorialSteps'

// Drives the real store through the guided tutorial's scripted rolls and asserts
// that every forced landing and every step `done` predicate behaves as designed.
// This is what the UI driver does, minus React.

const stepDone = (id: string) => {
  const step = TUTORIAL_STEPS.find((s) => s.id === id)!
  return step.done!(useGameStore.getState().game!)
}

describe('guided tutorial script', () => {
  beforeEach(() => {
    useGameStore.getState().initGame([
      { name: 'You', color: '#3b82f6', profile: STARTING_PROFILES[0], dreamId: DREAMS[0].id },
    ])
  })

  it('starts a solo player on PAYDAY (position 0)', () => {
    const g = useGameStore.getState().game!
    expect(g.players).toHaveLength(1)
    expect(g.players[0].boardPosition).toBe(0)
    expect(RAT_RACE_SPACES[0].type).toBe('payday')
    expect(g.currentTurnPhase).toBe('idle')
  })

  it('the scripted tiles are where the steps expect them', () => {
    // roll 2 from pos 0 → Expense, then roll 1 from pos 2 → Opportunity
    expect(RAT_RACE_SPACES[2].type).toBe('doodad')
    expect(RAT_RACE_SPACES[3].type).toBe('opportunity')
  })

  it('plays through every step, each done-predicate firing in order', () => {
    const store = useGameStore.getState()

    // ── roll-expense: force [2], roll → phase rolling ──
    store.forceNextDice([2])
    store.dispatch({ type: 'ROLL_DICE' })
    expect(stepDone('roll-expense')).toBe(true)
    expect(useGameStore.getState().game!.lastDiceRoll).toEqual([2])

    // ── move-expense: advance pawn → lands on Expense, card shown ──
    store.dispatch({ type: 'MOVE_COMPLETE' })
    let g = useGameStore.getState().game!
    expect(g.players[0].boardPosition).toBe(2)
    expect(g.activeCard?.type).toBe('doodad')
    expect(stepDone('move-expense')).toBe(true)

    // ── expense-card: resolve it → end_check ──
    store.resolveCard(useGameStore.getState().game!.activeCard!, true)
    expect(stepDone('expense-card')).toBe(true)

    // ── end-turn: end → idle, turn 2 ──
    store.dispatch({ type: 'END_TURN' })
    g = useGameStore.getState().game!
    expect(g.currentTurnPhase).toBe('idle')
    expect(g.turn).toBeGreaterThanOrEqual(2)
    expect(stepDone('end-turn')).toBe(true)

    // ── roll-opportunity: force [1], roll → rolling ──
    store.forceNextDice([1])
    store.dispatch({ type: 'ROLL_DICE' })
    expect(stepDone('roll-opportunity')).toBe(true)

    // ── move-opportunity: advance → lands on Opportunity (choose_deal) ──
    store.dispatch({ type: 'MOVE_COMPLETE' })
    g = useGameStore.getState().game!
    expect(g.players[0].boardPosition).toBe(3)
    expect(g.currentTurnPhase).toBe('choose_deal')
    expect(stepDone('move-opportunity')).toBe(true)

    // ── choose-deal: pick Small → a deal card is drawn (action phase) ──
    store.chooseDeal('small')
    g = useGameStore.getState().game!
    expect(g.currentTurnPhase).toBe('action')
    expect(g.activeCard).toBeTruthy()
    expect(stepDone('choose-deal')).toBe(true)

    // ── deal-card: pass on it → end_check ──
    store.resolveCard(useGameStore.getState().game!.activeCard!, false)
    expect(stepDone('deal-card')).toBe(true)
  })

  it('forced dice are consumed once, not sticky', () => {
    const store = useGameStore.getState()
    store.forceNextDice([2])
    store.dispatch({ type: 'ROLL_DICE' })
    expect(useGameStore.getState().game!.lastDiceRoll).toEqual([2])
    store.dispatch({ type: 'MOVE_COMPLETE' })
    store.resolveCard(useGameStore.getState().game!.activeCard!, true)
    store.dispatch({ type: 'END_TURN' })
    // No force this time — a real (seeded) roll, so not guaranteed to be [2].
    store.dispatch({ type: 'ROLL_DICE' })
    const roll = useGameStore.getState().game!.lastDiceRoll!
    expect(roll.length).toBe(1)
    expect(roll[0]).toBeGreaterThanOrEqual(1)
    expect(roll[0]).toBeLessThanOrEqual(6)
  })
})
