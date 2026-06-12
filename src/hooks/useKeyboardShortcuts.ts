import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { canEnterFastTrack } from '../domain/rules/winRules'
import { computeSummary } from '../domain/services/financialCalc'
import { DOODAD_NEGOTIATE_COST } from '../domain/services/timeService'

export function useKeyboardShortcuts() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const rollDiceWith = useGameStore((s) => s.rollDiceWith)
  const moveToFastTrack = useGameStore((s) => s.moveToFastTrack)
  const chooseDeal = useGameStore((s) => s.chooseDeal)
  const acceptCharity = useGameStore((s) => s.acceptCharity)
  const declineCharity = useGameStore((s) => s.declineCharity)
  const passMarket = useGameStore((s) => s.passMarket)
  const buyPending = useGameStore((s) => s.buyPending)
  const skipPending = useGameStore((s) => s.skipPending)
  const resolveCard = useGameStore((s) => s.resolveCard)
  const borrowAndBuy = useGameStore((s) => s.borrowAndBuy)
  const negotiateDoodad = useGameStore((s) => s.negotiateDoodad)
  const debugSetDice = useGameStore((s) => s.debugSetDice)
  const debugGiveMoney = useGameStore((s) => s.debugGiveMoney)
  const debugForceTrack = useGameStore((s) => s.debugForceTrack)
  const modalOpen = useUIStore((s) => s.modalOpen)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (!game || game.status !== 'in_progress') return

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
      const showFastTrackDice = phase === 'idle' && player.boardTrack === 'fast_track' && !!player.fastTrackDiceChoice && player.skipTurns === 0

      const key = e.key
      const ctrl = e.ctrlKey || e.metaKey

      // ── Dev shortcuts ───────────────────────────────────────────────────────
      if (import.meta.env.DEV) {
        if (ctrl && !e.shiftKey && ['1','2','3','4','5','6'].includes(key)) {
          e.preventDefault()
          debugSetDice([parseInt(key)])
          return
        }
        if (ctrl && e.shiftKey && key === 'G') {
          e.preventDefault()
          debugGiveMoney(10_000)
          return
        }
        if (ctrl && e.shiftKey && key === 'F') {
          e.preventDefault()
          debugForceTrack('fast_track')
          return
        }
      }

      if (ctrl) return // don't intercept other ctrl combos

      // ── Modal shortcuts ─────────────────────────────────────────────────────
      if (showDeal) {
        if (key === '1') { e.preventDefault(); chooseDeal('small') }
        else if (key === '2') { e.preventDefault(); chooseDeal('big') }
        return
      }

      if (showCharity) {
        if (key === 'Enter') {
          e.preventDefault()
          const tithe = Math.round(computeSummary(player.finances).totalMonthlyIncome * 0.1)
          if (player.finances.cashBalance >= tithe) acceptCharity()
        } else if (key === 'Escape') { e.preventDefault(); declineCharity() }
        return
      }

      if (showMarket) {
        if (key === 'Escape') { e.preventDefault(); passMarket() }
        return
      }

      if (showPurchase) {
        if (key === 'Enter') {
          e.preventDefault()
          if (player.finances.cashBalance >= pendingPurchase!.cost) buyPending()
        } else if (key === 'Escape') { e.preventDefault(); skipPending() }
        return
      }

      if (showCard && activeCard) {
        const isDoodad = activeCard.type === 'doodad'
        const dealEffect = activeCard.effects.find((ef) => ef.type === 'acquire_asset')
        const downPayment = dealEffect?.type === 'acquire_asset'
          ? dealEffect.asset.purchasePrice - dealEffect.asset.liabilityAmount
          : 0
        const unaffordable = downPayment > 0 && player.finances.cashBalance < downPayment
        const canDecline = ['asset_acquisition', 'decision_temptation', 'small_deal', 'big_deal'].includes(activeCard.type)
        const canNegotiate = isDoodad && !game.doodadNegotiated && (player.freeTimeUnits ?? 0) >= DOODAD_NEGOTIATE_COST

        if (key === 'Enter') {
          e.preventDefault()
          if (unaffordable) borrowAndBuy(activeCard)
          else resolveCard(activeCard, true)
        } else if (key === 'Escape' && canDecline) {
          e.preventDefault()
          resolveCard(activeCard, false)
        } else if (key === 'n' && canNegotiate) {
          e.preventDefault()
          negotiateDoodad()
        }
        return
      }

      // ── Fast Track charity dice choice ─────────────────────────────────────
      if (showFastTrackDice) {
        if (['1','2','3'].includes(key)) {
          e.preventDefault()
          rollDiceWith(parseInt(key))
          return
        }
      }

      // ── Main turn actions ──────────────────────────────────────────────────
      if (key === ' ') {
        e.preventDefault()
        if (phase === 'idle' && !showFastTrackDice) dispatch({ type: 'ROLL_DICE' })
        else if (phase === 'rolling') dispatch({ type: 'MOVE_COMPLETE' })
        return
      }

      if (key === 'Enter') {
        e.preventDefault()
        if (phase === 'rolling') dispatch({ type: 'MOVE_COMPLETE' })
        else if (phase === 'end_check') dispatch({ type: 'END_TURN' })
        return
      }

      if (key === 'f' || key === 'F') {
        if (phase === 'idle' && canEnterFastTrack(player)) {
          e.preventDefault()
          moveToFastTrack()
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    game, modalOpen,
    dispatch, rollDiceWith, moveToFastTrack,
    chooseDeal, acceptCharity, declineCharity,
    passMarket, buyPending, skipPending,
    resolveCard, borrowAndBuy, negotiateDoodad,
    debugSetDice, debugGiveMoney, debugForceTrack,
  ])
}
