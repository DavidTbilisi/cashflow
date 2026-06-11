import { useEffect, type RefObject } from 'react'
import { useGameStore } from '../store/gameStore'
import type { BoardRenderer } from './BoardRenderer'
import type { PawnRenderer } from './PawnRenderer'

export function useBoardSync(
  boardRef: RefObject<BoardRenderer | null>,
  pawnRef: RefObject<PawnRenderer | null>,
) {
  useEffect(() => {
    return useGameStore.subscribe(
      (store) => store.game?.players,
      (players) => {
        if (!players || !pawnRef.current) return
        pawnRef.current.syncPlayers(players)
      },
    )
  }, [pawnRef])
}
