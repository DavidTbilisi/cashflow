import { describe, expect, it } from 'vitest'
import type { Card } from '../../domain/entities/types'
import { principleById } from '../../domain/data/principles'
import { incomeCards } from '../../domain/data/cards/incomeCards'
import { expenseCards } from '../../domain/data/cards/expenseCards'
import { assetCards } from '../../domain/data/cards/assetCards'
import { systemCards } from '../../domain/data/cards/systemCards'
import { decisionCards } from '../../domain/data/cards/decisionCards'
import { obstacleCards } from '../../domain/data/cards/obstacleCards'
import { networkCards } from '../../domain/data/cards/networkCards'
import { smallDealCards } from '../../domain/data/cards/smallDealCards'
import { bigDealCards } from '../../domain/data/cards/bigDealCards'
import { marketCards } from '../../domain/data/cards/marketCards'
import { doodadCards } from '../../domain/data/cards/doodadCards'

const ALL_CARDS: Card[] = [
  ...incomeCards,
  ...expenseCards,
  ...assetCards,
  ...systemCards,
  ...decisionCards,
  ...obstacleCards,
  ...networkCards,
  ...smallDealCards,
  ...bigDealCards,
  ...marketCards,
  ...doodadCards,
]

describe('card → principle links', () => {
  it('every principleId on a card resolves to a real principle', () => {
    for (const card of ALL_CARDS) {
      if (card.principleId) {
        expect(principleById(card.principleId), `${card.id} → ${card.principleId}`).toBeDefined()
      }
    }
  })

  it('a meaningful share of cards are linked to the Codex', () => {
    const linked = ALL_CARDS.filter((c) => c.principleId).length
    expect(linked).toBeGreaterThanOrEqual(15)
  })

  it('keeps card ids unique within each deck', () => {
    const decks = [incomeCards, assetCards, decisionCards, obstacleCards, smallDealCards, marketCards, systemCards, networkCards]
    for (const deck of decks) {
      const ids = deck.map((c) => c.id)
      expect(new Set(ids).size, `dup id in deck starting ${deck[0]?.id}`).toBe(ids.length)
    }
  })
})
