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

export const QUADRANT_LABELS: Record<ESBIQuadrant, string> = {
  E: 'Employee',
  S: 'Self-Employed',
  B: 'Business Owner',
  I: 'Investor',
}

export const QUADRANT_COLORS: Record<ESBIQuadrant, string> = {
  E: '#6b7280',
  S: '#f59e0b',
  B: '#3b82f6',
  I: '#10b981',
}
