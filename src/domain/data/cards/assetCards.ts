import type { Card } from '../../entities/types'

export const assetCards: Card[] = [
  {
    id: 'ast_01',
    type: 'asset_acquisition',
    title: 'Rental Property',
    description: 'Duplex for $120,000. Down payment $24,000. Nets $500/month after mortgage.',
    effects: [
      {
        type: 'acquire_asset',
        asset: {
          name: 'Duplex Rental',
          assetClass: 'real_estate',
          purchasePrice: 120000,
          currentValue: 120000,
          monthlyPassiveIncome: 500,
          monthlyExpense: 150,
          leverageUsed: true,
          liabilityAmount: 96000,
          cardId: 'ast_01',
        },
      },
    ],
    lesson: 'Real estate leverage turns $24k of capital into a $500/month passive stream.',
  },
  {
    id: 'ast_02',
    type: 'asset_acquisition',
    title: 'Index Fund Investment',
    description: 'Invest $10,000 into a low-cost index fund yielding 4% annually.',
    effects: [
      {
        type: 'acquire_asset',
        asset: {
          name: 'Index Fund',
          assetClass: 'stocks',
          purchasePrice: 10000,
          currentValue: 10000,
          monthlyPassiveIncome: 33,
          monthlyExpense: 0,
          leverageUsed: false,
          liabilityAmount: 0,
          cardId: 'ast_02',
        },
      },
    ],
    lesson: 'Index funds: low cost, diversified, compounding. Boring is powerful.',
  },
  {
    id: 'ast_03',
    type: 'asset_acquisition',
    title: 'Digital Course',
    description: 'Launch an online course for $2,000 production cost. Earns $400/month.',
    effects: [
      {
        type: 'acquire_asset',
        asset: {
          name: 'Online Course',
          assetClass: 'intellectual_property',
          purchasePrice: 2000,
          currentValue: 8000,
          monthlyPassiveIncome: 400,
          monthlyExpense: 50,
          leverageUsed: false,
          liabilityAmount: 0,
          cardId: 'ast_03',
        },
      },
    ],
    lesson: 'IP assets have near-zero marginal cost to serve one more customer.',
  },
  {
    id: 'ast_04',
    type: 'asset_acquisition',
    title: 'Small Business Purchase',
    description: 'Buy a systematized local business for $40,000. Earns $1,200/month.',
    requiresNECST: true,
    necstPassThreshold: 3,
    effects: [
      {
        type: 'acquire_asset',
        asset: {
          name: 'Acquired Business',
          assetClass: 'business',
          purchasePrice: 40000,
          currentValue: 60000,
          monthlyPassiveIncome: 1200,
          monthlyExpense: 300,
          leverageUsed: false,
          liabilityAmount: 0,
          cardId: 'ast_04',
        },
      },
    ],
    lesson: 'Only buy a business that passes the NECST test — especially the Time Commandment.',
  },
  {
    id: 'ast_05',
    type: 'asset_acquisition',
    title: 'Dividend Stock Portfolio',
    description: 'Build a $25,000 portfolio of dividend stocks at 5% yield.',
    effects: [
      {
        type: 'acquire_asset',
        asset: {
          name: 'Dividend Portfolio',
          assetClass: 'stocks',
          purchasePrice: 25000,
          currentValue: 25000,
          monthlyPassiveIncome: 104,
          monthlyExpense: 0,
          leverageUsed: false,
          liabilityAmount: 0,
          cardId: 'ast_05',
        },
      },
    ],
    lesson: 'Dividend portfolios provide cash flow AND potential appreciation.',
  },
  {
    id: 'ast_06',
    type: 'asset_acquisition',
    title: 'Mobile Home Park Lot',
    description: 'Acquire a mobile home lot for $15,000. Earns $350/month net.',
    effects: [
      {
        type: 'acquire_asset',
        asset: {
          name: 'Mobile Home Lot',
          assetClass: 'real_estate',
          purchasePrice: 15000,
          currentValue: 20000,
          monthlyPassiveIncome: 350,
          monthlyExpense: 80,
          leverageUsed: false,
          liabilityAmount: 0,
          cardId: 'ast_06',
        },
      },
    ],
    lesson: 'Affordable real estate niches often have better cash-on-cash returns than premium markets.',
  },
]
