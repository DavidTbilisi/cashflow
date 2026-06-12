import type { GameState } from '../domain/entities/types'
import type { useGameStore } from '../store/gameStore'
import { computeSummary } from '../domain/services/financialCalc'
import { canEnterFastTrack } from '../domain/rules/winRules'
import { DOODAD_NEGOTIATE_COST } from '../domain/services/timeService'

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for every in-game keyboard shortcut.
//
// `buildActiveShortcuts` returns ONLY the shortcuts that apply to the current
// game state, in priority order. The keydown handler, the on-screen <KbdHint>
// badges, and the `?` help overlay all read from this one list, so a binding is
// declared exactly once and the hints can never drift from the handler.
//
// The consolidated model the player has to learn is tiny:
//   • Enter / Space → the ONE primary action in any context (roll · move · buy ·
//     donate · accept · end turn). Always the most forward action.
//   • Esc           → the ONE dismiss action (pass · decline · skip).
//   • Number keys   → only where a real multi-choice exists (deal / dice count).
//   • F             → optional: move to Fast Track.   N → optional: negotiate.
//   • ?             → toggle this help overlay (handled in the hook).
// ─────────────────────────────────────────────────────────────────────────────

export type ShortcutGroup = 'Turn' | 'Choice' | 'Card' | 'Dev'

export interface ActiveShortcut {
  /** Stable identity so a button can look up its own badge: byId(shortcuts, 'primary'). */
  id: string
  /** Compact label for the on-screen kbd badge, e.g. '↵', 'Esc', '1'. */
  badge: string
  /** Human description shown in the help overlay. */
  description: string
  group: ShortcutGroup
  /** Does this raw keyboard event trigger the shortcut? */
  match: (e: KeyboardEvent) => boolean
  run: () => void
}

/** The store actions the shortcuts invoke — passed in so the builder stays pure-ish. */
export type ShortcutActions = Pick<
  ReturnType<typeof useGameStore.getState>,
  | 'dispatch' | 'rollDiceWith' | 'moveToFastTrack' | 'chooseDeal'
  | 'acceptCharity' | 'declineCharity' | 'passMarket' | 'buyPending'
  | 'skipPending' | 'resolveCard' | 'borrowAndBuy' | 'negotiateDoodad'
  | 'debugSetDice' | 'debugGiveMoney' | 'debugForceTrack'
>

// A shortcut bound to plain key(s) with no Ctrl/Meta/Alt modifier.
const plain = (...keys: string[]) => (e: KeyboardEvent) =>
  !e.ctrlKey && !e.metaKey && !e.altKey && keys.includes(e.key)

export function buildActiveShortcuts(
  game: GameState | null,
  modalOpen: string | null,
  a: ShortcutActions,
): ActiveShortcut[] {
  const list: ActiveShortcut[] = []
  if (!game || game.status !== 'in_progress') return list

  const phase = game.currentTurnPhase
  const player = game.players[game.currentPlayerIndex]
  const activeCard = game.activeCard
  const pendingPurchase = game.pendingPurchase

  const necstOpen = modalOpen === 'necst'
  const showDeal = phase === 'choose_deal'
  const showCharity = phase === 'charity_prompt'
  const showMarket = phase === 'market_prompt'
  const showPurchase = !!pendingPurchase && !showMarket
  const showCard = !!activeCard && !showMarket && !showPurchase && !necstOpen
  const showFastTrackDice =
    phase === 'idle' && player.boardTrack === 'fast_track' && !!player.fastTrackDiceChoice && player.skipTurns === 0

  // The NECST modal owns its own keyboard UI — stay out of its way.
  if (necstOpen) return list

  // ── Modal contexts are exclusive: each returns its own small set ───────────
  if (showDeal) {
    list.push({ id: 'dealSmall', badge: '1', description: 'Draw a Small Deal', group: 'Choice', match: plain('1'), run: () => a.chooseDeal('small') })
    list.push({ id: 'dealBig', badge: '2', description: 'Draw a Big Deal', group: 'Choice', match: plain('2'), run: () => a.chooseDeal('big') })
    return list
  }

  if (showCharity) {
    const tithe = Math.round(computeSummary(player.finances).totalMonthlyIncome * 0.1)
    if (player.finances.cashBalance >= tithe) {
      list.push({ id: 'primary', badge: '↵', description: 'Donate to charity', group: 'Card', match: plain('Enter', ' '), run: a.acceptCharity })
    }
    list.push({ id: 'dismiss', badge: 'Esc', description: 'Decline', group: 'Card', match: plain('Escape'), run: a.declineCharity })
    return list
  }

  if (showMarket) {
    list.push({ id: 'dismiss', badge: 'Esc', description: 'Keep assets · pass', group: 'Card', match: plain('Escape'), run: a.passMarket })
    return list
  }

  if (showPurchase && pendingPurchase) {
    if (player.finances.cashBalance >= pendingPurchase.cost) {
      list.push({ id: 'primary', badge: '↵', description: 'Buy', group: 'Card', match: plain('Enter', ' '), run: a.buyPending })
    }
    list.push({ id: 'dismiss', badge: 'Esc', description: 'Skip', group: 'Card', match: plain('Escape'), run: a.skipPending })
    return list
  }

  if (showCard && activeCard) {
    const isWant = activeCard.type === 'doodad' && activeCard.lifestyleCategory === 'want'
    const dealEffect = activeCard.effects.find((ef) => ef.type === 'acquire_asset')
    const downPayment = dealEffect?.type === 'acquire_asset'
      ? dealEffect.asset.purchasePrice - dealEffect.asset.liabilityAmount
      : 0
    const unaffordable = downPayment > 0 && player.finances.cashBalance < downPayment
    const canDecline = ['asset_acquisition', 'decision_temptation', 'small_deal', 'big_deal'].includes(activeCard.type) || isWant
    const canNegotiate = isWant && !game.doodadNegotiated && (player.freeTimeUnits ?? 0) >= DOODAD_NEGOTIATE_COST

    list.push({
      id: 'primary',
      badge: '↵',
      description: unaffordable ? 'Borrow & buy' : isWant ? 'Spend it' : canDecline ? 'Accept' : 'Continue',
      group: 'Card',
      match: plain('Enter', ' '),
      run: () => (unaffordable ? a.borrowAndBuy(activeCard) : a.resolveCard(activeCard, true)),
    })
    if (canDecline) {
      list.push({ id: 'dismiss', badge: 'Esc', description: isWant ? 'Skip · save it' : 'Pass', group: 'Card', match: plain('Escape'), run: () => a.resolveCard(activeCard, false) })
    }
    if (canNegotiate) {
      list.push({ id: 'negotiate', badge: 'N', description: 'Negotiate this Want', group: 'Card', match: plain('n', 'N'), run: a.negotiateDoodad })
    }
    return list
  }

  // ── No modal: board turn actions ───────────────────────────────────────────
  if (showFastTrackDice) {
    list.push({ id: 'dice1', badge: '1', description: 'Roll 1 die', group: 'Turn', match: plain('1'), run: () => a.rollDiceWith(1) })
    list.push({ id: 'dice2', badge: '2', description: 'Roll 2 dice', group: 'Turn', match: plain('2'), run: () => a.rollDiceWith(2) })
    list.push({ id: 'dice3', badge: '3', description: 'Roll 3 dice', group: 'Turn', match: plain('3'), run: () => a.rollDiceWith(3) })
  } else if (phase === 'idle') {
    list.push({ id: 'primary', badge: '↵', description: player.skipTurns > 0 ? 'Skip turn' : 'Roll', group: 'Turn', match: plain('Enter', ' '), run: () => a.dispatch({ type: 'ROLL_DICE' }) })
  } else if (phase === 'rolling') {
    list.push({ id: 'primary', badge: '↵', description: 'Move pawn', group: 'Turn', match: plain('Enter', ' '), run: () => a.dispatch({ type: 'MOVE_COMPLETE' }) })
  } else if (phase === 'end_check') {
    list.push({ id: 'primary', badge: '↵', description: 'End turn', group: 'Turn', match: plain('Enter', ' '), run: () => a.dispatch({ type: 'END_TURN' }) })
  }

  if (phase === 'idle' && canEnterFastTrack(player)) {
    list.push({ id: 'fastTrack', badge: 'F', description: 'Move to Fast Track', group: 'Turn', match: plain('f', 'F'), run: a.moveToFastTrack })
  }

  // ── Dev-only ───────────────────────────────────────────────────────────────
  if (import.meta.env.DEV) {
    for (const n of [1, 2, 3, 4, 5, 6]) {
      list.push({
        id: `dev-dice-${n}`,
        badge: `⌃${n}`,
        description: `Force next roll = ${n}`,
        group: 'Dev',
        match: (e) => (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === String(n),
        run: () => a.debugSetDice([n]),
      })
    }
    list.push({ id: 'dev-money', badge: '⌃⇧G', description: 'Give $10,000', group: 'Dev', match: (e) => (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'G' || e.key === 'g'), run: () => a.debugGiveMoney(10_000) })
    list.push({ id: 'dev-fast', badge: '⌃⇧F', description: 'Jump to Fast Track', group: 'Dev', match: (e) => (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f'), run: () => a.debugForceTrack('fast_track') })
  }

  return list
}

/** Look up a single active shortcut's badge by id — used by on-screen buttons. */
export function badgeFor(shortcuts: ActiveShortcut[], id: string): string | null {
  return shortcuts.find((s) => s.id === id)?.badge ?? null
}
