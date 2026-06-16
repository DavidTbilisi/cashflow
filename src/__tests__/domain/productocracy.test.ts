import { describe, it, expect } from 'vitest'
import {
  isProductocracy,
  applyProductocracyBonus,
  hasProductocracy,
  hasSelfSufficientProductocracy,
  PRODUCTOCRACY_INCOME_MULTIPLIER,
} from '../../domain/rules/productocracy'
import { canEnterFastTrack } from '../../domain/rules/winRules'
import { makePlayer, makeFinances } from '../fixtures'
import type { Asset, CardEffect, NECSTAnswers } from '../../domain/entities/types'

const ALL: NECSTAnswers = { control: true, entry: true, need: true, time: true, scale: true }

function asset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: 'a1',
    name: 'Product',
    assetClass: 'intellectual_property',
    purchasePrice: 3000,
    currentValue: 12000,
    monthlyPassiveIncome: 1000,
    monthlyExpense: 0,
    leverageUsed: false,
    liabilityAmount: 0,
    acquiredAtTurn: 1,
    cardId: '',
    ...overrides,
  }
}

describe('isProductocracy — the all-five bar', () => {
  it('true only when every commandment holds', () => {
    expect(isProductocracy(ALL)).toBe(true)
  })

  it('false if any single commandment is missing', () => {
    for (const key of Object.keys(ALL) as (keyof NECSTAnswers)[]) {
      expect(isProductocracy({ ...ALL, [key]: false })).toBe(false)
    }
  })
})

describe('applyProductocracyBonus', () => {
  const acquire: CardEffect = {
    type: 'acquire_asset',
    asset: {
      name: 'Self-selling product',
      assetClass: 'intellectual_property',
      purchasePrice: 3000,
      currentValue: 12000,
      monthlyPassiveIncome: 1000,
      monthlyExpense: 0,
      leverageUsed: false,
      liabilityAmount: 0,
      cardId: '',
    },
  }

  it('flags the asset and scales passive income on a perfect pass', () => {
    const [boosted] = applyProductocracyBonus([acquire], true)
    expect(boosted.type).toBe('acquire_asset')
    if (boosted.type === 'acquire_asset') {
      expect(boosted.asset.isProductocracy).toBe(true)
      expect(boosted.asset.monthlyPassiveIncome).toBe(1000 * PRODUCTOCRACY_INCOME_MULTIPLIER)
    }
  })

  it('leaves effects untouched when not perfect', () => {
    const [same] = applyProductocracyBonus([acquire], false)
    if (same.type === 'acquire_asset') {
      expect(same.asset.isProductocracy).toBeUndefined()
      expect(same.asset.monthlyPassiveIncome).toBe(1000)
    }
  })
})

describe('hasSelfSufficientProductocracy — Unscripted escape velocity', () => {
  it('true when one productocracy covers all expenses (rent 1500)', () => {
    const player = makePlayer({
      finances: makeFinances({ assets: [asset({ isProductocracy: true, monthlyPassiveIncome: 1600 })] }),
    })
    expect(hasProductocracy(player)).toBe(true)
    expect(hasSelfSufficientProductocracy(player)).toBe(true)
    expect(canEnterFastTrack(player)).toBe(true)
  })

  it('false when the productocracy income falls short of expenses', () => {
    const player = makePlayer({
      finances: makeFinances({ assets: [asset({ isProductocracy: true, monthlyPassiveIncome: 1000 })] }),
    })
    expect(hasSelfSufficientProductocracy(player)).toBe(false)
  })

  it('false for an ordinary (unflagged) asset even if it covers expenses', () => {
    const player = makePlayer({
      finances: makeFinances({ assets: [asset({ monthlyPassiveIncome: 5000 })] }),
    })
    expect(hasProductocracy(player)).toBe(false)
    expect(hasSelfSufficientProductocracy(player)).toBe(false)
  })
})
