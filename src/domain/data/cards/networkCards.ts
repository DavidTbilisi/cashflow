import type { Card } from '../../entities/types'

/**
 * Network deck — the Social Capital ("your Network") layer.
 *
 * Theme: relationships are an asset class. You build trust (gain_social),
 * spend it on others to make it compound (Pay It Forward), and cash it in for
 * access ordinary money can't buy (social_gate → off-market deals, co-signs).
 */
export const networkCards: Card[] = [
  {
    id: 'net_mentor_intro',
    type: 'network',
    title: "Mentor's Introduction",
    description: 'A mentor makes a warm introduction to their circle. +4 Social Capital.',
    flavorText: 'A warm intro opens a door a cold email never will.',
    effects: [{ type: 'gain_social', amount: 4, label: "Mentor's Introduction" }],
    lesson: 'Relationships compound. A trusted introduction is a real asset on your balance sheet.',
  },
  {
    id: 'net_community_volunteer',
    type: 'network',
    title: 'Community Volunteer',
    description: 'You give your weekends to a local cause. +3 Social Capital.',
    flavorText: 'People remember who showed up.',
    effects: [{ type: 'gain_social', amount: 3, label: 'Community Volunteer' }],
    lesson: 'Showing up for others is how a network is actually built.',
  },
  {
    id: 'net_pay_it_forward',
    type: 'network',
    title: 'Pay It Forward',
    description:
      'Help a struggling peer with no strings attached. Spend 3 Social Capital now — it returns doubled as goodwill spreads (+6 Social Capital).',
    flavorText: 'Give first. The network repays givers.',
    effects: [
      {
        type: 'social_gate',
        cost: 3,
        onAfford: [{ type: 'gain_social', amount: 6, label: 'Pay It Forward goodwill' }],
        onShort: [],
      },
    ],
    lesson: 'Social capital only compounds if you spend it on others first.',
  },
  {
    id: 'net_off_market_deal',
    type: 'network',
    title: 'Off-Market Deal',
    description:
      'A contact offers a deal that never hits the open market. Spend 5 Social Capital to take a $4,000 cash-flowing stake — otherwise it passes you by.',
    flavorText: 'The best deals are never listed.',
    effects: [
      {
        type: 'social_gate',
        cost: 5,
        onAfford: [
          {
            type: 'acquire_asset',
            asset: {
              name: 'Off-Market Partnership',
              assetClass: 'business',
              purchasePrice: 4000,
              currentValue: 4000,
              monthlyPassiveIncome: 250,
              monthlyExpense: 0,
              leverageUsed: false,
              liabilityAmount: 0,
              cardId: 'net_off_market_deal',
            },
          },
        ],
        onShort: [],
      },
    ],
    lesson: 'Networks surface opportunities that capital alone cannot reach.',
  },
  {
    id: 'net_co_sign_partner',
    type: 'network',
    title: 'Co-Sign Partner',
    description:
      'A trusted partner co-signs to cover an emergency. Spend 4 Social Capital to avoid a $2,000 hit — otherwise you pay it in cash.',
    flavorText: 'When cash is short, trust is currency.',
    effects: [
      {
        type: 'social_gate',
        cost: 4,
        onAfford: [],
        onShort: [{ type: 'cash_loss', amount: 2000 }],
      },
    ],
    lesson: 'A deep network is a buffer against shocks that would cost others cash.',
  },
  {
    id: 'net_burned_bridge',
    type: 'network',
    title: 'Burned Bridge',
    description:
      'A deal went sour and word got around. Lose 3 Social Capital — and if your network is too thin to absorb it, a $1,500 reputation-repair cost.',
    flavorText: 'Reputational debt comes due in cash.',
    effects: [
      {
        type: 'social_gate',
        cost: 3,
        onAfford: [],
        onShort: [{ type: 'cash_loss', amount: 1500 }],
      },
    ],
    lesson: 'Reputation is capital you can overdraw — and the overdraft is expensive.',
  },
]
