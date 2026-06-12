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
        borderRight: '1px solid var(--color-rim)',
      }}
    >
      {/* Player identity header */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 flex-shrink-0"
        style={{
          borderBottom: '1px solid var(--color-rim)',
          background: 'var(--color-card)',
        }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: player.color, boxShadow: `0 0 5px ${player.color}80` }}
        />
        <span
          className="font-semibold text-sm flex-1"
          style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-ui)' }}
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
