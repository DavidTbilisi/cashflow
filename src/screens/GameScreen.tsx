import { TopBar } from '../components/layout/TopBar'
import { Sidebar } from '../components/layout/Sidebar'
import { PlayerPanel } from '../components/players/PlayerPanel'
import { CardModal } from '../components/cards/CardModal'
import { NECSTModal } from '../components/cards/NECSTModal'
import { DealChooser, CharityModal, MarketModal, PurchaseModal } from '../components/cards/PromptModals'
import { PositionPanel } from '../components/board/PositionPanel'
import { TurnLog } from '../components/board/TurnLog'
import { ChartsDashboard } from '../components/charts/ChartsDashboard'
import { OpponentsStrip } from '../components/players/OpponentsStrip'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { useGameSounds } from '../hooks/useGameSounds'
import { useShortcutEngine, ShortcutsContext } from '../hooks/useGameShortcuts'
import { ShortcutHelp } from '../components/overlays/ShortcutHelp'

export function GameScreen() {
  const phase = useGameStore((s) => s.game?.currentTurnPhase)
  const activeCard = useGameStore((s) => s.game?.activeCard)
  const pendingPurchase = useGameStore((s) => s.game?.pendingPurchase)
  const game = useGameStore((s) => s.game)
  const modalOpen = useUIStore((s) => s.modalOpen)
  const toggleHelp = useUIStore((s) => s.toggleHelp)

  const necstOpen = modalOpen === 'necst'
  const showDeal = phase === 'choose_deal'
  const showCharity = phase === 'charity_prompt'
  const showMarket = phase === 'market_prompt'
  const showPurchase = !!pendingPurchase && !showMarket
  const showCard = !!activeCard && !showMarket && !showPurchase && !necstOpen

  useGameSounds()
  const shortcuts = useShortcutEngine()

  const player = game ? game.players[game.currentPlayerIndex] : null
  const history = game && player ? (game.history[player.id] ?? []) : []

  return (
    <ShortcutsContext.Provider value={shortcuts}>
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--color-ink)' }}>
        <TopBar />
        <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <Sidebar />
          <main
            className="flex-1 flex flex-col overflow-y-auto"
            style={{
              minWidth: 0,
              minHeight: 0,
              background: 'var(--color-paper)',
              padding: '12px',
              gap: '8px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {player && (
              <>
                <PositionPanel />
                <ChartsDashboard player={player} history={history} />
                <OpponentsStrip />
                <TurnLog />
              </>
            )}
          </main>
          <PlayerPanel />
        </div>

        {showDeal && <DealChooser />}
        {showCharity && <CharityModal />}
        {showMarket && <MarketModal />}
        {showPurchase && <PurchaseModal />}
        {showCard && activeCard && <CardModal card={activeCard} />}
        {necstOpen && <NECSTModal />}

        <ShortcutHelp />
        <button
          onClick={toggleHelp}
          title="Keyboard shortcuts (?)"
          className="fixed bottom-3 right-3 z-40 w-7 h-7 flex items-center justify-center text-sm font-semibold transition-opacity hover:opacity-100 opacity-50"
          style={{ border: '1px solid var(--color-wire)', color: 'var(--color-mist)', borderRadius: '50%', background: 'var(--color-card)', cursor: 'pointer' }}
        >
          ?
        </button>
      </div>
    </ShortcutsContext.Provider>
  )
}
