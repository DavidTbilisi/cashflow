import { describe, expect, it } from 'vitest'
import type { Card } from '../../domain/entities/types'
import { PRINCIPLES, principleById } from '../../domain/data/principles'
import { DERIVABLE_PRINCIPLE_IDS, derivePlayerPrinciples } from '../../domain/services/principleDiscovery'
import { STARTING_PROFILES } from '../../domain/data/startingProfiles'
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
  ...incomeCards, ...expenseCards, ...assetCards, ...systemCards, ...decisionCards,
  ...obstacleCards, ...networkCards, ...smallDealCards, ...bigDealCards, ...marketCards, ...doodadCards,
]

const cardPrincipleIds = new Set(ALL_CARDS.map((c) => c.principleId).filter(Boolean) as string[])
const derivableIds = new Set<string>(DERIVABLE_PRINCIPLE_IDS)
const reachable = new Set<string>([...cardPrincipleIds, ...derivableIds])

describe('principle coverage — every principle is reachable in play', () => {
  it('every catalog principle is reachable via a card OR state derivation', () => {
    const unreachable = PRINCIPLES.filter((p) => !reachable.has(p.id)).map((p) => p.id)
    expect(unreachable, `unreachable principles: ${unreachable.join(', ')}`).toEqual([])
  })

  it('DERIVABLE ids all reference real principles', () => {
    for (const id of DERIVABLE_PRINCIPLE_IDS) {
      expect(principleById(id), id).toBeDefined()
    }
  })

  it('derivePlayerPrinciples only emits ids in the DERIVABLE set', () => {
    for (const profile of STARTING_PROFILES) {
      // Build a minimal player from each starting profile's finances.
      const player = {
        id: 'p', name: 'p', color: '#fff', isHuman: true,
        quadrant: 'E' as const, boardTrack: 'rat_race' as const, boardPosition: 0,
        finances: profile.finances,
        anchors: [], turnsStuckInRatRace: 0, positiveCashFlowTurns: 0, bankruptcyCount: 0,
        handCards: [], roundsPlayed: 0, extraDiceTurns: 0, fastTrackDiceChoice: false,
        skipTurns: 0, dreamId: null, cashflowDayIncome: 0, cashflowDayGoal: 0,
        businessesOwned: [], dreamsOwned: [], freeTimeUnits: 0, timeCapacity: 10,
        socialCapital: 0, socialCapitalCap: 10,
      }
      for (const id of derivePlayerPrinciples(player)) {
        expect(derivableIds.has(id), `derived ${id} not in DERIVABLE`).toBe(true)
      }
    }
  })
})
