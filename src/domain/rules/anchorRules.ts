import type { PlayerState, AnchorId, AnchorStatus } from '../entities/types'
import { computeSummary } from '../services/financialCalc'
import { sealedReserve } from './profitFirst'

const ANCHOR_ORDER: AnchorId[] = ['door', 'scale', 'safe', 'chain', 'engine', 'shield']

function isUnlocked(player: PlayerState, id: AnchorId): boolean {
  return player.anchors.find((a) => a.anchorId === id)?.unlocked ?? false
}

function canUnlock(player: PlayerState, id: AnchorId): boolean {
  const idx = ANCHOR_ORDER.indexOf(id)
  if (idx > 0 && !isUnlocked(player, ANCHOR_ORDER[idx - 1])) return false

  const summary = computeSummary(player.finances)

  switch (id) {
    case 'door':
      return summary.totalMonthlyIncome > 0

    case 'scale':
      // 3 consecutive positive cash-flow turns
      return player.positiveCashFlowTurns >= 3

    case 'safe': {
      // 6 months of expenses in runway. Profit First: money you correctly sealed
      // into the Profit/Tax envelopes still proves your runway — it isn't punished
      // for not sitting in the spendable operating account.
      const buffer = summary.totalMonthlyExpenses * 6
      return player.finances.cashBalance + sealedReserve(player.finances) >= buffer
    }

    case 'chain':
      // Has used leverage (at least one liability linked to an asset)
      return player.finances.liabilities.some((l) => !!l.assetId)

    case 'engine':
      return summary.totalPassiveIncome > 0

    case 'shield':
      // Passive income covers at least 50% of expenses
      return summary.totalPassiveIncome >= summary.totalMonthlyExpenses * 0.5
  }
}

export function evaluateAnchors(player: PlayerState, turn: number): PlayerState {
  let updated = { ...player, anchors: [...player.anchors] }

  for (const id of ANCHOR_ORDER) {
    const status = updated.anchors.find((a) => a.anchorId === id)!
    if (!status.unlocked && canUnlock(updated, id)) {
      updated = {
        ...updated,
        anchors: updated.anchors.map((a) =>
          a.anchorId === id ? { ...a, unlocked: true, unlockedAtTurn: turn } : a,
        ),
      }
    }
  }

  // Update consecutive positive cash-flow counter
  const summary = computeSummary(updated.finances)
  updated = {
    ...updated,
    positiveCashFlowTurns: summary.monthlyCashFlow > 0
      ? updated.positiveCashFlowTurns + 1
      : 0,
  }

  return updated
}

export function allAnchorsUnlocked(player: PlayerState): boolean {
  return ANCHOR_ORDER.every((id) => isUnlocked(player, id))
}

export function makeDefaultAnchors(): AnchorStatus[] {
  return ANCHOR_ORDER.map((anchorId) => ({ anchorId, unlocked: false }))
}
