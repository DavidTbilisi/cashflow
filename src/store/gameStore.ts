import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { GameState, PlayerState, Card, CardType, BoardSpace, NECSTAnswers, TurnEvent, MarketEvent, PlayerHistoryPoint, TurnLogEntry } from '../domain/entities/types'
import { ALL_BOARD_SPACES } from '../domain/data/boardSpaces'
import { DREAMS, FAST_TRACK_BUSINESSES } from '../domain/data/fastTrack'
import { buildDecks, drawCard } from '../domain/services/cardService'
import { initDice, rollDice, diceCountFor, diceTotal } from '../domain/services/diceService'
import { makeDefaultAnchors, evaluateAnchors } from '../domain/rules/anchorRules'
import { evaluateQuadrant } from '../domain/rules/quadrantRules'
import {
  applyCardEffect,
  computeSummary,
  buyoutIncome,
  takeBankLoan,
  payOffLiability,
  sellAsset,
  scaleDoodadToPlayer,
} from '../domain/services/financialCalc'
import { evaluateWinConditions, canEnterFastTrack } from '../domain/rules/winRules'
import { scoreNECST } from '../domain/rules/necstTest'
import type { StartingProfile } from '../domain/data/startingProfiles'
import { TIME_BASE, TIME_CAPACITY, DOODAD_NEGOTIATE_COST } from '../domain/services/timeService'
import { formatCurrency } from '../utils/currency'
import { saveGame } from '../utils/persistence'

// Forces the result of the next ROLL_DICE (consumed once). Set by the tutorial
// to script deterministic landings, or by dev shortcuts.
let _forcedDice: number[] | null = null

interface GameStore {
  game: GameState | null
  initGame: (players: Array<{ name: string; color: string; profile: StartingProfile; dreamId?: string | null }>, seed?: number) => void
  dispatch: (event: TurnEvent) => void
  /** Spend 2 time units to halve the active Doodad's expense. One use per card. */
  negotiateDoodad: () => void
  /** Fast Track Charity perk: roll a chosen number of dice (1–3). */
  rollDiceWith: (count: number) => void
  resolveCard: (card: Card, accepted: boolean) => void
  resolveNECST: (answers: NECSTAnswers) => void
  // Rulebook interactions:
  chooseDeal: (size: 'small' | 'big') => void
  acceptCharity: () => void
  declineCharity: () => void
  sellMarketAsset: (assetId: string) => void
  passMarket: () => void
  buyPending: () => void
  skipPending: () => void
  takeLoan: (amount: number) => void
  payOffDebt: (liabilityId: string, units?: number) => void
  moveToFastTrack: () => void
  /** Borrow the shortfall and purchase a deal card atomically — logged as one event. */
  borrowAndBuy: (card: Card) => void
  resetGame: () => void
  /** Force the result of the next dice roll (consumed once). Used by the tutorial. */
  forceNextDice: (values: number[]) => void
  // Dev-only debug actions (no-op in production builds):
  debugSetDice: (values: number[]) => void
  debugGiveMoney: (amount: number) => void
  debugForceTrack: (track: 'rat_race' | 'fast_track') => void
}

function makePlayer(
  id: string,
  name: string,
  color: string,
  profile: StartingProfile,
  dreamId: string | null = null,
): PlayerState {
  // Rulebook setup: starting cash = Monthly Cash Flow + Savings.
  const startingCash = computeSummary(profile.finances).monthlyCashFlow + profile.savings
  return {
    id,
    name,
    color,
    isHuman: true,
    quadrant: profile.quadrant,
    boardTrack: 'rat_race',
    boardPosition: 0,
    finances: { ...profile.finances, cashBalance: startingCash },
    anchors: makeDefaultAnchors(),
    turnsStuckInRatRace: 0,
    positiveCashFlowTurns: 0,
    bankruptcyCount: 0,
    handCards: [],
    roundsPlayed: 0,
    extraDiceTurns: 0,
    fastTrackDiceChoice: false,
    skipTurns: 0,
    dreamId,
    cashflowDayIncome: 0,
    cashflowDayGoal: 0,
    businessesOwned: [],
    dreamsOwned: [],
    freeTimeUnits: TIME_BASE[profile.quadrant],
    timeCapacity: TIME_CAPACITY[profile.quadrant],
  }
}

function fresh(state: GameState): GameState {
  return { ...state, updatedAt: new Date().toISOString() }
}

const LOG_CAP = 200
const HISTORY_CAP = 300

function appendLog(state: GameState, entry: TurnLogEntry): GameState {
  const log = [...state.turnLog, entry]
  return { ...state, turnLog: log.length > LOG_CAP ? log.slice(-LOG_CAP) : log }
}

function appendHistory(state: GameState, playerId: string, point: PlayerHistoryPoint): GameState {
  const existing = state.history[playerId] ?? []
  const updated = [...existing, point]
  return {
    ...state,
    history: {
      ...state.history,
      [playerId]: updated.length > HISTORY_CAP ? updated.slice(-HISTORY_CAP) : updated,
    },
  }
}

function setPlayer(state: GameState, idx: number, player: PlayerState): GameState {
  return { ...state, players: state.players.map((p, i) => (i === idx ? player : p)) }
}

/** Move to the end-of-turn check, clearing any open prompts. */
function endCheck(state: GameState): GameState {
  return { ...state, currentTurnPhase: 'end_check', activeCard: null, pendingPurchase: null, marketOffer: null, doodadNegotiated: false }
}

function eventCard(title: string, description: string): Card {
  return { id: `evt_${title}`, type: 'event', title, description, effects: [] }
}

/** Assets on the player matching a Market card's sell offer. */
function matchingSellable(player: PlayerState, ev: MarketEvent) {
  return player.finances.assets
    .filter((a) => (ev.assetName ? a.name === ev.assetName : ev.assetClass ? a.assetClass === ev.assetClass : false))
    .map((a) => ({ assetId: a.id, assetName: a.name, salePrice: ev.salePrice }))
}

function businessTaken(state: GameState, spaceId: string): boolean {
  return state.players.some((p) => p.businessesOwned.includes(spaceId))
}

/** Promote the current player onto the Fast Track with their buyout income. */
function enterFastTrack(state: GameState, idx: number): PlayerState {
  const player = state.players[idx]
  const dayIncome = buyoutIncome(player.finances)
  return {
    ...player,
    boardTrack: 'fast_track',
    boardPosition: 0,
    cashflowDayIncome: dayIncome,
    cashflowDayGoal: dayIncome + 50000,
  }
}

/** Apply movement, collecting Pay Check / CASHFLOW Day income for every tile passed. */
function applyMovement(state: GameState, idx: number): { player: PlayerState; landed: BoardSpace } {
  const player = state.players[idx]
  const steps = diceTotal(state.lastDiceRoll ?? [0])
  const spaces = state.boardSpaces.filter((s) => s.track === player.boardTrack)
  const len = spaces.length
  const payAmount = player.boardTrack === 'fast_track' ? player.cashflowDayIncome : computeSummary(player.finances).monthlyCashFlow

  let cash = player.finances.cashBalance
  for (let k = 1; k <= steps; k++) {
    const tile = spaces[(player.boardPosition + k) % len]
    if (tile.type === 'payday' || tile.type === 'cashflow_day') cash += payAmount
  }
  const newPos = (player.boardPosition + steps) % len
  return {
    player: { ...player, boardPosition: newPos, finances: { ...player.finances, cashBalance: cash } },
    landed: spaces[newPos],
  }
}

/** Decide what happens when the current player lands on `space`. */
function routeLanding(state: GameState, space: BoardSpace): GameState {
  const idx = state.currentPlayerIndex
  const player = state.players[idx]
  const drawFrom = (type: CardType) => {
    const { card, deck } = drawCard(state.drawDecks[type] ?? [], state.discardPiles[type] ?? [])
    return { card, decks: { ...state.drawDecks, [type]: deck } }
  }
  const addToDiscard = (s: GameState, card: Card): GameState => {
    if (card.type === 'event') return s
    const pile = s.discardPiles[card.type] ?? []
    return { ...s, discardPiles: { ...s.discardPiles, [card.type]: [...pile, card] } }
  }

  switch (space.type) {
    case 'payday':
    case 'cashflow_day':
      return endCheck(state) // income already collected during movement

    case 'opportunity':
      return { ...state, currentTurnPhase: 'choose_deal' }

    case 'charity':
      return { ...state, currentTurnPhase: 'charity_prompt' }

    case 'doodad': {
      const { card, decks } = drawFrom('doodad')
      if (!card) return endCheck({ ...state, drawDecks: decks })
      const scaled = scaleDoodadToPlayer(card, player)
      return { ...state, activeCard: scaled, currentTurnPhase: 'action', drawDecks: decks }
    }

    case 'market': {
      const { card, decks } = drawFrom('market')
      if (!card) return endCheck({ ...state, drawDecks: decks })
      const next = { ...state, drawDecks: decks }
      if (card.marketEvent) {
        const offer = matchingSellable(player, card.marketEvent)
        if (offer.length > 0) {
          return { ...next, activeCard: card, marketOffer: offer, currentTurnPhase: 'market_prompt' }
        }
      }
      return { ...next, activeCard: card, currentTurnPhase: 'action' }
    }

    case 'card_draw': {
      const type = space.cardDeckFilter?.[0] ?? 'decision_temptation'
      const { card, decks } = drawFrom(type)
      if (!card) return endCheck({ ...state, drawDecks: decks })
      return { ...state, activeCard: card, currentTurnPhase: 'action', drawDecks: decks }
    }

    case 'baby': {
      const updated = applyCardEffect(player, { type: 'add_child' }, state.turn)
      const at = updated.finances.numberOfChildren
      const msg = at > player.finances.numberOfChildren
        ? `A new arrival! You now have ${at} ${at === 1 ? 'child' : 'children'} — a per-child expense of ${formatCurrency(updated.finances.perChildExpense)}/mo is added.`
        : 'Your family is already at the limit of 3 children — no change.'
      return { ...setPlayer(state, idx, updated), activeCard: eventCard('Baby!', msg), currentTurnPhase: 'action' }
    }

    case 'downsized': {
      const expenses = computeSummary(player.finances).totalMonthlyExpenses
      const updated: PlayerState = {
        ...player,
        finances: { ...player.finances, cashBalance: player.finances.cashBalance - expenses },
        skipTurns: 2,
        extraDiceTurns: 0, // ends the Charity effect
      }
      const msg = `You temporarily lost your job. Pay your total expenses (${formatCurrency(expenses)}) and lose 2 turns.`
      return { ...setPlayer(state, idx, updated), activeCard: eventCard('Downsized!', msg), currentTurnPhase: 'action' }
    }

    case 'fast_track_entry':
      return canEnterFastTrack(player) ? endCheck(setPlayer(state, idx, enterFastTrack(state, idx))) : endCheck(state)

    case 'business_investment': {
      if (businessTaken(state, space.id)) return endCheck(state)
      const biz = FAST_TRACK_BUSINESSES.find((b) => b.id === space.businessId)
      if (!biz) return endCheck(state)
      return {
        ...state,
        pendingPurchase: { kind: 'business', spaceId: space.id, label: biz.label, cost: biz.downPayment, cashFlow: biz.cashFlow },
        currentTurnPhase: 'action',
      }
    }

    case 'dream': {
      const dream = DREAMS.find((d) => d.id === space.dreamId)
      if (!dream || !space.dreamId) return endCheck(state)
      const dreamId = space.dreamId
      const chosenByOther = state.players.some((p, i) => i !== idx && p.dreamId === dreamId)
      const mine = player.dreamId === dreamId

      // Landing on another player's chosen Dream: place a marker, raising their cost by 100%.
      if (chosenByOther && !mine) {
        const markers = { ...state.dreamMarkers, [dreamId]: (state.dreamMarkers[dreamId] ?? 0) + 1 }
        const owner = state.players.find((p) => p.dreamId === dreamId)
        return {
          ...state,
          dreamMarkers: markers,
          activeCard: eventCard(
            dream.label,
            `You landed on ${owner?.name ?? 'another player'}'s Dream and left a marker — their cost to buy it rises by ${formatCurrency(dream.cost)}.`,
          ),
          currentTurnPhase: 'action',
        }
      }

      // Your own (or an unchosen) Dream: buyable, at base cost × (1 + markers left by others).
      const cost = dream.cost * (1 + (state.dreamMarkers[dreamId] ?? 0))
      return {
        ...state,
        pendingPurchase: { kind: 'dream', spaceId: space.id, label: dream.label, cost, cashFlow: 0 },
        currentTurnPhase: 'action',
      }
    }

    case 'tax_audit':
    case 'lawsuit': {
      const loss = Math.floor(player.finances.cashBalance / 2)
      const updated = { ...player, finances: { ...player.finances, cashBalance: player.finances.cashBalance - loss } }
      const title = space.type === 'tax_audit' ? 'Tax Audit' : 'Lawsuit'
      return { ...setPlayer(state, idx, updated), activeCard: eventCard(title, `You lose half your cash on hand: ${formatCurrency(loss)}.`), currentTurnPhase: 'action' }
    }

    case 'divorce': {
      const loss = player.finances.cashBalance
      const updated = { ...player, finances: { ...player.finances, cashBalance: 0 } }
      return { ...setPlayer(state, idx, updated), activeCard: eventCard('Divorce', `You lose all your cash on hand: ${formatCurrency(loss)}.`), currentTurnPhase: 'action' }
    }

    default:
      return endCheck(state)
  }
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    game: null,

    initGame: (players, seed = 12345) => {
      initDice(seed)
      const decks = buildDecks(seed)
      const game: GameState = {
        id: `game_${seed}`,
        status: 'in_progress',
        players: players.map((p, i) => makePlayer(`p${i}`, p.name, p.color, p.profile, p.dreamId ?? null)),
        currentPlayerIndex: 0,
        currentTurnPhase: 'idle',
        round: 1,
        turn: 1,
        boardSpaces: ALL_BOARD_SPACES,
        drawDecks: decks,
        discardPiles: {},
        activeCard: null,
        activeNECSTAnswers: null,
        pendingPurchase: null,
        marketOffer: null,
        dreamMarkers: {},
        lastDiceRoll: null,
        doodadNegotiated: false,
        winnerId: null,
        failureReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rngSeed: seed,
        history: {},
        turnLog: [],
      }
      set({ game })
    },

    dispatch: (event) => {
      const { game } = get()
      if (!game || game.status !== 'in_progress') return
      const idx = game.currentPlayerIndex
      const player = game.players[idx]

      if (event.type === 'ROLL_DICE' && game.currentTurnPhase === 'idle') {
        // Skip a turn (Downsized / Bankruptcy / lose-turn cards) without rolling.
        if (player.skipTurns > 0) {
          let skipped = setPlayer(game, idx, { ...player, skipTurns: player.skipTurns - 1 })
          skipped = appendLog(skipped, {
            id: `log_${game.turn}_skip`,
            turn: game.turn,
            round: game.round,
            playerId: player.id,
            playerName: player.name,
            kind: 'note',
            text: `${player.name} skipped their turn (${player.skipTurns - 1} remaining)`,
          })
          const next = (idx + 1) % skipped.players.length
          set({ game: fresh({ ...skipped, currentPlayerIndex: next, round: next === 0 ? skipped.round + 1 : skipped.round, turn: skipped.turn + 1, currentTurnPhase: 'idle', lastDiceRoll: null }) })
          return
        }
        const roll = _forcedDice ?? rollDice(diceCountFor(player))
        _forcedDice = null
        set({ game: fresh({ ...game, currentTurnPhase: 'rolling', lastDiceRoll: roll }) })
        return
      }

      if (event.type === 'MOVE_COMPLETE' && game.currentTurnPhase === 'rolling') {
        const cashBefore = player.finances.cashBalance
        const fromPos = player.boardPosition
        const { player: moved, landed } = applyMovement(game, idx)
        const cashDelta = moved.finances.cashBalance - cashBefore
        const roll = diceTotal(game.lastDiceRoll ?? [0])
        const afterMove = setPlayer(game, idx, moved)
        let next = routeLanding(afterMove, landed)
        next = appendLog(next, {
          id: `log_${game.turn}_land`,
          turn: game.turn,
          round: game.round,
          playerId: player.id,
          playerName: player.name,
          kind: 'landing',
          spaceId: landed.id,
          fromPos,
          toPos: moved.boardPosition,
          roll,
          cashDelta,
          text: `${player.name} rolled ${roll} → ${landed.label} (pos ${moved.boardPosition})${cashDelta !== 0 ? ` · ${cashDelta > 0 ? '+' : ''}${formatCurrency(cashDelta)}` : ''}`,
        })
        set({ game: fresh(next) })
        return
      }

      if (event.type === 'CARD_RESOLVED' && game.currentTurnPhase === 'action') {
        set({ game: fresh(endCheck(game)) })
        return
      }

      if (event.type === 'END_TURN' && game.currentTurnPhase === 'end_check') {
        let state = { ...game }
        // Evaluate anchors + ESBI quadrant (custom layer) for the player who just acted.
        let acted = evaluateAnchors(state.players[idx], state.turn)
        const prevQuadrant = acted.quadrant
        acted = evaluateQuadrant(acted)
        // Quadrant advance: reset time to the new quadrant's base (systems = more freedom).
        if (acted.quadrant !== prevQuadrant) {
          acted = { ...acted, freeTimeUnits: TIME_BASE[acted.quadrant], timeCapacity: TIME_CAPACITY[acted.quadrant] }
        }
        // Charity's extra die counts down each Rat Race turn.
        if (acted.extraDiceTurns > 0 && acted.boardTrack === 'rat_race') {
          acted = { ...acted, extraDiceTurns: acted.extraDiceTurns - 1 }
        }
        state = setPlayer(state, idx, acted)

        const snap = computeSummary(acted.finances)
        const histPoint: PlayerHistoryPoint = {
          turn: state.turn,
          netWorth: snap.netWorth,
          passiveIncome: snap.totalPassiveIncome,
          totalIncome: snap.totalMonthlyIncome,
          totalExpenses: snap.totalMonthlyExpenses,
          cashFlow: snap.monthlyCashFlow,
          cashBalance: acted.finances.cashBalance,
        }
        state = appendHistory(state, acted.id, histPoint)

        const result = evaluateWinConditions(state)
        if (result.status === 'win') {
          const done = fresh({ ...state, status: 'completed_win', winnerId: result.winnerId, currentTurnPhase: 'idle' })
          set({ game: done }); saveGame(done); return
        }
        if (result.status === 'fail') {
          const done = fresh({ ...state, status: 'completed_fail', failureReason: result.reason, currentTurnPhase: 'idle' })
          set({ game: done }); saveGame(done); return
        }

        const next = (idx + 1) % state.players.length
        const advanced = fresh({
          ...state,
          currentPlayerIndex: next,
          currentTurnPhase: 'idle',
          round: next === 0 ? state.round + 1 : state.round,
          turn: state.turn + 1,
          lastDiceRoll: null,
          activeCard: null,
          pendingPurchase: null,
          marketOffer: null,
        })
        set({ game: advanced }); saveGame(advanced)
        return
      }
    },

    rollDiceWith: (count) => {
      const { game } = get()
      if (!game || game.status !== 'in_progress' || game.currentTurnPhase !== 'idle') return
      const player = game.players[game.currentPlayerIndex]
      if (player.skipTurns > 0) return // skip is handled by ROLL_DICE
      const n = Math.max(1, Math.min(3, Math.round(count)))
      set({ game: fresh({ ...game, currentTurnPhase: 'rolling', lastDiceRoll: rollDice(n) }) })
    },

    resolveCard: (card, accepted) => {
      const { game } = get()
      if (!game || !game.activeCard) return
      const idx = game.currentPlayerIndex
      let state = { ...game }

      if (card.type !== 'event') {
        const pile = state.discardPiles[card.type] ?? []
        state = { ...state, discardPiles: { ...state.discardPiles, [card.type]: [...pile, card] } }
      }

      if (accepted) {
        let player = state.players[idx]
        for (const effect of card.effects) {
          if (effect.type === 'necst_gate') continue // resolved via the NECST modal
          player = applyCardEffect(player, effect, state.turn)
        }
        state = setPlayer(state, idx, player)
      }
      set({ game: fresh(endCheck(state)) })
    },

    resolveNECST: (answers) => {
      const { game } = get()
      if (!game || !game.activeCard) return
      const idx = game.currentPlayerIndex
      const card = game.activeCard
      const discardedPiles = card.type !== 'event'
        ? { ...game.discardPiles, [card.type]: [...(game.discardPiles[card.type] ?? []), card] }
        : game.discardPiles
      const threshold = card.necstPassThreshold ?? 3
      const { passed } = scoreNECST(answers, threshold)

      let player = game.players[idx]
      for (const effect of card.effects) {
        if (effect.type === 'necst_gate') {
          for (const e of passed ? effect.onPass : effect.onFail) {
            player = applyCardEffect(player, e, game.turn)
          }
        }
      }
      set({ game: fresh({ ...endCheck(setPlayer({ ...game, discardPiles: discardedPiles }, idx, player)), activeNECSTAnswers: answers }) })
    },

    chooseDeal: (size) => {
      const { game } = get()
      if (!game || game.currentTurnPhase !== 'choose_deal') return
      const type: CardType = size === 'small' ? 'small_deal' : 'big_deal'
      const { card, deck } = drawCard(game.drawDecks[type] ?? [], game.discardPiles[type] ?? [])
      if (!card) {
        set({ game: fresh(endCheck({ ...game, drawDecks: { ...game.drawDecks, [type]: deck } })) })
        return
      }
      set({ game: fresh({ ...game, activeCard: card, currentTurnPhase: 'action', drawDecks: { ...game.drawDecks, [type]: deck } }) })
    },

    acceptCharity: () => {
      const { game } = get()
      if (!game || game.currentTurnPhase !== 'charity_prompt') return
      const idx = game.currentPlayerIndex
      const player = game.players[idx]
      const tithe = Math.round(computeSummary(player.finances).totalMonthlyIncome * 0.1)
      const updated: PlayerState = {
        ...player,
        finances: { ...player.finances, cashBalance: player.finances.cashBalance - tithe },
        extraDiceTurns: player.boardTrack === 'rat_race' ? 3 : player.extraDiceTurns,
        fastTrackDiceChoice: player.boardTrack === 'fast_track' ? true : player.fastTrackDiceChoice,
      }
      set({ game: fresh(endCheck(setPlayer(game, idx, updated))) })
    },

    declineCharity: () => {
      const { game } = get()
      if (!game || game.currentTurnPhase !== 'charity_prompt') return
      set({ game: fresh(endCheck(game)) })
    },

    sellMarketAsset: (assetId) => {
      const { game } = get()
      if (!game || !game.marketOffer) return
      const idx = game.currentPlayerIndex
      const offer = game.marketOffer.find((o) => o.assetId === assetId)
      if (!offer) return
      const card = game.activeCard
      let state = game
      if (card && card.type !== 'event') {
        const pile = state.discardPiles[card.type] ?? []
        state = { ...state, discardPiles: { ...state.discardPiles, [card.type]: [...pile, card] } }
      }
      const updated = sellAsset(state.players[idx], assetId, offer.salePrice)
      set({ game: fresh(endCheck(setPlayer(state, idx, updated))) })
    },

    passMarket: () => {
      const { game } = get()
      if (!game) return
      const card = game.activeCard
      let state = game
      if (card && card.type !== 'event') {
        const pile = state.discardPiles[card.type] ?? []
        state = { ...state, discardPiles: { ...state.discardPiles, [card.type]: [...pile, card] } }
      }
      set({ game: fresh(endCheck(state)) })
    },

    buyPending: () => {
      const { game } = get()
      if (!game || !game.pendingPurchase) return
      const idx = game.currentPlayerIndex
      const player = game.players[idx]
      const pp = game.pendingPurchase
      if (player.finances.cashBalance < pp.cost) return // not enough cash — UI disables
      let updated: PlayerState
      if (pp.kind === 'business') {
        updated = {
          ...player,
          finances: { ...player.finances, cashBalance: player.finances.cashBalance - pp.cost },
          businessesOwned: [...player.businessesOwned, pp.spaceId],
          cashflowDayIncome: player.cashflowDayIncome + pp.cashFlow,
        }
      } else {
        updated = {
          ...player,
          finances: { ...player.finances, cashBalance: player.finances.cashBalance - pp.cost },
          dreamsOwned: [...player.dreamsOwned, pp.spaceId],
        }
      }
      set({ game: fresh(endCheck(setPlayer(game, idx, updated))) })
    },

    skipPending: () => {
      const { game } = get()
      if (!game) return
      set({ game: fresh(endCheck(game)) })
    },

    takeLoan: (amount) => {
      const { game } = get()
      if (!game) return
      const idx = game.currentPlayerIndex
      const player = game.players[idx]
      if (player.boardTrack !== 'rat_race') return // no borrowing on the Fast Track
      set({ game: fresh(setPlayer(game, idx, takeBankLoan(player, amount))) })
    },

    payOffDebt: (liabilityId, units = 1) => {
      const { game } = get()
      if (!game) return
      const idx = game.currentPlayerIndex
      set({ game: fresh(setPlayer(game, idx, payOffLiability(game.players[idx], liabilityId, units))) })
    },

    moveToFastTrack: () => {
      const { game } = get()
      if (!game || game.currentTurnPhase !== 'idle') return
      const idx = game.currentPlayerIndex
      if (!canEnterFastTrack(game.players[idx])) return
      set({ game: fresh(setPlayer(game, idx, enterFastTrack(game, idx))) })
    },

    borrowAndBuy: (card) => {
      const { game } = get()
      if (!game || !game.activeCard) return
      const idx = game.currentPlayerIndex
      const player = game.players[idx]
      const dealEffect = card.effects.find((e) => e.type === 'acquire_asset')
      if (!dealEffect || dealEffect.type !== 'acquire_asset') return
      const downPayment = dealEffect.asset.purchasePrice - dealEffect.asset.liabilityAmount
      const shortfall = downPayment - player.finances.cashBalance
      if (shortfall <= 0) return
      const borrowAmount = Math.ceil(shortfall / 1000) * 1000

      let state = { ...game }
      if (card.type !== 'event') {
        const pile = state.discardPiles[card.type] ?? []
        state = { ...state, discardPiles: { ...state.discardPiles, [card.type]: [...pile, card] } }
      }

      let updated = takeBankLoan(player, borrowAmount)
      for (const effect of card.effects) {
        if (effect.type === 'necst_gate') continue
        updated = applyCardEffect(updated, effect, state.turn)
      }
      state = setPlayer(state, idx, updated)
      state = appendLog(state, {
        id: `log_${game.turn}_borrow_buy`,
        turn: game.turn,
        round: game.round,
        playerId: player.id,
        playerName: player.name,
        kind: 'purchase',
        cashDelta: -(downPayment),
        text: `T${game.turn} ${player.name} borrowed ${formatCurrency(borrowAmount)} and bought ${card.title}`,
      })
      set({ game: fresh(endCheck(state)) })
    },

    negotiateDoodad: () => {
      const { game } = get()
      if (!game || game.currentTurnPhase !== 'action') return
      if (!game.activeCard || game.activeCard.type !== 'doodad') return
      if (game.activeCard.lifestyleCategory !== 'want') return
      if (game.doodadNegotiated) return
      const idx = game.currentPlayerIndex
      const player = game.players[idx]
      if (player.freeTimeUnits < DOODAD_NEGOTIATE_COST) return

      // Halve every cash_loss effect on the card (ceiling so odd values round up).
      const halved = {
        ...game.activeCard,
        effects: game.activeCard.effects.map((e) =>
          e.type === 'cash_loss' ? { ...e, amount: Math.ceil(e.amount / 2) } : e,
        ),
      }
      const updated: PlayerState = { ...player, freeTimeUnits: player.freeTimeUnits - DOODAD_NEGOTIATE_COST }
      set({ game: fresh(setPlayer({ ...game, activeCard: halved, doodadNegotiated: true }, idx, updated)) })
    },

    resetGame: () => set({ game: null }),

    forceNextDice: (values) => {
      _forcedDice = values
    },

    debugSetDice: (values) => {
      if (!import.meta.env.DEV) return
      _forcedDice = values
    },

    debugGiveMoney: (amount) => {
      if (!import.meta.env.DEV) return
      const { game } = get()
      if (!game) return
      const idx = game.currentPlayerIndex
      const player = game.players[idx]
      const updated = { ...player, finances: { ...player.finances, cashBalance: player.finances.cashBalance + amount } }
      set({ game: fresh(setPlayer(game, idx, updated)) })
    },

    debugForceTrack: (track) => {
      if (!import.meta.env.DEV) return
      const { game } = get()
      if (!game) return
      const idx = game.currentPlayerIndex
      const player = game.players[idx]
      if (track === 'fast_track') {
        set({ game: fresh(setPlayer(game, idx, enterFastTrack(game, idx))) })
      } else {
        set({ game: fresh(setPlayer(game, idx, { ...player, boardTrack: 'rat_race', boardPosition: 0 })) })
      }
    },
  })),
)

export const selectCurrentPlayer = (store: GameStore) =>
  store.game ? store.game.players[store.game.currentPlayerIndex] : null
