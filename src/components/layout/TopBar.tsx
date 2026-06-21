import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useDiscoveryStore, discoveredCount } from '../../store/discoveryStore'
import { PRINCIPLES } from '../../domain/data/principles'
import { computeSummary } from '../../domain/services/financialCalc'
import { gameTime } from '../../domain/rules/profitFirst'
import { ESBIIndicator } from '../progress/ESBIIndicator'
import { formatShort } from '../../utils/currency'
import { InfoLabel, TERM_INFO } from '../ui/conceptInfo'


export function TopBar() {
  const game = useGameStore((s) => s.game)
  const setCodex = useUIStore((s) => s.setCodex)
  const discovered = useDiscoveryStore((s) => s.discovered)
  const found = discoveredCount(discovered)
  if (!game) return null

  const current = game.players[game.currentPlayerIndex]
  const summary = computeSummary(current.finances)
  const clock = gameTime(game.round)
  return (
    <div
      className="h-12 flex items-center px-4 gap-4 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, var(--color-card), var(--color-paper))',
        borderBottom: '1px solid var(--color-iris)',
        boxShadow: '0 1px 14px rgba(176,107,255,0.30)',
      }}
    >
      <span
        className="flex items-center gap-1.5 text-[11px] tracking-wide tabular-nums"
        style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)' }}
        title={`Round ${game.round} · Turn ${game.turn}`}
      >
        <span aria-hidden style={{ opacity: 0.7 }}>🗓</span>
        <span>
          Year <span style={{ color: 'var(--color-snow)', fontWeight: 600 }}>{clock.year}</span>
          {' · '}Q<span style={{ color: 'var(--color-snow)', fontWeight: 600 }}>{clock.quarter}</span>
          {' · '}Month <span style={{ color: 'var(--color-snow)', fontWeight: 600 }}>{clock.monthOfYear}</span>
        </span>
      </span>

      <div className="w-px h-4" style={{ background: 'var(--color-rim)' }} />

      <div className="flex gap-1.5">
        {game.players.map((p, i) => {
          const isActive = i === game.currentPlayerIndex
          return (
            <div
              key={p.id}
              className="arcade-clip-sm flex items-center gap-1.5 px-2.5 py-1 text-xs transition-all"
              style={{
                background: isActive ? 'rgba(46,242,166,0.10)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--color-seafoam)' : 'var(--color-rim)'}`,
                boxShadow: isActive ? '0 0 14px rgba(46,242,166,0.35)' : 'none',
                opacity: isActive ? 1 : 0.4,
              }}
            >
              <span
                className="text-[9px] font-bold"
                style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-data)' }}
              >P{i + 1}</span>
              <span style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-ui)' }} className="font-medium">
                {p.name}
              </span>
              <ESBIIndicator quadrant={p.quadrant} />
            </div>
          )
        })}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button
          onClick={() => setCodex(true)}
          className="arcade-clip-sm flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
          title="Open the Wealth Codex — every principle behind the game"
          style={{
            background: 'transparent',
            border: '1px solid var(--color-rim)',
            color: 'var(--color-gold)',
            fontFamily: 'var(--font-ui)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.background = 'rgba(255,201,60,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-rim)'; e.currentTarget.style.background = 'transparent' }}
        >
          <span aria-hidden>📖</span> Codex
          <span style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)', fontWeight: 600 }}>
            {found}/{PRINCIPLES.length}
          </span>
        </button>

        <span className="text-[11px]" style={{ color: 'var(--color-mist)' }}>
          <InfoLabel info={TERM_INFO.netWorth}>Net Worth</InfoLabel>{' '}
          <span
            style={{
              color: 'var(--color-azure)',
              fontFamily: 'var(--font-data)',
              fontWeight: 600,
              textShadow: '0 0 10px rgba(45,226,255,0.55)',
            }}
          >
            {formatShort(summary.netWorth)}
          </span>
        </span>

      </div>
    </div>
  )
}
