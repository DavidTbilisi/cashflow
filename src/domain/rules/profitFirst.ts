import type { FinancialStatement, PlayerState } from '../entities/types'

/**
 * Profit First (Mike Michalowicz) — the cash-management discipline that flips the
 * GAAP equation from `Sales − Expenses = Profit` to `Sales − Profit = Expenses`.
 * Profit is skimmed off the top of every payday into a SEALED account before it
 * can be spent, so the spendable "operating" balance is deliberately starved and
 * expenses are forced to fit the smaller plate (Parkinson's Law).
 *
 * In this game `cashBalance` is the player's combined Owner's-Pay + Operating
 * account (the spendable money), and `profitAccount` / `taxAccount` are the
 * sealed "Bank 2" envelopes that money cannot be casually spent from.
 *
 * Percentages are the small-tier (<$250K Real Revenue) Target Allocation
 * Percentages. They are DERIVED-APPROXIMATE: the book's exact per-tier table is
 * an un-extractable figure, so treat ~15/~15 as ballpark, not gospel.
 */

/** Share of each payday skimmed into the sealed Profit envelope (TAP, small tier ~15%). */
export const PROFIT_TAP = 0.15
/** Share of each payday skimmed into the sealed Tax envelope (TAP, small tier ~15%). */
export const TAX_TAP = 0.15

/** Rounds per "quarter" — the clock for the quarterly Profit distribution. */
export const QUARTER_ROUNDS = 3
/** Fraction of the Profit account paid out to the owner each quarter (the reward). */
export const PROFIT_DISTRIBUTION_RATE = 0.5

/** Total sealed money (Profit + Tax) — counts toward net worth and runway, but is not spendable. */
export function sealedReserve(fin: FinancialStatement): number {
  return (fin.profitAccount ?? 0) + (fin.taxAccount ?? 0)
}

/** Which quarter a given round falls in. Rounds 1–2 → 0, 3–5 → 1, 6–8 → 2, … */
export function currentQuarter(round: number): number {
  return Math.floor(round / QUARTER_ROUNDS)
}

/**
 * Allocate one payday. Positive income is skimmed Profit-first into the sealed
 * envelopes; only the remainder lands in spendable cash. A non-positive payday
 * (negative cash flow) has nothing to skim — it hits the operating account in full.
 */
export function allocatePayday(fin: FinancialStatement, payAmount: number): FinancialStatement {
  if (payAmount <= 0) {
    return { ...fin, cashBalance: fin.cashBalance + payAmount }
  }
  const toProfit = Math.round(payAmount * PROFIT_TAP)
  const toTax = Math.round(payAmount * TAX_TAP)
  const toCash = payAmount - toProfit - toTax // remainder is exact — no rounding leak
  return {
    ...fin,
    profitAccount: (fin.profitAccount ?? 0) + toProfit,
    taxAccount: (fin.taxAccount ?? 0) + toTax,
    cashBalance: fin.cashBalance + toCash,
  }
}

/**
 * Quarterly distribution: pay PROFIT_DISTRIBUTION_RATE of the Profit account out
 * to the owner as a felt, spendable reward; the rest stays as retained reserve.
 * Always advances `lastProfitQuarter` so a barren quarter still counts as "paid"
 * and won't retry every turn. Returns the windfall for logging.
 */
export function distributeProfit(player: PlayerState, quarter: number): { player: PlayerState; windfall: number } {
  const profit = player.finances.profitAccount ?? 0
  const windfall = Math.round(profit * PROFIT_DISTRIBUTION_RATE)
  return {
    player: {
      ...player,
      lastProfitQuarter: quarter,
      finances: {
        ...player.finances,
        profitAccount: profit - windfall,
        cashBalance: player.finances.cashBalance + windfall,
      },
    },
    windfall,
  }
}

/**
 * Crisis buffer: subtract a loss from spendable cash, but if that would push the
 * operating account negative, absorb the shortfall from the sealed envelopes —
 * Tax first, then Profit. "The money was there at filing time." Only a shortfall
 * the envelopes cannot cover hits cashBalance (and can still trigger bankruptcy).
 */
export function absorbLoss(fin: FinancialStatement, amount: number): FinancialStatement {
  const afterCash = fin.cashBalance - amount
  if (afterCash >= 0) {
    // Normal path: cash covers it; envelopes are never touched.
    return { ...fin, cashBalance: afterCash }
  }
  let shortfall = -afterCash
  let tax = fin.taxAccount ?? 0
  let profit = fin.profitAccount ?? 0

  const fromTax = Math.min(tax, shortfall)
  tax -= fromTax
  shortfall -= fromTax

  const fromProfit = Math.min(profit, shortfall)
  profit -= fromProfit
  shortfall -= fromProfit

  // `shortfall > 0 ? -shortfall : 0` avoids negative zero when envelopes exactly cover the loss.
  return { ...fin, cashBalance: shortfall > 0 ? -shortfall : 0, taxAccount: tax, profitAccount: profit }
}
