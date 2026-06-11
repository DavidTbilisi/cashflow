import { describe, it, expect } from 'vitest'
import { buildDecks, drawCard } from '../../domain/services/cardService'
import type { Card } from '../../domain/entities/types'

describe('buildDecks', () => {
  it('returns all 6 deck types', () => {
    const decks = buildDecks(42)
    expect(Object.keys(decks)).toEqual(
      expect.arrayContaining([
        'income',
        'expense_liability',
        'asset_acquisition',
        'system_building',
        'decision_temptation',
        'obstacle_challenge',
      ]),
    )
  })

  it('each deck contains cards', () => {
    const decks = buildDecks(42)
    for (const [type, deck] of Object.entries(decks)) {
      expect(deck.length, `deck ${type} should be non-empty`).toBeGreaterThan(0)
    }
  })

  it('same seed produces identical deck order', () => {
    const a = buildDecks(99)
    const b = buildDecks(99)
    for (const type of Object.keys(a) as Array<keyof typeof a>) {
      expect(a[type].map((c) => c.id)).toEqual(b[type].map((c) => c.id))
    }
  })

  it('different seeds produce different deck orders', () => {
    const a = buildDecks(1)
    const b = buildDecks(9999)
    let differs = false
    for (const type of Object.keys(a) as Array<keyof typeof a>) {
      if (a[type][0]?.id !== b[type][0]?.id) {
        differs = true
        break
      }
    }
    expect(differs).toBe(true)
  })

  it('deck contains same card set regardless of seed', () => {
    const a = buildDecks(1)
    const b = buildDecks(2)
    for (const type of Object.keys(a) as Array<keyof typeof a>) {
      const aIds = a[type].map((c) => c.id).sort()
      const bIds = b[type].map((c) => c.id).sort()
      expect(aIds).toEqual(bIds)
    }
  })
})

describe('drawCard', () => {
  it('returns the first card and a shorter deck', () => {
    const deck: Card[] = [
      { id: 'c1', type: 'income', title: 'Card 1', description: '', effects: [] },
      { id: 'c2', type: 'income', title: 'Card 2', description: '', effects: [] },
      { id: 'c3', type: 'income', title: 'Card 3', description: '', effects: [] },
    ]
    const { card, deck: remaining } = drawCard(deck, [])
    expect(card.id).toBe('c1')
    expect(remaining).toHaveLength(2)
    expect(remaining.map((c) => c.id)).toEqual(['c2', 'c3'])
  })

  it('does not mutate the original deck', () => {
    const deck: Card[] = [
      { id: 'c1', type: 'income', title: 'Card 1', description: '', effects: [] },
    ]
    const originalLength = deck.length
    drawCard(deck, [])
    expect(deck).toHaveLength(originalLength)
  })

  it('reshuffles discard pile when deck is empty', () => {
    const discard: Card[] = [
      { id: 'd1', type: 'expense_liability', title: 'Discard 1', description: '', effects: [] },
      { id: 'd2', type: 'expense_liability', title: 'Discard 2', description: '', effects: [] },
    ]
    const { card, deck: remaining } = drawCard([], discard)
    expect(card).toBeDefined()
    expect(['d1', 'd2']).toContain(card.id)
    expect(remaining).toHaveLength(1)
  })

  it('drawn card is not in the remaining deck', () => {
    const deck: Card[] = [
      { id: 'c1', type: 'income', title: 'Card 1', description: '', effects: [] },
      { id: 'c2', type: 'income', title: 'Card 2', description: '', effects: [] },
    ]
    const { card, deck: remaining } = drawCard(deck, [])
    expect(remaining.find((c) => c.id === card.id)).toBeUndefined()
  })

  it('single card deck returns that card with empty remaining', () => {
    const deck: Card[] = [
      { id: 'only', type: 'income', title: 'Only Card', description: '', effects: [] },
    ]
    const { card, deck: remaining } = drawCard(deck, [])
    expect(card.id).toBe('only')
    expect(remaining).toHaveLength(0)
  })
})
