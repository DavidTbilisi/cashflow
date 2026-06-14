// ── Core enumerations ──────────────────────────────────────────────────────

export type ESBIQuadrant = 'E' | 'S' | 'B' | 'I'

export type AnchorId = 'door' | 'scale' | 'safe' | 'chain' | 'engine' | 'shield'

export type CardType =
  // ── Rulebook decks ──
  | 'small_deal' // Opportunity: stocks & small real estate (≤ $5,000 entry)
  | 'big_deal' // Opportunity: apartments & businesses (≥ $6,000 entry)
  | 'market' // The Market: buyers for assets + economic events
  | 'doodad' // mandatory one-off expense
  // ── Custom decks (Anchors / ESBI / NECST layer) ──
  | 'income'
  | 'expense_liability'
  | 'asset_acquisition'
  | 'system_building'
  | 'decision_temptation'
  | 'obstacle_challenge'
  | 'network' // Social Capital: build/spend your network for deal access & favors
  | 'event' // synthetic, store-generated notification (Baby, Downsized, Tax Audit…)

export type BoardTrack = 'rat_race' | 'fast_track'

export type SpaceType =
  // ── Rat Race ──
  | 'payday' // Pay Check — collect Monthly Cash Flow on land/pass
  | 'opportunity' // choose a Small Deal or Big Deal
  | 'market' // The Market — sell a matching asset / economic event
  | 'doodad' // mandatory one-off expense
  | 'charity' // optional: 10% of income → extra die for 3 turns
  | 'baby' // +1 child (max 3), adds per-child expense
  | 'downsized' // pay total expenses, lose 2 turns
  | 'card_draw' // custom decks (system-building / decision / NECST)
  | 'anchor_milestone' // custom: Six Anchors checkpoint
  | 'fast_track_entry' // gateway onto the Fast Track
  // ── Fast Track ──
  | 'cashflow_day' // collect CASHFLOW Day income on land/pass
  | 'business_investment' // green: buy a business, add to Day income
  | 'dream' // pink: buy your Dream to win
  | 'tax_audit' // lose ½ cash on hand
  | 'divorce' // lose all cash
  | 'lawsuit' // lose ½ cash on hand
  | 'neutral'

export type TurnPhase =
  | 'idle'
  | 'rolling'
  | 'moving'
  | 'landing'
  | 'choose_deal' // landed on Opportunity — pick Small or Big Deal
  | 'charity_prompt' // landed on Charity — opt in or skip
  | 'market_prompt' // landed on The Market — sell matching assets or pass
  | 'action' // a card / decision modal is open
  | 'end_check'

export type TurnEvent =
  | { type: 'ROLL_DICE' }
  | { type: 'MOVE_COMPLETE' }
  | { type: 'CARD_RESOLVED' }
  | { type: 'NECST_COMPLETE'; passed: boolean }
  | { type: 'END_TURN' }

export interface PlayerHistoryPoint {
  turn: number
  netWorth: number
  passiveIncome: number
  totalIncome: number
  totalExpenses: number
  cashFlow: number
  cashBalance: number
}

export type TurnLogKind = 'landing' | 'income' | 'card' | 'charity' | 'purchase' | 'penalty' | 'fast_track' | 'note'

export interface TurnLogEntry {
  id: string
  turn: number
  round: number
  playerId: string
  playerName: string
  kind: TurnLogKind
  spaceId?: string
  fromPos?: number
  toPos?: number
  roll?: number
  cashDelta?: number
  text: string
}

// ── Asset ─────────────────────────────────────────────────────────────────

export type AssetClass =
  | 'real_estate'
  | 'business'
  | 'stocks'
  | 'bonds'
  | 'commodity'
  | 'intellectual_property'

export interface Asset {
  id: string
  name: string
  assetClass: AssetClass
  purchasePrice: number
  currentValue: number
  monthlyPassiveIncome: number
  monthlyExpense: number
  leverageUsed: boolean
  liabilityAmount: number
  acquiredAtTurn: number
  cardId: string
}

// ── Financial statements ──────────────────────────────────────────────────

export interface IncomeSource {
  id: string
  label: string
  monthlyAmount: number
  isPassive: boolean
  assetId?: string
}

export interface ExpenseLine {
  id: string
  label: string
  monthlyAmount: number
  isFixed: boolean
  liabilityId?: string
  /** Maintenance tied to an asset — removed when the asset is sold. */
  assetId?: string
}

export interface Liability {
  id: string
  label: string
  totalOwed: number
  monthlyPayment: number
  assetId?: string
}

export interface FinancialStatement {
  incomeSources: IncomeSource[]
  expenseLines: ExpenseLine[]
  assets: Asset[]
  liabilities: Liability[]
  cashBalance: number
  /** Children add a recurring per-child expense (rulebook: max 3). */
  numberOfChildren: number
  perChildExpense: number
}

// Computed — never stored directly; produced by financialCalc.ts
export interface FinancialSummary {
  totalMonthlyIncome: number
  totalPassiveIncome: number
  totalMonthlyExpenses: number
  childExpense: number
  monthlyCashFlow: number
  totalAssetValue: number
  totalLiabilities: number
  netWorth: number
  isPassiveIncomePositive: boolean
}

// ── Player ────────────────────────────────────────────────────────────────

export interface AnchorStatus {
  anchorId: AnchorId
  unlocked: boolean
  unlockedAtTurn?: number
}

export interface PlayerState {
  id: string
  name: string
  color: string
  isHuman: boolean
  quadrant: ESBIQuadrant
  boardTrack: BoardTrack
  boardPosition: number
  finances: FinancialStatement
  anchors: AnchorStatus[]
  turnsStuckInRatRace: number
  positiveCashFlowTurns: number  // for 'scale' anchor — needs 3 consecutive turns
  bankruptcyCount: number
  handCards: Card[]
  roundsPlayed: number

  // ── Rulebook mechanics ──
  /** Turns left rolling an extra die from Charity (Rat Race). */
  extraDiceTurns: number
  /** Fast Track Charity: player may choose 1–3 dice for the rest of the game. */
  fastTrackDiceChoice: boolean
  /** Turns to skip (Downsized = 2, Bankruptcy = 3, lose-turn cards). */
  skipTurns: number
  /** The Dream this player is chasing on the Fast Track (pink space id). */
  dreamId: string | null

  // ── Fast Track state (set on entry; rulebook page 5) ──
  /** CASHFLOW Day income = 100 × passive income at entry, grown by businesses. */
  cashflowDayIncome: number
  /** Win target = beginning CASHFLOW Day income + $50,000. */
  cashflowDayGoal: number
  /** Purchased Fast Track business space ids. */
  businessesOwned: string[]
  /** Purchased Dream space ids. */
  dreamsOwned: string[]

  // ── Time as Asset ──
  /** Free hours per month (0–timeCapacity). Spend to negotiate Doodads and unlock advantages. */
  freeTimeUnits: number
  /** Maximum free time — set by quadrant, grows as you advance E→S→B→I. */
  timeCapacity: number

  // ── Social Capital ("your Network") ──
  /** Banked relationship capital. Spend for off-market deal access & favors. */
  socialCapital: number
  /** Cap on banked SC — set by quadrant, widens as you advance E→S→B→I. */
  socialCapitalCap: number
}

// ── Board ─────────────────────────────────────────────────────────────────

export interface BoardSpace {
  id: string
  index: number
  track: BoardTrack
  type: SpaceType
  label: string
  anchorId?: AnchorId
  /** Fast Track 'dream' space → id into DREAMS. */
  dreamId?: string
  /** Fast Track 'business_investment' space → id into FAST_TRACK_BUSINESSES. */
  businessId?: string
  cardDeckFilter?: CardType[]
}

// ── Cards ─────────────────────────────────────────────────────────────────

export interface NECSTAnswers {
  need: boolean
  entry: boolean
  control: boolean
  scale: boolean
  time: boolean
}

export type CardEffect =
  | { type: 'gain_income'; monthlyAmount: number; label: string; isPassive: boolean }
  | { type: 'lose_income'; sourceId: string }
  | { type: 'add_expense'; monthlyAmount: number; label: string; isFixed: boolean }
  | { type: 'remove_expense'; expenseId: string }
  | { type: 'add_liability'; amount: number; monthlyPayment: number; label: string }
  | { type: 'acquire_asset'; asset: Omit<Asset, 'id' | 'acquiredAtTurn'> }
  | { type: 'cash_gain'; amount: number }
  | { type: 'cash_loss'; amount: number }
  | { type: 'quadrant_advance' }
  | { type: 'anchor_unlock'; anchorId: AnchorId }
  | { type: 'fast_track_entry' }
  | { type: 'lose_turn'; turns: number }
  | { type: 'add_child' } // Baby / "Twins!" — +1 child up to the cap
  | { type: 'necst_gate'; onPass: CardEffect[]; onFail: CardEffect[] }
  // ── Social Capital ──
  | { type: 'gain_social'; amount: number; label: string }
  | { type: 'spend_social'; amount: number }
  /** Network gate: if the player can afford `cost` SC, spend it and apply
   *  onAfford; otherwise apply onShort. The social analogue of necst_gate. */
  | { type: 'social_gate'; cost: number; onAfford: CardEffect[]; onShort: CardEffect[] }

/** Payload on a Market card: who can sell what, and for how much. */
export interface MarketEvent {
  /** Sell assets of this class… */
  assetClass?: AssetClass
  /** …or specifically the asset matching this name (e.g. a stock symbol). */
  assetName?: string
  /** Sale price per asset (real estate/business) or per share (stocks). */
  salePrice: number
  /** True when salePrice is per share and applies to the asset's currentValue basis. */
  perShare?: boolean
}

export interface Card {
  id: string
  type: CardType
  title: string
  description: string
  flavorText?: string
  assetTemplate?: Omit<Asset, 'id' | 'acquiredAtTurn' | 'cardId'>
  /** Market cards: what may be sold and for how much. */
  marketEvent?: MarketEvent
  requiresNECST?: boolean
  necstPassThreshold?: number
  effects: CardEffect[]
  lesson?: string
  /** Lifestyle expense sub-category: 'need' = mandatory (no decline); 'want' = discretionary (can be passed). */
  lifestyleCategory?: 'need' | 'want'
}

// ── Game ──────────────────────────────────────────────────────────────────

export type GameStatus =
  | 'setup'
  | 'in_progress'
  | 'paused'
  | 'completed_win'
  | 'completed_fail'

export interface GameState {
  id: string
  status: GameStatus
  players: PlayerState[]
  currentPlayerIndex: number
  currentTurnPhase: TurnPhase
  round: number
  turn: number
  boardSpaces: BoardSpace[]
  drawDecks: Partial<Record<CardType, Card[]>>
  discardPiles: Partial<Record<CardType, Card[]>>
  activeCard: Card | null
  activeNECSTAnswers: NECSTAnswers | null
  /** Fast Track buy prompt (green Business or pink Dream you landed on). */
  pendingPurchase: { kind: 'business' | 'dream'; spaceId: string; label: string; cost: number; cashFlow: number } | null
  /** The Market: assets the current player may sell at the drawn card's price. */
  marketOffer: { assetId: string; assetName: string; salePrice: number }[] | null
  /** Markers left when a player lands on another's chosen Dream — each adds 100% to that Dream's cost. Keyed by dreamId. */
  dreamMarkers: Record<string, number>
  lastDiceRoll: number[] | null
  /** True once the player has already negotiated the active Doodad this turn. */
  doodadNegotiated: boolean
  winnerId: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
  rngSeed: number
  history: Record<string, PlayerHistoryPoint[]>
  turnLog: TurnLogEntry[]
}
