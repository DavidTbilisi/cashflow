import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { buildActiveShortcuts, badgeFor, type ActiveShortcut, type ShortcutActions } from './gameShortcuts'

// Computed once in GameScreen, shared down so buttons render the SAME badges the
// handler acts on. Default [] keeps standalone renders (tests) safe.
export const ShortcutsContext = createContext<ActiveShortcut[]>([])

/** All active shortcuts for the current context (help overlay reads this). */
export const useActiveShortcuts = () => useContext(ShortcutsContext)

/** A single button's badge, or null when that action isn't currently bound. */
export const useShortcutBadge = (id: string) => badgeFor(useContext(ShortcutsContext), id)

/**
 * Installs the global keydown handler and returns the active shortcut list.
 * Call ONCE (in GameScreen) and feed the result into ShortcutsContext.Provider.
 */
export function useShortcutEngine(): ActiveShortcut[] {
  const game = useGameStore((s) => s.game)
  const modalOpen = useUIStore((s) => s.modalOpen)
  const toggleHelp = useUIStore((s) => s.toggleHelp)
  const setHelp = useUIStore((s) => s.setHelp)
  const helpOpen = useUIStore((s) => s.helpOpen)

  // Store actions are stable identities — grab them once.
  const actions = useMemo<ShortcutActions>(() => {
    const s = useGameStore.getState()
    return {
      dispatch: s.dispatch,
      rollDiceWith: s.rollDiceWith,
      moveToFastTrack: s.moveToFastTrack,
      chooseDeal: s.chooseDeal,
      acceptCharity: s.acceptCharity,
      declineCharity: s.declineCharity,
      passMarket: s.passMarket,
      buyPending: s.buyPending,
      skipPending: s.skipPending,
      resolveCard: s.resolveCard,
      borrowAndBuy: s.borrowAndBuy,
      negotiateDoodad: s.negotiateDoodad,
      debugSetDice: s.debugSetDice,
      debugGiveMoney: s.debugGiveMoney,
      debugForceTrack: s.debugForceTrack,
    }
  }, [])

  const shortcuts = useMemo(() => buildActiveShortcuts(game, modalOpen, actions), [game, modalOpen, actions])

  // The handler reads the latest list/help-state via refs so it installs once.
  const listRef = useRef(shortcuts)
  listRef.current = shortcuts
  const helpRef = useRef(helpOpen)
  helpRef.current = helpOpen

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // '?' toggles the help overlay from anywhere.
      if (e.key === '?') {
        e.preventDefault()
        toggleHelp()
        return
      }
      // While help is open it swallows game keys; Esc closes it.
      if (helpRef.current) {
        if (e.key === 'Escape') {
          e.preventDefault()
          setHelp(false)
        }
        return
      }

      const match = listRef.current.find((s) => s.match(e))
      if (match) {
        e.preventDefault()
        match.run()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleHelp, setHelp])

  return shortcuts
}
