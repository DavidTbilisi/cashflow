import type { ESBIQuadrant, FinancialStatement, ExpenseLine, Liability } from '../entities/types'

export interface StartingProfile {
  quadrant: ESBIQuadrant
  label: string
  description: string
  /** Paid out as starting cash at game start (rulebook: cash = cash flow + savings). */
  savings: number
  finances: FinancialStatement
}

/** Debt amounts on the Balance Sheet (each with a matching monthly payment). */
interface Debts {
  mortgage?: number
  school?: number
  car?: number
  credit?: number
  retail?: number
}

/** Monthly expense payments on the Income Statement. */
interface Expenses {
  taxes: number
  mortgage?: number
  school?: number
  car?: number
  credit?: number
  retail?: number
  other: number
}

const DEBT_META: { key: keyof Debts; expKey: keyof Expenses; label: string; payLabel: string }[] = [
  { key: 'mortgage', expKey: 'mortgage', label: 'Home Mortgage', payLabel: 'Home Mortgage Payment' },
  { key: 'school', expKey: 'school', label: 'School Loans', payLabel: 'School Loan Payment' },
  { key: 'car', expKey: 'car', label: 'Car Loans', payLabel: 'Car Payment' },
  { key: 'credit', expKey: 'credit', label: 'Credit Cards', payLabel: 'Credit Card Payment' },
  { key: 'retail', expKey: 'retail', label: 'Retail Debt', payLabel: 'Retail Payment' },
]

function makeProfession(
  quadrant: ESBIQuadrant,
  label: string,
  description: string,
  salary: number,
  exp: Expenses,
  debt: Debts,
  perChildExpense: number,
  savings: number,
): StartingProfile {
  const slug = label.toLowerCase().replace(/[^a-z]+/g, '_')
  const liabilities: Liability[] = []
  const expenseLines: ExpenseLine[] = [
    { id: `${slug}_taxes`, label: 'Taxes', monthlyAmount: exp.taxes, isFixed: true },
  ]

  for (const meta of DEBT_META) {
    const owed = debt[meta.key]
    const pay = exp[meta.expKey] as number | undefined
    if (!owed || !pay) continue
    const libId = `${slug}_${meta.key}`
    liabilities.push({ id: libId, label: meta.label, totalOwed: owed, monthlyPayment: pay })
    expenseLines.push({ id: `${libId}_pay`, label: meta.payLabel, monthlyAmount: pay, isFixed: true, liabilityId: libId })
  }

  expenseLines.push({ id: `${slug}_other`, label: 'Other Expenses', monthlyAmount: exp.other, isFixed: false })

  return {
    quadrant,
    label,
    description,
    savings,
    finances: {
      cashBalance: 0, // set to (cash flow + savings) by gameStore at init
      incomeSources: [{ id: `${slug}_salary`, label: 'Salary', monthlyAmount: salary, isPassive: false }],
      expenseLines,
      assets: [],
      liabilities,
      numberOfChildren: 0,
      perChildExpense,
    },
  }
}

export const STARTING_PROFILES: StartingProfile[] = [
  makeProfession('E', 'Doctor (MD)', 'High salary, but high debt and expenses to match.',
    13200, { taxes: 3420, mortgage: 1900, school: 750, car: 380, credit: 270, retail: 50, other: 2880 },
    { mortgage: 202000, school: 150000, car: 19000, credit: 9000, retail: 1000 }, 640, 400),

  makeProfession('E', 'Airline Pilot', 'Strong income, heavy lifestyle and credit-card debt.',
    9500, { taxes: 2350, mortgage: 1330, car: 220, credit: 600, retail: 50, other: 1850 },
    { mortgage: 143000, car: 11000, credit: 20000, retail: 1000 }, 460, 400),

  makeProfession('E', 'Engineer', 'Comfortable salary with manageable, middling debt.',
    4900, { taxes: 1050, mortgage: 700, school: 60, car: 120, credit: 90, retail: 50, other: 690 },
    { mortgage: 75000, school: 12000, car: 6000, credit: 3000, retail: 1000 }, 200, 400),

  makeProfession('E', 'Police Officer', 'Modest salary; small footprint makes the Rat Race winnable.',
    3000, { taxes: 580, mortgage: 700, car: 100, credit: 60, retail: 50, other: 690 },
    { mortgage: 46000, car: 5000, credit: 3000, retail: 1000 }, 160, 400),

  makeProfession('E', 'Teacher', 'Low salary and low expenses — every deal counts.',
    3300, { taxes: 630, mortgage: 500, school: 60, car: 100, credit: 60, retail: 50, other: 700 },
    { mortgage: 50000, school: 12000, car: 5000, credit: 2000, retail: 1000 }, 180, 400),

  makeProfession('E', 'Truck Driver', 'Tight budget, little savings — disciplined play required.',
    2500, { taxes: 460, mortgage: 400, car: 80, credit: 50, retail: 50, other: 470 },
    { mortgage: 38000, car: 4000, credit: 2000, retail: 1000 }, 140, 0),

  // Custom ESBI starting point kept from the original design.
  makeProfession('S', 'Freelancer', 'Self-employed: variable income, lean fixed costs, some savings.',
    6500, { taxes: 1300, mortgage: 1500, car: 120, credit: 90, other: 900 },
    { mortgage: 90000, car: 6000, credit: 3000 }, 220, 3000),
]
