import type { NECSTAnswers, PlayerState, CardEffect } from '../entities/types'
import { computeSummary } from '../services/financialCalc'

/**
 * PRODUCTOCRACY (from MJ DeMarco's *Unscripted*).
 *
 * A productocracy is a product so good it sells itself — peer recommendation and
 * repeat purchase replace ad spend. You engineer one by satisfying all five
 * commandments, which DeMarco brands **CENTS**: Control · Entry · Need · Time · Scale.
 *
 * CENTS is the SAME five commandments as NECST (the wiki registers CENTS as an
 * alias of NECST — see necstTest.ts), only reordered. So we reuse NECSTAnswers
 * here rather than inventing a parallel structure. The difference is the BAR:
 * an ordinary venture passes NECST at 3/5; a productocracy must clear all 5.
 */

/** CENTS reading order over the same five NECST keys. */
export const CENTS_ORDER = ['control', 'entry', 'need', 'time', 'scale'] as const

export const CENTS_LABELS: Record<keyof NECSTAnswers, { letter: string; label: string }> = {
  control: { letter: 'C', label: 'Control' },
  entry: { letter: 'E', label: 'Entry' },
  need: { letter: 'N', label: 'Need' },
  time: { letter: 'T', label: 'Time' },
  scale: { letter: 'S', label: 'Scale' },
}

/**
 * A productocracy clears ALL five commandments — not just the 3/5 passing bar,
 * and not via an advisor's vouch discount. One weak commandment and the product
 * still needs advertising to survive, so it isn't a productocracy.
 */
export function isProductocracy(answers: NECSTAnswers): boolean {
  return answers.control && answers.entry && answers.need && answers.time && answers.scale
}

/**
 * Perfect-CENTS ventures throw off extra passive income because the product
 * propagates itself — the marketing cost that drags an ordinary business is gone.
 */
export const PRODUCTOCRACY_INCOME_MULTIPLIER = 1.5

/**
 * Boost the onPass effects of a productocracy card: flag any acquired asset as a
 * productocracy and scale its self-selling (passive) income. Non-asset effects and
 * ordinary (non-perfect) passes are returned unchanged.
 */
export function applyProductocracyBonus(effects: CardEffect[], perfect: boolean): CardEffect[] {
  if (!perfect) return effects
  return effects.map((e) => {
    if (e.type === 'acquire_asset') {
      return {
        ...e,
        asset: {
          ...e.asset,
          isProductocracy: true,
          monthlyPassiveIncome: Math.round(e.asset.monthlyPassiveIncome * PRODUCTOCRACY_INCOME_MULTIPLIER),
        },
      }
    }
    if (e.type === 'gain_income' && e.isPassive) {
      return { ...e, monthlyAmount: Math.round(e.monthlyAmount * PRODUCTOCRACY_INCOME_MULTIPLIER) }
    }
    return e
  })
}

export function hasProductocracy(player: PlayerState): boolean {
  return player.finances.assets.some((a) => a.isProductocracy)
}

/**
 * Unscripted's "one durable business" thesis: a single productocracy whose own
 * passive income covers all monthly expenses lets you leave the Rat Race at once —
 * you don't need a portfolio of small deals to reach escape velocity.
 */
export function hasSelfSufficientProductocracy(player: PlayerState): boolean {
  const { totalMonthlyExpenses } = computeSummary(player.finances)
  return player.finances.assets.some(
    (a) => a.isProductocracy && a.monthlyPassiveIncome >= totalMonthlyExpenses,
  )
}
