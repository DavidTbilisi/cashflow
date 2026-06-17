import { useGameStore } from '../../store/gameStore'
import { FinancialSheet } from '../financial/FinancialSheet'
import { ESBIIndicator } from '../progress/ESBIIndicator'

export function Sidebar() {
  const game = useGameStore((s) => s.game)
  if (!game) return null

  const player = game.players[game.currentPlayerIndex]

  return (
    <div
      className="flex flex-col overflow-hidden flex-shrink-0"
      style={{
        width: '340px',
        background: 'var(--color-paper)',
        borderRight: '1px solid var(--color-iris)',
        boxShadow: '1px 0 14px rgba(176,107,255,0.22)',
      }}
    >
      {/* Player identity header */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 flex-shrink-0"
        style={{
          borderBottom: '1px solid var(--color-rim)',
          background: 'linear-gradient(180deg, var(--color-card), var(--color-paper))',
        }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 anim-pulse"
          style={{ background: player.color, color: player.color, boxShadow: `0 0 8px ${player.color}` }}
        />
        <span
          className="font-semibold text-sm flex-1 uppercase tracking-wide"
          style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-display)' }}
        >
          {player.name}
        </span>
        <ESBIIndicator quadrant={player.quadrant} />
      </div>

      {/* Scrollable financial sheet */}
      <div className="flex-1 overflow-y-auto">
        <FinancialSheet player={player} />
      </div>
    </div>
  )
}
