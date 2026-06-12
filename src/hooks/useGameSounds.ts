import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import {
  soundRoll, soundCoin, soundCard, soundBuy,
  soundExpense, soundBad, soundBaby, soundWin, soundFail,
} from '../utils/sound'

type Phase = string | undefined
type Status = string | undefined

export function useGameSounds() {
  const game = useGameStore((s) => s.game)
  const prevPhase = useRef<Phase>(undefined)
  const prevStatus = useRef<Status>(undefined)
  const prevCard = useRef<string | null>(null)
  const prevTurn = useRef<number>(0)

  useEffect(() => {
    if (!game) return

    const phase = game.currentTurnPhase
    const status = game.status
    const cardId = game.activeCard?.id ?? null
    const cardType = game.activeCard?.type

    // game over
    if (status !== prevStatus.current) {
      if (status === 'completed_win') soundWin()
      if (status === 'completed_fail') soundFail()
      prevStatus.current = status
    }

    // dice roll
    if (prevPhase.current === 'idle' && phase === 'rolling') {
      soundRoll()
    }

    // new card appeared
    if (cardId && cardId !== prevCard.current) {
      if (cardType === 'doodad') soundExpense()
      else if (cardType === 'small_deal' || cardType === 'big_deal') soundBuy()
      else if (cardType === 'market') soundCard()
      else if (cardId.startsWith('evt_Baby')) soundBaby()
      else if (cardId.startsWith('evt_Downsized') || cardId.startsWith('evt_Tax') || cardId.startsWith('evt_Lawsuit') || cardId.startsWith('evt_Divorce')) soundBad()
      else soundCard()
    }

    // landed on payday / cashflow_day — detect via turn log
    const lastLog = game.turnLog[game.turnLog.length - 1]
    if (
      game.turn !== prevTurn.current &&
      lastLog?.spaceId &&
      (lastLog.spaceId.includes('payday') || lastLog.spaceId.includes('cashflow'))
    ) {
      soundCoin()
    }

    prevPhase.current = phase
    prevCard.current = cardId
    prevTurn.current = game.turn
  }, [game])
}
