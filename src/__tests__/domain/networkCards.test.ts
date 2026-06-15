import { describe, it, expect } from 'vitest'
import { networkCards } from '../../domain/data/cards/networkCards'
import { applyCardEffect } from '../../domain/services/financialCalc'
import { makePlayer, makeFinances } from '../fixtures'
import type { CardEffect } from '../../domain/entities/types'

/** Run every effect on a card through applyCardEffect (mirrors the store's loop). */
function playCard(cardId: string, socialCapital: number, cash = 5000) {
  const card = networkCards.find((c) => c.id === cardId)!
  let player = makePlayer({ socialCapital, socialCapitalCap: 25, finances: makeFinances({ cashBalance: cash }) })
  for (const effect of card.effects) {
    player = applyCardEffect(player, effect, 1)
  }
  return player
}

// ── Data integrity ─────────────────────────────────────────────────────────────

describe('network deck integrity', () => {
  it('has unique card ids', () => {
    const ids = networkCards.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every card is of type "network" and carries at least one effect', () => {
    for (const card of networkCards) {
      expect(card.type).toBe('network')
      expect(card.effects.length).toBeGreaterThan(0)
    }
  })

  it('every social_gate has a positive cost and a meaningful branch', () => {
    for (const card of networkCards) {
      for (const effect of card.effects) {
        if (effect.type === 'social_gate') {
          expect(effect.cost).toBeGreaterThan(0)
          // A gate that does nothing on either branch would be pointless.
          expect(effect.onAfford.length + effect.onShort.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('every card carries teaching copy (lesson)', () => {
    for (const card of networkCards) {
      expect(card.lesson && card.lesson.length).toBeGreaterThan(0)
    }
  })
})

// ── Behavior of representative cards ─────────────────────────────────────────────

describe('gain_social network cards', () => {
  it("Mentor's Introduction adds +4 Social Capital", () => {
    expect(playCard('net_mentor_intro', 2).socialCapital).toBe(6)
  })

  it('Community Volunteer adds +3 Social Capital', () => {
    expect(playCard('net_community_volunteer', 2).socialCapital).toBe(5)
  })
})

describe('Pay It Forward (give-first compounding)', () => {
  it('spends 3 and returns 6 when affordable → net +3', () => {
    expect(playCard('net_pay_it_forward', 5).socialCapital).toBe(8) // 5 − 3 + 6
  })

  it('does nothing when you have too little to give', () => {
    expect(playCard('net_pay_it_forward', 2).socialCapital).toBe(2) // can't afford the 3 cost
  })
})

describe('Off-Market Deal (social_gate → asset)', () => {
  it('spends 5 SC and acquires the cash-flowing stake when affordable', () => {
    const p = playCard('net_off_market_deal', 6)
    expect(p.socialCapital).toBe(1) // 6 − 5
    expect(p.finances.assets).toHaveLength(1)
    expect(p.finances.assets[0].name).toBe('Off-Market Partnership')
    expect(p.finances.incomeSources.some((i) => i.isPassive && i.monthlyAmount === 250)).toBe(true)
  })

  it('passes the player by when SC is short — no spend, no asset', () => {
    const p = playCard('net_off_market_deal', 3)
    expect(p.socialCapital).toBe(3)
    expect(p.finances.assets).toHaveLength(0)
  })
})

describe('Co-Sign Partner (network as a shock buffer)', () => {
  it('a deep network absorbs the emergency for free', () => {
    const p = playCard('net_co_sign_partner', 6, 5000)
    expect(p.socialCapital).toBe(2) // 6 − 4
    expect(p.finances.cashBalance).toBe(5000) // no cash hit
  })

  it('a thin network pays the $2,000 in cash instead', () => {
    const p = playCard('net_co_sign_partner', 1, 5000)
    expect(p.socialCapital).toBe(1) // unchanged — couldn't cover the cost
    expect(p.finances.cashBalance).toBe(3000) // onShort cash_loss
  })
})

describe('Burned Bridge (reputational debt comes due in cash)', () => {
  it('a thin network eats the $1,500 repair cost', () => {
    const p = playCard('net_burned_bridge', 1, 5000)
    expect(p.finances.cashBalance).toBe(3500)
  })

  it('a strong network spends SC and avoids the cash cost', () => {
    const cardCost = (networkCards.find((c) => c.id === 'net_burned_bridge')!.effects[0] as Extract<CardEffect, { type: 'social_gate' }>).cost
    const p = playCard('net_burned_bridge', 5, 5000)
    expect(p.socialCapital).toBe(5 - cardCost)
    expect(p.finances.cashBalance).toBe(5000)
  })
})
