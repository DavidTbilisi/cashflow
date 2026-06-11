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
]
