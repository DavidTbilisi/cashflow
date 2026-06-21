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
    principleId: 'lifestyle-creep',
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
    principleId: 'roi-beats-borrowing-cost',
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
    principleId: 'necst-test',
  },
  {
    id: 'dec_04',
    type: 'decision_temptation',
    title: 'Consumer Loan Temptation',
    description: 'A "0% for 12 months" deal makes a $9,000 home theatre feel free. Accept the financing for the lifestyle upgrade, or pass?',
    flavorText: 'The payment outlives the novelty.',
    effects: [{ type: 'add_liability', amount: 9000, monthlyPayment: 250, label: 'Consumer loan' }],
    lesson: 'Parasitic debt funds consumption — it drains your cash flow every month with nothing earning behind it. Productive debt buys assets that pay the loan for you.',
    principleId: 'productive-vs-parasitic-debt',
  },
  {
    id: 'dec_05',
    type: 'decision_temptation',
    title: 'The Optimal Portfolio',
    description: 'An advisor pitches a complex, higher-return strategy you\'d lie awake worrying about — or take the simple plan you\'ll actually stick with for 20 years.',
    flavorText: 'Reasonable beats rational when you have to live with it.',
    effects: [{ type: 'gain_income', monthlyAmount: 120, label: 'Steady index plan', isPassive: true }],
    lesson: 'A good plan you can hold through a downturn beats a perfect plan you panic-sell. Sustainable beats optimal.',
    principleId: 'reasonable-over-rational',
  },
  {
    id: 'dec_06',
    type: 'decision_temptation',
    title: 'Debt Payoff Plan',
    description: 'You have spare cash to attack debt. Pay $1,500 now to wipe out a balance — avalanche (highest rate first) or snowball (smallest balance first)?',
    flavorText: 'The best method is the one you\'ll actually finish.',
    effects: [
      { type: 'cash_loss', amount: 1500 },
      { type: 'gain_income', monthlyAmount: 150, label: 'Interest saved', isPassive: true },
    ],
    lesson: 'Avalanche minimises interest; snowball maximises momentum. Either way, freed-up cash flow compounds back to you.',
    principleId: 'avalanche-vs-snowball',
  },
  {
    id: 'dec_07',
    type: 'decision_temptation',
    title: 'Buy It or Build It?',
    description: 'The same $1,000 can buy a gadget you want — or the tooling to make something that sells. Spend to consume, or spend to produce?',
    effects: [
      { type: 'cash_loss', amount: 1000 },
      { type: 'gain_income', monthlyAmount: 120, label: 'Producer output', isPassive: true },
    ],
    lesson: 'Consumers ask "do I want this?"; producers ask "how does this make money?" The question you ask decides which side of the cash flow you\'re on.',
    principleId: 'producer-mindset',
  },
  {
    id: 'dec_08',
    type: 'decision_temptation',
    title: 'Leverage Amplifies the Decision',
    description: 'Borrow $30,000 to scale a position. Good judgment makes the spread yours; bad judgment magnifies the loss. Proceed?',
    flavorText: 'Leverage is a force multiplier on judgment — both ways.',
    effects: [
      { type: 'add_liability', amount: 30000, monthlyPayment: 250, label: 'Leverage loan' },
      { type: 'gain_income', monthlyAmount: 400, label: 'Leveraged position', isPassive: true },
    ],
    lesson: 'High leverage makes a right call pay enormously and a wrong call ruin enormously. Earn the leverage with the quality of the decision.',
    principleId: 'judgment-multiplies-leverage',
  },
  {
    id: 'dec_09',
    type: 'decision_temptation',
    title: 'Choose Your Road',
    description: 'Sidewalk (spend it all), Slowlane (save a wage for 40 years), or Fastlane (build a business system)? Commit time to a side business.',
    effects: [{ type: 'gain_income', monthlyAmount: 150, label: 'Side business revenue', isPassive: false }],
    lesson: 'Three roads to wealth: no plan, slow compounding, or a controllable business system. The Fastlane trades comfort now for an uncapped, controllable engine.',
    principleId: 'three-roadmaps',
  },
]
