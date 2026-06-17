import type { PlayerState, ESBIQuadrant } from '../entities/types'
import { computeSummary } from '../services/financialCalc'

export function canAdvanceQuadrant(player: PlayerState): boolean {
  const summary = computeSummary(player.finances)

  switch (player.quadrant) {
    case 'E':
      // Has at least one non-job income source (side gig starts S)
      return player.finances.incomeSources.filter((s) => !s.isPassive).length > 1

    case 'S':
      // Has a documented business — proxy: any asset of class 'business'
      return player.finances.assets.some((a) => a.assetClass === 'business')

    case 'B':
      // Has passive income > 0 (capital working for you)
      return summary.totalPassiveIncome > 0

    case 'I':
      return false // Already at top
  }
}

const QUADRANT_ORDER: ESBIQuadrant[] = ['E', 'S', 'B', 'I']

/**
 * Per-turn quadrant progression — the ESBI counterpart of `evaluateAnchors`.
 * Advances the player one step (E→S→B→I) when, and only when, the
 * `canAdvanceQuadrant` gate for their current quadrant is satisfied. Drawn
 * `quadrant_advance` cards remain a separate, explicit shortcut (mirroring how
 * `anchor_unlock` cards bypass anchor thresholds).
 */
export function evaluateQuadrant(player: PlayerState): PlayerState {
  if (!canAdvanceQuadrant(player)) return player
  const next = QUADRANT_ORDER[QUADRANT_ORDER.indexOf(player.quadrant) + 1]
  return next ? { ...player, quadrant: next } : player
}

export const QUADRANT_LABELS: Record<ESBIQuadrant, string> = {
  E: 'Employee',
  S: 'Self-Employed',
  B: 'Business Owner',
  I: 'Investor',
}

// ESBI as a wealth progression: muted lavender (active income) → neon cyan →
// gold (investor). Right side glows brighter — that's where the game is won.
export const QUADRANT_COLORS: Record<ESBIQuadrant, string> = {
  E: '#8A7FB0',
  S: '#B8AEDC',
  B: '#2DE2FF',
  I: '#FFC93C',
}
