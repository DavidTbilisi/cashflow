import type { GameState } from '../domain/entities/types'

// ─────────────────────────────────────────────────────────────────────────────
// Guided-playthrough script.
//
// The player starts on PAYDAY (board position 0) in a solo Rat Race game, so a
// single forced die per turn lands them on a known tile every time:
//   pos 0 → roll 2 → pos 2 (Expense)   → roll 1 → pos 3 (Opportunity)
//
// Each step shows a coach card. Steps with a `done(game)` predicate advance
// automatically when the player performs the action; steps without one show a
// button (manual). `forceDice` is queued when the step is entered, so the next
// roll is deterministic. `target` names a [data-tutorial="…"] element to spotlight.
// ─────────────────────────────────────────────────────────────────────────────

export interface TutorialStep {
  id: string
  title: string
  body: string
  /** [data-tutorial="…"] element to ring/spotlight while this step is active. */
  target?: string
  /** Queue a forced dice result when this step becomes active. */
  forceDice?: number[]
  /** Auto-advance when this returns true. Omit → manual step with a button. */
  done?: (game: GameState) => boolean
  /** Manual-step button label (default "Next →"). */
  cta?: string
  /** Muted hint shown on auto-advance steps ("waiting for you to act"). */
  waiting?: string
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CashFlow',
    body: 'This is the Rat Race — the cycle of earning a salary and spending it. Your goal is to build enough passive income to break free. Let\'s walk through one turn together.',
    cta: 'Start',
  },
  {
    id: 'finances',
    title: 'Your financial statement',
    body: 'Here\'s your money at a glance. Cash is what you have on hand. Monthly Cash Flow is your salary plus passive income, minus expenses — what lands in your pocket each Payday.',
    target: 'finances',
    cta: 'Next →',
  },
  {
    id: 'passive',
    title: 'The way out',
    body: 'Passive income is money your assets earn without your effort. The moment your passive income covers your expenses, you escape the Rat Race and reach the Fast Track. That\'s the whole game.',
    target: 'passive',
    cta: 'Next →',
  },
  {
    id: 'roll-expense',
    title: 'Take your turn',
    body: 'Press Space — or click Roll — to roll the die and move. We\'ve set up your first roll to land on an Expense tile.',
    target: 'primary-action',
    forceDice: [2],
    waiting: 'Roll the die to continue',
    done: (g) => g.currentTurnPhase === 'rolling',
  },
  {
    id: 'move-expense',
    title: 'Move your pawn',
    body: 'Press Space again to advance your pawn to the tile you rolled.',
    target: 'primary-action',
    waiting: 'Move your pawn to continue',
    done: (g) => !!g.activeCard || g.currentTurnPhase === 'end_check',
  },
  {
    id: 'expense-card',
    title: 'A lifestyle expense',
    body: 'Expenses are split into Needs (mandatory) and Wants (you can skip them). Every dollar spent here is a dollar that can\'t buy an asset. Resolve the card to continue.',
    waiting: 'Resolve the expense card',
    done: (g) => g.currentTurnPhase === 'end_check',
  },
  {
    id: 'end-turn',
    title: 'End your turn',
    body: 'Each turn ends here. Press Enter or click End Turn to wrap up and start your next turn.',
    target: 'end-turn',
    waiting: 'End your turn to continue',
    done: (g) => g.currentTurnPhase === 'idle' && g.turn >= 2,
  },
  {
    id: 'roll-opportunity',
    title: 'Roll toward an Opportunity',
    body: 'Opportunities are where you build wealth. Roll again — this time you\'ll land on one.',
    target: 'primary-action',
    forceDice: [1],
    waiting: 'Roll the die to continue',
    done: (g) => g.currentTurnPhase === 'rolling',
  },
  {
    id: 'move-opportunity',
    title: 'Move your pawn',
    body: 'Advance your pawn onto the Opportunity tile.',
    target: 'primary-action',
    waiting: 'Move your pawn to continue',
    done: (g) => g.currentTurnPhase === 'choose_deal',
  },
  {
    id: 'choose-deal',
    title: 'Small Deal or Big Deal',
    body: 'Small Deals are cheap entries — stocks and small rentals. Big Deals are larger plays like apartments and businesses. Pick one to see the asset on offer.',
    waiting: 'Choose a deal type',
    done: (g) => g.currentTurnPhase === 'action' && !!g.activeCard,
  },
  {
    id: 'deal-card',
    title: 'Buy income, not liabilities',
    body: 'A good asset adds more passive income each month than it costs you to hold. Accept it if it improves your cash flow — or pass if it doesn\'t. Either way, decide to continue.',
    waiting: 'Resolve the deal',
    done: (g) => g.currentTurnPhase === 'end_check',
  },
  {
    id: 'wrap-up',
    title: 'You\'ve got the loop',
    body: 'Roll, move, resolve, repeat — buying assets until your passive income covers your expenses. Then it\'s on to the Fast Track. The rest is yours to play. Good luck!',
    cta: 'Finish & keep playing',
  },
]
