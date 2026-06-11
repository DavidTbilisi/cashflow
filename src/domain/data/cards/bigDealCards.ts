import type { Card } from '../../entities/types'

// Big Deals: apartments & businesses. Larger down payments (≥ $6,000), bigger cash flow.
export const bigDealCards: Card[] = [
  {
    id: 'bd_apartment_12',
    type: 'big_deal',
    title: 'Apartment House for Sale',
    description: '12-unit building from out-of-state heirs. Cost $350,000, down $50,000, mortgage $300,000. Nets +$2,400/mo.',
    flavorText: '58% cash-on-cash return. Use it yourself or sell the option to another player.',
    effects: [{ type: 'acquire_asset', asset: { name: '12-Unit Apartments', assetClass: 'real_estate', purchasePrice: 350000, currentValue: 350000, monthlyPassiveIncome: 2400, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 300000, cardId: 'bd_apartment_12' } }],
    lesson: 'Big real estate uses big leverage — a $50k down payment controls a $350k asset.',
  },
  {
    id: 'bd_8plex',
    type: 'big_deal',
    title: '8-Plex for Sale',
    description: 'Well-kept 8-unit building. Cost $240,000, down $40,000, mortgage $200,000. Nets +$1,700/mo.',
    effects: [{ type: 'acquire_asset', asset: { name: '8-Plex', assetClass: 'real_estate', purchasePrice: 240000, currentValue: 240000, monthlyPassiveIncome: 1700, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 200000, cardId: 'bd_8plex' } }],
    lesson: 'More units under one roof spread your risk across many tenants.',
  },
  {
    id: 'bd_storage',
    type: 'big_deal',
    title: 'Self-Storage Facility',
    description: 'A 200-unit storage facility. Cost $300,000, down $45,000, mortgage $255,000. Nets +$1,900/mo.',
    effects: [{ type: 'acquire_asset', asset: { name: 'Storage Facility', assetClass: 'real_estate', purchasePrice: 300000, currentValue: 300000, monthlyPassiveIncome: 1900, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 255000, cardId: 'bd_storage' } }],
    lesson: 'Low-maintenance real estate: storage tenants need little, and turnover is cheap.',
  },
  {
    id: 'bd_carwash',
    type: 'big_deal',
    title: 'Automated Car Wash',
    description: 'A fully automated car wash for sale. Down $30,000, financed $90,000. Nets +$1,000/mo.',
    effects: [{ type: 'acquire_asset', asset: { name: 'Car Wash', assetClass: 'business', purchasePrice: 120000, currentValue: 120000, monthlyPassiveIncome: 1000, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 90000, cardId: 'bd_carwash' } }],
    lesson: 'An automated business runs on technology, not your time — that\'s the goal.',
  },
  {
    id: 'bd_franchise',
    type: 'big_deal',
    title: 'Sandwich Franchise',
    description: 'A proven franchise location. Down $60,000, financed $90,000. Nets +$3,000/mo — if it passes your due diligence.',
    requiresNECST: true,
    necstPassThreshold: 3,
    effects: [{ type: 'acquire_asset', asset: { name: 'Franchise', assetClass: 'business', purchasePrice: 150000, currentValue: 150000, monthlyPassiveIncome: 3000, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 90000, cardId: 'bd_franchise' } }],
    lesson: 'A franchise is a business-in-a-box — but only invest if it passes the NECST test.',
  },
  {
    id: 'bd_office',
    type: 'big_deal',
    title: 'Small Office Building',
    description: 'A 4-tenant office building. Cost $500,000, down $80,000, mortgage $420,000. Nets +$3,500/mo.',
    effects: [{ type: 'acquire_asset', asset: { name: 'Office Building', assetClass: 'real_estate', purchasePrice: 500000, currentValue: 500000, monthlyPassiveIncome: 3500, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 420000, cardId: 'bd_office' } }],
    lesson: 'Commercial leases are long and tenants maintain their own space — stable cash flow.',
  },
  {
    id: 'bd_pizza',
    type: 'big_deal',
    title: 'Pizza Shop',
    description: 'A turnkey pizza shop with a manager in place. Down $25,000, financed $50,000. Nets +$1,500/mo.',
    effects: [{ type: 'acquire_asset', asset: { name: 'Pizza Shop', assetClass: 'business', purchasePrice: 75000, currentValue: 75000, monthlyPassiveIncome: 1500, monthlyExpense: 0, leverageUsed: true, liabilityAmount: 50000, cardId: 'bd_pizza' } }],
    lesson: 'A business with a manager already in place keeps running without you on site.',
  },
]
