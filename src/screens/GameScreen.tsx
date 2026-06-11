import { TopBar } from '../components/layout/TopBar'
import { Sidebar } from '../components/layout/Sidebar'
import { PlayerPanel } from '../components/players/PlayerPanel'
import { PixiBoardCanvas } from '../board/PixiBoardCanvas'
import { CardModal } from '../components/cards/CardModal'
import { NECSTModal } from '../components/cards/NECSTModal'
import { DealChooser, CharityModal, MarketModal, PurchaseModal } from '../components/cards/PromptModals'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'

export function GameScreen() {
  const phase = useGameStore((s) => s.game?.currentTurnPhase)
  const activeCard = useGameStore((s) => s.game?.activeCard)
  const pendingPurchase = useGameStore((s) => s.game?.pendingPurchase)
  const modalOpen = useUIStore((s) => s.modalOpen)

  const necstOpen = modalOpen === 'necst'
  // One interactive prompt at a time, chosen by the current turn phase.
  const showDeal = phase === 'choose_deal'
  const showCharity = phase === 'charity_prompt'
  const showMarket = phase === 'market_prompt'
  const showPurchase = !!pendingPurchase && !showMarket
  const showCard = !!activeCard && !showMarket && !showPurchase && !necstOpen

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--color-ink)' }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <Sidebar />
        <main
          className="flex-1 flex overflow-hidden"
          style={{
            minWidth: 0,
            minHeight: 0,
            background: 'radial-gradient(ellipse at center, #34261a 0%, #1a1209 72%, #120c06 100%)',
          }}
        >
          <PixiBoardCanvas />
        </main>
        <PlayerPanel />
      </div>

      {showDeal && <DealChooser />}
      {showCharity && <CharityModal />}
      {showMarket && <MarketModal />}
      {showPurchase && <PurchaseModal />}
      {showCard && activeCard && <CardModal card={activeCard} />}
      {necstOpen && <NECSTModal />}
    </div>
  )
}
