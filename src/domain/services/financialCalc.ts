import type {
  FinancialStatement,
  FinancialSummary,
  PlayerState,
  CardEffect,
  Card,
  Asset,
  IncomeSource,
  ExpenseLine,
  Liability,
} from '../entities/types'
import { formatCurrency } from '../../utils/currency'
import { clampSocial } from './socialService'
import { sealedReserve, absorbLoss } from '../rules/profitFirst'

export function computeSummary(fin: FinancialStatement): FinancialSummary {
  const totalMonthlyIncome = fin.incomeSources.reduce((s, i) => s + i.monthlyAmount, 0)
  const totalPassiveIncome = fin.incomeSources
    .filter((i) => i.isPassive)
    .reduce((s, i) => s + i.monthlyAmount, 0)
  const childExpense = fin.numberOfChildren * fin.perChildExpense
  const totalMonthlyExpenses =
    fin.expenseLines.reduce((s, e) => s + e.monthlyAmount, 0) + childExpense
  const reserve = sealedReserve(fin)
  const totalAssetValue = fin.assets.reduce((s, a) => s + a.currentValue, 0) + fin.cashBalance + reserve
  const totalLiabilities = fin.liabilities.reduce((s, l) => s + l.totalOwed, 0)

  return {
    totalMonthlyIncome,
    totalPassiveIncome,
    totalMonthlyExpenses,
    childExpense,
    monthlyCashFlow: totalMonthlyIncome - totalMonthlyExpenses,
    totalAssetValue,
    totalLiabilities,
    netWorth: totalAssetValue - totalLiabilities,
    isPassiveIncomePositive: totalPassiveIncome >= totalMonthlyExpenses,
    sealedReserve: reserve,
  }
}

export function checkBankruptcy(fin: FinancialStatement): boolean {
  return fin.cashBalance < 0 && computeSummary(fin).netWorth < 0
}

/** Rulebook page 5: when you move out of the Rat Race you receive 100× passive income. */
export function buyoutIncome(fin: FinancialStatement): number {
  return computeSummary(fin).totalPassiveIncome * 100
}

const BANK_LOAN_ID = 'bank_loan'
const BANK_LOAN_EXPENSE_ID = 'bank_loan_payment'

/**
 * Borrow from the Bank in $1,000 units at 10%/month ($100 payment per $1,000).
 * Loans accumulate into a single "Bank Loan" liability + payment line.
 */
export function takeBankLoan(player: PlayerState, amount: number): PlayerState {
  const units = Math.max(0, Math.floor(amount / 1000))
  if (units === 0) return player
  const principal = units * 1000
  const fin = player.finances
  const existing = fin.liabilities.find((l) => l.id === BANK_LOAN_ID)
  const newOwed = (existing?.totalOwed ?? 0) + principal
  const payment = Math.round(newOwed * 0.1)

  const liabilities = existing
    ? fin.liabilities.map((l) => (l.id === BANK_LOAN_ID ? { ...l, totalOwed: newOwed, monthlyPayment: payment } : l))
    : [...fin.liabilities, { id: BANK_LOAN_ID, label: 'Bank Loan', totalOwed: newOwed, monthlyPayment: payment }]

  const hasExpense = fin.expenseLines.some((e) => e.id === BANK_LOAN_EXPENSE_ID)
  const expenseLines = hasExpense
    ? fin.expenseLines.map((e) => (e.id === BANK_LOAN_EXPENSE_ID ? { ...e, monthlyAmount: payment } : e))
    : [...fin.expenseLines, { id: BANK_LOAN_EXPENSE_ID, label: 'Bank Loan Payment', monthlyAmount: payment, isFixed: true, liabilityId: BANK_LOAN_ID }]

  return { ...player, finances: { ...fin, cashBalance: fin.cashBalance + principal, liabilities, expenseLines } }
}

/**
 * Pay off a liability. Bank loans pay down in $1,000 units (−$100 payment each);
 * other debts must be paid in full. Taxes / Other / Child expenses cannot be paid off.
 */
export function payOffLiability(player: PlayerState, liabilityId: string, units = 1): PlayerState {
  const fin = player.finances
  const lib = fin.liabilities.find((l) => l.id === liabilityId)
  if (!lib) return player

  if (liabilityId === BANK_LOAN_ID) {
    const payUnits = Math.min(units, Math.floor(lib.totalOwed / 1000))
    if (payUnits <= 0) return player
    const principal = payUnits * 1000
    if (fin.cashBalance < principal) return player
    const newOwed = lib.totalOwed - principal
    const payment = Math.round(newOwed * 0.1)
    const liabilities = newOwed > 0
      ? fin.liabilities.map((l) => (l.id === BANK_LOAN_ID ? { ...l, totalOwed: newOwed, monthlyPayment: payment } : l))
      : fin.liabilities.filter((l) => l.id !== BANK_LOAN_ID)
    const expenseLines = newOwed > 0
      ? fin.expenseLines.map((e) => (e.id === BANK_LOAN_EXPENSE_ID ? { ...e, monthlyAmount: payment } : e))
      : fin.expenseLines.filter((e) => e.id !== BANK_LOAN_EXPENSE_ID)
    return { ...player, finances: { ...fin, cashBalance: fin.cashBalance - principal, liabilities, expenseLines } }
  }

  // Full payoff of a normal debt.
  if (fin.cashBalance < lib.totalOwed) return player
  return {
    ...player,
    finances: {
      ...fin,
      cashBalance: fin.cashBalance - lib.totalOwed,
      liabilities: fin.liabilities.filter((l) => l.id !== liabilityId),
      expenseLines: fin.expenseLines.filter((e) => e.liabilityId !== liabilityId),
    },
  }
}

/**
 * Sell an owned asset. Settlement = sale price − any linked mortgage; the asset,
 * its passive income, its maintenance, and its mortgage liability are removed.
 */
export function sellAsset(player: PlayerState, assetId: string, salePrice: number): PlayerState {
  const fin = player.finances
  const asset = fin.assets.find((a) => a.id === assetId)
  if (!asset) return player
  const mortgage = fin.liabilities.find((l) => l.assetId === assetId)
  const settlement = salePrice - (mortgage?.totalOwed ?? 0)

  return {
    ...player,
    finances: {
      ...fin,
      cashBalance: fin.cashBalance + settlement,
      assets: fin.assets.filter((a) => a.id !== assetId),
      incomeSources: fin.incomeSources.filter((i) => i.assetId !== assetId),
      liabilities: fin.liabilities.filter((l) => l.assetId !== assetId),
      expenseLines: fin.expenseLines.filter((e) => e.assetId !== assetId),
    },
  }
}

let _idCounter = 1
function nextId() { return `gen_${_idCounter++}` }

export function applyCardEffect(
  player: PlayerState,
  effect: CardEffect,
  turn: number,
): PlayerState {
  const fin = { ...player.finances }

  switch (effect.type) {
    case 'cash_gain':
      return { ...player, finances: { ...fin, cashBalance: fin.cashBalance + effect.amount } }

    case 'cash_loss':
      // Crisis buffer: a loss that would overdraw the operating account is absorbed
      // from the sealed Tax (then Profit) envelopes before it can cause bankruptcy.
      return { ...player, finances: absorbLoss(fin, effect.amount) }

    case 'gain_income': {
      const src: IncomeSource = {
        id: nextId(),
        label: effect.label,
        monthlyAmount: effect.monthlyAmount,
        isPassive: effect.isPassive,
      }
      return { ...player, finances: { ...fin, incomeSources: [...fin.incomeSources, src] } }
    }

    case 'lose_income':
      return {
        ...player,
        finances: {
          ...fin,
          incomeSources: fin.incomeSources.filter((s) => s.id !== effect.sourceId),
        },
      }

    case 'add_expense': {
      const line: ExpenseLine = {
        id: nextId(),
        label: effect.label,
        monthlyAmount: effect.monthlyAmount,
        isFixed: effect.isFixed,
      }
      return { ...player, finances: { ...fin, expenseLines: [...fin.expenseLines, line] } }
    }

    case 'remove_expense':
      return {
        ...player,
        finances: {
          ...fin,
          expenseLines: fin.expenseLines.filter((e) => e.id !== effect.expenseId),
        },
      }

    case 'add_liability': {
      const lib: Liability = {
        id: nextId(),
        label: effect.label,
        totalOwed: effect.amount,
        monthlyPayment: effect.monthlyPayment,
      }
      const expLine: ExpenseLine = {
        id: nextId(),
        label: `${effect.label} payment`,
        monthlyAmount: effect.monthlyPayment,
        isFixed: true,
        liabilityId: lib.id,
      }
      return {
        ...player,
        finances: {
          ...fin,
          liabilities: [...fin.liabilities, lib],
          expenseLines: [...fin.expenseLines, expLine],
          cashBalance: fin.cashBalance + effect.amount,
        },
      }
    }

    case 'acquire_asset': {
      const asset: Asset = {
        ...effect.asset,
        id: nextId(),
        acquiredAtTurn: turn,
        cardId: '',
      }
      // The only cash you pay is the down payment (price − financed amount).
      const cost = asset.purchasePrice - asset.liabilityAmount
      const passiveIncome: IncomeSource | null = asset.monthlyPassiveIncome > 0
        ? {
            id: nextId(),
            label: asset.name,
            monthlyAmount: asset.monthlyPassiveIncome,
            isPassive: true,
            assetId: asset.id,
          }
        : null
      const maintenanceExpense: ExpenseLine | null = asset.monthlyExpense > 0
        ? {
            id: nextId(),
            label: `${asset.name} maintenance`,
            monthlyAmount: asset.monthlyExpense,
            isFixed: true,
            assetId: asset.id,
          }
        : null
      // Financed amount shows on the Balance Sheet; the payment is already netted
      // into the asset's cash flow, so no separate expense line is added.
      const mortgage: Liability | null = asset.liabilityAmount > 0
        ? { id: nextId(), label: `${asset.name} loan`, totalOwed: asset.liabilityAmount, monthlyPayment: 0, assetId: asset.id }
        : null
      return {
        ...player,
        finances: {
          ...fin,
          cashBalance: fin.cashBalance - cost,
          assets: [...fin.assets, asset],
          incomeSources: passiveIncome
            ? [...fin.incomeSources, passiveIncome]
            : fin.incomeSources,
          expenseLines: maintenanceExpense
            ? [...fin.expenseLines, maintenanceExpense]
            : fin.expenseLines,
          liabilities: mortgage ? [...fin.liabilities, mortgage] : fin.liabilities,
        },
      }
    }

    case 'quadrant_advance': {
      const order: PlayerState['quadrant'][] = ['E', 'S', 'B', 'I']
      const idx = order.indexOf(player.quadrant)
      const next = order[Math.min(idx + 1, order.length - 1)]
      return { ...player, quadrant: next }
    }

    case 'anchor_unlock': {
      const anchors = player.anchors.map((a) =>
        a.anchorId === effect.anchorId ? { ...a, unlocked: true, unlockedAtTurn: turn } : a,
      )
      return { ...player, anchors }
    }

    case 'fast_track_entry':
      return { ...player, boardTrack: 'fast_track', boardPosition: 0 }

    case 'add_child': {
      if (fin.numberOfChildren >= 3) return player // rulebook cap
      return { ...player, finances: { ...fin, numberOfChildren: fin.numberOfChildren + 1 } }
    }

    case 'lose_turn':
      return player  // handled by turnService

    case 'necst_gate':
      return player  // handled by turnService after NECST modal

    case 'gain_social': {
      const next = clampSocial(player.socialCapital + effect.amount, player.socialCapitalCap)
      return { ...player, socialCapital: next }
    }

    case 'spend_social': {
      const next = clampSocial(player.socialCapital - effect.amount, player.socialCapitalCap)
      return { ...player, socialCapital: next }
    }

    case 'social_gate': {
      const canAfford = player.socialCapital >= effect.cost
      let next = canAfford
        ? { ...player, socialCapital: clampSocial(player.socialCapital - effect.cost, player.socialCapitalCap) }
        : player
      for (const e of canAfford ? effect.onAfford : effect.onShort) {
        next = applyCardEffect(next, e, turn)
      }
      return next
    }
  }
}

export function applyPayday(player: PlayerState): PlayerState {
  const summary = computeSummary(player.finances)
  const cash = player.finances.cashBalance + summary.monthlyCashFlow
  return { ...player, finances: { ...player.finances, cashBalance: cash } }
}

/**
 * Scale a doodad card's cash_loss (and any paired add_expense) to the player's
 * income level. Cap = 50 % of monthly salary so low-income players aren't wiped
 * out by a single mandatory card — a high-income player still pays full price.
 *
 * The card description is annotated so the player sees the actual amount.
 */
export function scaleDoodadToPlayer(card: Card, player: PlayerState): Card {
  const salary = player.finances.incomeSources
    .filter((s) => !s.isPassive)
    .reduce((sum, s) => sum + s.monthlyAmount, 0)
  if (salary <= 0) return card

  const cap = salary * 0.5
  const lossEffect = card.effects.find((e) => e.type === 'cash_loss') as { type: 'cash_loss'; amount: number } | undefined
  if (!lossEffect || lossEffect.amount <= cap) return card

  // Scale factor: how much of the original amount we keep.
  const factor = cap / lossEffect.amount

  const scaledEffects = card.effects.map((e) => {
    if (e.type === 'cash_loss') return { ...e, amount: Math.round(cap) }
    if (e.type === 'add_expense') return { ...e, monthlyAmount: Math.round(e.monthlyAmount * factor) }
    return e
  })

  const note = ` (adjusted to ${formatCurrency(Math.round(cap))} for your income level)`
  return { ...card, effects: scaledEffects, description: card.description + note }
}
