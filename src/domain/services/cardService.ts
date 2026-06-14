import type { Card, CardType } from '../entities/types'
import { createRng } from '../../utils/randomSeed'
import { incomeCards } from '../data/cards/incomeCards'
import { expenseCards } from '../data/cards/expenseCards'
import { assetCards } from '../data/cards/assetCards'
import { systemCards } from '../data/cards/systemCards'
import { decisionCards } from '../data/cards/decisionCards'
import { obstacleCards } from '../data/cards/obstacleCards'
import { networkCards } from '../data/cards/networkCards'
import { smallDealCards } from '../data/cards/smallDealCards'
import { bigDealCards } from '../data/cards/bigDealCards'
import { marketCards } from '../data/cards/marketCards'
import { doodadCards } from '../data/cards/doodadCards'

const ALL_DECKS: Record<string, Card[]> = {
  // Rulebook decks
  small_deal: smallDealCards,
  big_deal: bigDealCards,
  market: marketCards,
  doodad: doodadCards,
  // Custom decks (Anchors / ESBI / NECST layer)
  income: incomeCards,
  expense_liability: expenseCards,
  asset_acquisition: assetCards,
  system_building: systemCards,
  decision_temptation: decisionCards,
  obstacle_challenge: obstacleCards,
  network: networkCards,
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildDecks(seed: number): Record<CardType, Card[]> {
  const rng = createRng(seed)
  return Object.fromEntries(
    Object.entries(ALL_DECKS).map(([type, cards]) => [type, shuffle(cards, rng)]),
  ) as Record<CardType, Card[]>
}

export function drawCard(
  deck: Card[],
  discard: Card[],
): { card: Card | null; deck: Card[] } {
  if (deck.length === 0) {
    if (discard.length === 0) return { card: null, deck: [] }
    // Reshuffle discard into deck
    deck = shuffle(discard, createRng(discard.length * 31))
  }
  const [card, ...rest] = deck
  return { card: card ?? null, deck: rest }
}
