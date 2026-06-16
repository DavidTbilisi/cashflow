import type { GameState, PlayerState } from '../entities/types'
import { computeSummary, checkBankruptcy } from '../services/financialCalc'
import { allAnchorsUnlocked } from './anchorRules'
import { hasSelfSufficientProductocracy } from './productocracy'

export type WinResult =
  | { status: 'continue' }
  | { status: 'win'; reason: string; winnerId: string }
  | { status: 'fail'; reason: string; loserId: string }

/**
 * Rulebook page 5: you may leave the Rat Race at the start of any turn on which
 * your Passive Income is greater than your Total Expenses.
 */
export function canEnterFastTrack(player: PlayerState): boolean {
  if (player.boardTrack !== 'rat_race') return false
  // Unscripted: a single self-sufficient productocracy is escape velocity on its own —
  // you don't need to stack a portfolio of small deals to clear the Rat Race.
  if (hasSelfSufficientProductocracy(player)) return true
  const s = computeSummary(player.finances)
  return s.totalPassiveIncome > s.totalMonthlyExpenses
}

export function evaluateWinConditions(state: GameState): WinResult {
  for (const player of state.players) {
    const summary = computeSummary(player.finances)
    const onFastTrack = player.boardTrack === 'fast_track'

    // ── Official Fast Track victories (rulebook "How to Win") ──
    // Buying your *chosen* Dream wins (if no dream was chosen, any owned Dream counts).
    const ownsChosenDream =
      player.dreamsOwned.length > 0 &&
      (player.dreamId == null ||
        player.dreamsOwned.some((spaceId) => state.boardSpaces.find((s) => s.id === spaceId)?.dreamId === player.dreamId))
    if (onFastTrack && ownsChosenDream) {
      return { status: 'win', reason: 'Bought their Dream on the Fast Track!', winnerId: player.id }
    }
    if (onFastTrack && player.cashflowDayGoal > 0 && player.cashflowDayIncome >= player.cashflowDayGoal) {
      return { status: 'win', reason: 'Reached +$50,000 CASHFLOW Day income on the Fast Track!', winnerId: player.id }
    }

    // ── Custom victory paths (kept from the original design) ──
    if (allAnchorsUnlocked(player)) {
      return { status: 'win', reason: 'All six financial anchors established!', winnerId: player.id }
    }
    if ((player.quadrant === 'B' || player.quadrant === 'I') && onFastTrack) {
      return { status: 'win', reason: 'Reached the B/I quadrant on the Fast Track!', winnerId: player.id }
    }

    // ── Failure ──
    if (checkBankruptcy(player.finances)) {
      return { status: 'fail', reason: 'Bankruptcy — net worth dropped below zero.', loserId: player.id }
    }
    if (player.turnsStuckInRatRace >= 3 && player.boardTrack === 'rat_race') {
      return { status: 'fail', reason: 'Trapped in the Rat Race — income rose but expenses kept pace.', loserId: player.id }
    }
  }

  return { status: 'continue' }
}
