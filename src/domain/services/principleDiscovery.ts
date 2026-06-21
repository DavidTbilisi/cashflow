import type { PlayerState } from '../entities/types'
import { computeSummary } from './financialCalc'

/**
 * Principle discovery — the bridge that makes the Wealth Codex something you
 * *play*, not just read. A principle is "discovered" the moment you actually
 * meet it in the game: either a card carrying it appears (handled in the UI),
 * or your own financial state demonstrates it — which is what this module
 * derives.
 *
 * Keeping it a pure function of PlayerState means it's trivially testable and
 * the UI can just re-derive after every turn.
 */

/** Every principle id this module can emit from state alone (no card needed). */
export const DERIVABLE_PRINCIPLE_IDS = [
  'rat-race',
  'fastlane-equation',
  'asset-vs-liability',
  'passive-income-ladder',
  'compounding',
  'passive-income-freedom',
  'six-anchors',
  'emergency-buffer',
  'room-for-error',
  'getting-vs-staying-wealthy',
  'good-vs-bad-debt',
  'esbi-quadrant',
  'productize-yourself',
  'pay-yourself-first',
  'profit-first',
  'savings-rate',
  'human-vs-capital',
  'diversification',
  'social-capital',
  'productocracy',
  'zero-to-one',
  'monopoly-over-competition',
  'necst-test',
  'debt-spiral',
] as const

/**
 * Which principles this player's current state demonstrates. Returns principle
 * ids (a subset of DERIVABLE_PRINCIPLE_IDS). Idempotent and side-effect free.
 */
export function derivePlayerPrinciples(player: PlayerState): string[] {
  const f = player.finances
  const s = computeSummary(f)
  const out: string[] = []
  const add = (id: string, cond: boolean) => {
    if (cond) out.push(id)
  }
  const anchorUnlocked = (id: string) => player.anchors.some((a) => a.anchorId === id && a.unlocked)
  const hasProductocracy = f.assets.some((a) => a.isProductocracy)
  const activeIncome = s.totalMonthlyIncome - s.totalPassiveIncome

  // ── Foundations you're standing in from the start ──
  add('rat-race', player.boardTrack === 'rat_race')
  add('fastlane-equation', player.boardTrack === 'fast_track')
  add('asset-vs-liability', f.assets.length > 0 || f.liabilities.length > 0)

  // ── Things your portfolio demonstrates ──
  add('passive-income-ladder', f.assets.length > 0)
  add('compounding', s.totalPassiveIncome > 0)
  add('human-vs-capital', s.totalPassiveIncome > 0 && activeIncome > 0)
  add('diversification', new Set(f.assets.map((a) => a.assetClass)).size >= 2)
  add('passive-income-freedom', s.totalMonthlyExpenses > 0 && s.totalPassiveIncome >= s.totalMonthlyExpenses)

  // ── Anchors ──
  add('six-anchors', player.anchors.some((a) => a.unlocked))
  add('emergency-buffer', anchorUnlocked('safe'))
  add('room-for-error', anchorUnlocked('safe'))
  add('getting-vs-staying-wealthy', anchorUnlocked('shield'))
  add('good-vs-bad-debt', anchorUnlocked('chain') || f.liabilities.some((l) => !!l.assetId))

  // ── Quadrant progression ──
  add('esbi-quadrant', player.quadrant !== 'E')
  add('productize-yourself', player.quadrant === 'B' || player.quadrant === 'I')

  // ── Cash management ──
  const sealed = (f.profitAccount ?? 0) > 0 || (f.taxAccount ?? 0) > 0
  add('pay-yourself-first', sealed)
  add('profit-first', sealed)
  add('savings-rate', player.positiveCashFlowTurns > 0 || s.monthlyCashFlow > 0)

  // ── Relationships ──
  add('social-capital', player.socialCapital > 0)

  // ── Productocracy & innovation ──
  add('productocracy', hasProductocracy)
  add('zero-to-one', hasProductocracy)
  add('monopoly-over-competition', hasProductocracy)
  add('necst-test', hasProductocracy || f.assets.some((a) => a.assetClass === 'business'))

  // ── Warning signs ──
  add('debt-spiral', player.turnsStuckInRatRace >= 2)

  return out
}
