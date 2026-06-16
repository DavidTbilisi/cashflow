import type { Card } from '../../entities/types'

export const systemCards: Card[] = [
  {
    id: 'sys_01',
    type: 'system_building',
    title: 'Document Your Processes',
    description: 'You write SOPs for your business. It can now run without you for 30 days.',
    effects: [{ type: 'quadrant_advance' }],
    lesson: 'A business that requires your presence is a job, not a business.',
  },
  {
    id: 'sys_02',
    type: 'system_building',
    title: 'Hire Your First Employee',
    description: 'Delegation begins. Your income now survives a 1-month absence.',
    effects: [
      { type: 'add_expense', monthlyAmount: 2500, label: 'Employee salary', isFixed: true },
      { type: 'gain_income', monthlyAmount: 4000, label: 'Business revenue (systemized)', isPassive: true },
    ],
    lesson: 'The first hire is the hardest — and the most important step from S to B.',
  },
  {
    id: 'sys_03',
    type: 'system_building',
    title: 'Automate Cash Flow',
    description: 'Set up auto-invest: 20% of every paycheck flows to assets before you can spend it.',
    effects: [{ type: 'anchor_unlock', anchorId: 'engine' }],
    lesson: `"Pay yourself first" is not a mindset — it's a system you set up once and forget.`,
  },
  {
    id: 'sys_04',
    type: 'system_building',
    title: 'Legal Structure',
    description: 'Set up an LLC. Asset protection and tax advantages now active.',
    effects: [
      { type: 'anchor_unlock', anchorId: 'shield' },
      { type: 'cash_loss', amount: 1500 },
    ],
    lesson: 'Legal structures are the Shield anchor — protect what you\'ve built.',
  },
  {
    id: 'sys_05',
    type: 'system_building',
    title: 'Launch a Productocracy: a Digital Product',
    description:
      'You build a product so good it sells itself — word of mouth replaces ad spend. To become a productocracy it must clear ALL FIVE CENTS commandments, not just pass.',
    productocracy: true,
    requiresNECST: true,
    necstPassThreshold: 5,
    effects: [
      {
        type: 'necst_gate',
        onPass: [
          {
            type: 'acquire_asset',
            asset: {
              name: 'Self-selling digital product',
              assetClass: 'intellectual_property',
              purchasePrice: 3000,
              currentValue: 12000,
              monthlyPassiveIncome: 1000,
              monthlyExpense: 0,
              leverageUsed: false,
              liabilityAmount: 0,
              cardId: '',
            },
          },
        ],
        // Fail = you shipped, but it still needs paid ads to move: sunk build cost, no asset.
        onFail: [{ type: 'cash_loss', amount: 1500 }],
      },
    ],
    lesson:
      'A productocracy needs no advertising — the product IS the marketing. That only holds when all five CENTS commandments are true (Unscripted, DeMarco).',
  },
  {
    id: 'sys_06',
    type: 'system_building',
    title: 'Launch a Productocracy: a Media Channel',
    description:
      'Permissionless leverage: code and media reach millions at zero marginal cost. Clear all five CENTS commandments and the audience compounds without you.',
    productocracy: true,
    requiresNECST: true,
    necstPassThreshold: 5,
    effects: [
      {
        type: 'necst_gate',
        onPass: [
          {
            type: 'acquire_asset',
            asset: {
              name: 'Self-propagating media channel',
              assetClass: 'intellectual_property',
              purchasePrice: 2000,
              currentValue: 9000,
              monthlyPassiveIncome: 800,
              monthlyExpense: 0,
              leverageUsed: false,
              liabilityAmount: 0,
              cardId: '',
            },
          },
        ],
        onFail: [{ type: 'cash_loss', amount: 1000 }],
      },
    ],
    lesson:
      'Media is permissionless leverage — no one grants you an audience. But without all five CENTS it never compounds past your own effort.',
  },
]
