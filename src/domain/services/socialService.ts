import type { ESBIQuadrant } from '../entities/types'

/**
 * Social Capital ("your Network"): a relationship-trust resource you spend to
 * unlock off-market deals, de-risk ventures, and call in favors. Mirrors the
 * Time-as-Asset model (timeService) — a banked pool with a quadrant-scaled cap.
 *
 * The lesson: your network widens as you climb E→S→B→I, and it only compounds
 * if you spend it on others first (give-before-you-get; see networkCards).
 */
export const SOCIAL_BASE: Record<ESBIQuadrant, number> = { E: 2, S: 3, B: 8, I: 14 }
export const SOCIAL_CAP: Record<ESBIQuadrant, number> = { E: 6, S: 8, B: 18, I: 25 }

/** Charity tithe also earns Social Capital — generosity builds the network. */
export const CHARITY_SOCIAL_GAIN = 2

/** Spend this much SC to lower a NECST venture's pass threshold by 1 (a trusted
 *  advisor vouches for the deal). One use per evaluation. */
export const NECST_DISCOUNT_COST = 4

/** Spend this much SC to neutralise one rival marker on your own Dream — your
 *  network arranges a private deal before the bidding war inflates the price. */
export const DREAM_NEUTRALIZE_COST = 5

/** Clamp a Social Capital balance into [0, cap]. */
export function clampSocial(value: number, cap: number): number {
  return Math.max(0, Math.min(value, cap))
}
