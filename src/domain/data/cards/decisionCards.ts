import type { Card } from '../../entities/types'

export const decisionCards: Card[] = [
  {
    id: 'dec_01',
    type: 'decision_temptation',
    title: 'Lifestyle Temptation',
    description: 'You got a raise! Buy the luxury car (+$600/month) or invest the difference?',
    flavorText: 'The Rat Race tightens its grip with every yes.',
    effects: [
      {
        type: 'necst_gate',
        onPass: [{ type: 'gain_income', monthlyAmount: 500, label: 'Invested raise surplus', isPassive: true }],
        onFail: [{ type: 'add_expense', monthlyAmount: 600, label: 'Luxury car payment', isFixed: true }],
      },
    ],
    lesson: 'Every raise is a fork in the road. One path builds freedom, the other builds the cage.',
  },
  {
    id: 'dec_02',
    type: 'decision_temptation',
    title: 'Leverage Opportunity',
    description: 'Borrow $50,000 at 6% to invest in an asset yielding 12%. ROI > borrowing cost?',
    effects: [
      {
        type: 'necst_gate',
        onPass: [
          { type: 'add_liability', amount: 50000, monthlyPayment: 417, label: 'Investment loan' },
          { type: 'gain_income', monthlyAmount: 500, label: 'Leveraged asset income', isPassive: true },
        ],
        onFail: [{ type: 'cash_loss', amount: 1000 }],
      },
    ],
    lesson: 'Debt is good when ROI > borrowing cost. Bad when it doesn\'t.',
  },
  {
    id: 'dec_03',
    type: 'decision_temptation',
    title: 'New Venture Idea',
    description: 'A business idea lands in your lap. It needs $15,000 seed and promises $800/month.',
    requiresNECST: true,
    effects: [
      {
        type: 'necst_gate',
        onPass: [
          { type: 'cash_loss', amount: 15000 },
          { type: 'gain_income', monthlyAmount: 800, label: 'Venture income', isPassive: false },
        ],
        onFail: [{ type: 'cash_loss', amount: 3000 }],
      },
    ],
    lesson: 'A venture without passing the NECST test is a donation disguised as an investment.',
  },
]
