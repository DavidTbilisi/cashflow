import type {
  PlayerState,
  GameState,
  FinancialStatement,
  AnchorStatus,
  AnchorId,
  Card,
} from '../domain/entities/types'
import { ALL_BOARD_SPACES } from '../domain/data/boardSpaces'
import { buildDecks } from '../domain/services/cardService'

export const ANCHOR_ORDER: AnchorId[] = ['door', 'scale', 'safe', 'chain', 'engine', 'shield']

export function makeFinances(overrides: Partial<FinancialStatement> = {}): FinancialStatement {
  return {
    cashBalance: 5000,
    incomeSources: [{ id: 'salary', label: 'Salary', monthlyAmount: 4000, isPassive: false }],
    expenseLines: [{ id: 'rent', label: 'Rent', monthlyAmount: 1500, isFixed: true }],
    assets: [],
    liabilities: [],
    numberOfChildren: 0,
    perChildExpense: 0,
    ...overrides,
  }
}

export function makeAnchors(unlocked: AnchorId[] = []): AnchorStatus[] {
  return ANCHOR_ORDER.map((anchorId) => ({
    anchorId,
    unlocked: unlocked.includes(anchorId),
  }))
}

export function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: 'p0',
    name: 'Test',
    color: '#ff0000',
    isHuman: true,
    quadrant: 'E',
    boardTrack: 'rat_race',
    boardPosition: 0,
    finances: makeFinances(),
    anchors: makeAnchors(),
    turnsStuckInRatRace: 0,
    positiveCashFlowTurns: 0,
    bankruptcyCount: 0,
    handCards: [],
    roundsPlayed: 0,
    extraDiceTurns: 0,
    fastTrackDiceChoice: false,
    skipTurns: 0,
    dreamId: null,
    cashflowDayIncome: 0,
    cashflowDayGoal: 0,
    businessesOwned: [],
    dreamsOwned: [],
    ...overrides,
  }
}

export function makeGame(playerOverrides: Partial<PlayerState> = {}, seed = 42): GameState {
  return {
    id: 'test_game',
    status: 'in_progress',
    players: [makePlayer(playerOverrides)],
    currentPlayerIndex: 0,
    currentTurnPhase: 'idle',
    round: 1,
    turn: 1,
    boardSpaces: ALL_BOARD_SPACES,
    drawDecks: buildDecks(seed),
    discardPiles: {},
    activeCard: null,
    activeNECSTAnswers: null,
    pendingPurchase: null,
    marketOffer: null,
    dreamMarkers: {},
    lastDiceRoll: null,
    winnerId: null,
    failureReason: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    rngSeed: seed,
  }
}

export const NECST_CARD: Card = {
  id: 'test_necst',
  type: 'decision_temptation',
  title: 'Venture Opportunity',
  description: 'A business deal.',
  effects: [
    {
      type: 'necst_gate',
      onPass: [{ type: 'cash_gain', amount: 5000 }],
      onFail: [{ type: 'cash_loss', amount: 2000 }],
    },
  ],
}
