import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { useDiscoveryStore } from '../store/discoveryStore'
import { derivePlayerPrinciples } from '../domain/services/principleDiscovery'

/**
 * Watches gameplay and records Wealth-Codex principles as they're *encountered*:
 *  • a principle-bearing card surfaces  → discovered (with a toast)
 *  • your financial state demonstrates one (bank a buffer, advance a quadrant,
 *    borrow against an asset…) → discovered (with a toast)
 *
 * The foundational principles you already embody at kick-off are marked
 * silently on the first pass so the start isn't a wall of toasts.
 */
export function usePrincipleDiscovery() {
  const game = useGameStore((s) => s.game)
  const discover = useDiscoveryStore((s) => s.discover)

  // A card carrying a principle appeared on screen.
  const activePrincipleId = game?.activeCard?.principleId
  useEffect(() => {
    if (activePrincipleId) discover([activePrincipleId])
  }, [activePrincipleId, discover])

  // State-derived principles — re-derive after every game change.
  const firstRunForGame = useRef<string | null>(null)
  useEffect(() => {
    if (!game) return
    const ids = game.players.flatMap(derivePlayerPrinciples)
    if (!ids.length) return
    const silent = firstRunForGame.current !== game.id
    firstRunForGame.current = game.id
    discover(ids, silent)
  }, [game, discover])
}
