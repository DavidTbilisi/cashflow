import { useGameStore } from '../../store/gameStore'
import { computeSummary } from '../../domain/services/financialCalc'
import { ESBIIndicator } from '../progress/ESBIIndicator'
import { formatShort } from '../../utils/currency'
import { InfoLabel, TERM_INFO } from '../ui/conceptInfo'

const PHASE_META: Record<string, { color: string; label: string }> = {
  idle:      { color: '#2DD4BF', label: 'Ready' },
  rolling:   { color: '#5B8FF9', label: 'Rolling' },
  action:    { color: '#F0A050', label: 'Action' },
  end_check: { color: '#C8963C', label: 'End Turn' },
}

export function TopBar() {
  const game = useGameStore((s) => s.game)
  if (!game) return null

  const current = game.players[game.currentPlayerIndex]
  const summary = computeSummary(current.finances)
  const phase = PHASE_META[game.currentTurnPhase] ?? { color: '#8090A8', label: game.currentTurnPhase }

  return (
    <div
      className="h-12 flex items-center px-4 gap-4 flex-shrink-0"
      style={{
        background: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-rim)',
      }}
    >
      <span
        className="text-[11px] tracking-wider tabular-nums"
        style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)' }}
      >
        R{game.round} · T{game.turn}
      </span>

      <div className="w-px h-4" style={{ background: 'var(--color-rim)' }} />

      <div className="flex gap-1.5">
        {game.players.map((p, i) => {
          const isActive = i === game.currentPlayerIndex
          return (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs transition-all"
              style={{
                background: isActive ? p.color + '18' : 'transparent',
                border: `1px solid ${isActive ? p.color + '55' : 'var(--color-rim)'}`,
                borderRadius: '3px',
                opacity: isActive ? 1 : 0.45,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: p.color }}
              />
              <span style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-ui)' }} className="font-medium">
                {p.name}
              </span>
              <ESBIIndicator quadrant={p.quadrant} />
            </div>
          )
        })}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-[11px]" style={{ color: 'var(--color-mist)' }}>
          <InfoLabel info={TERM_INFO.netWorth}>Net Worth</InfoLabel>{' '}
          <span
            style={{
              color: summary.netWorth >= 0 ? 'var(--color-seafoam)' : 'var(--color-flame)',
              fontFamily: 'var(--font-data)',
              fontWeight: 600,
            }}
          >
            {formatShort(summary.netWorth)}
          </span>
        </span>

        <span
          className="px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase"
          style={{
            background: phase.color + '22',
            color: phase.color,
            border: `1px solid ${phase.color}44`,
            borderRadius: '2px',
          }}
        >
          {phase.label}
        </span>
      </div>
    </div>
  )
}
