import { useGameStore } from '../../store/gameStore'
import { computeSummary } from '../../domain/services/financialCalc'
import { formatShort } from '../../utils/currency'
import { gaugeColor } from '../../utils/colors'
import { LineChart } from '../charts/primitives/LineChart'

/** How close a player is to escaping the Rat Race — passive income ÷ expenses, capped at 100%. */
function freedomPct(passive: number, expenses: number): number {
  if (expenses <= 0) return 0
  return Math.min(Math.round((passive / expenses) * 100), 100)
}

export function OpponentsStrip() {
  const game = useGameStore((s) => s.game)
  if (!game || game.players.length <= 1) return null

  // Leader = highest freedom coverage across ALL players, net worth as tie-break.
  // Lets you see at a glance whether you're ahead of the table.
  const ranked = [...game.players]
    .map((p) => {
      const s = computeSummary(p.finances)
      return { id: p.id, freedom: freedomPct(s.totalPassiveIncome, s.totalMonthlyExpenses), netWorth: s.netWorth }
    })
    .sort((a, b) => b.freedom - a.freedom || b.netWorth - a.netWorth)
  const leaderId = ranked[0]?.id

  const others = game.players.filter((_, i) => i !== game.currentPlayerIndex)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em]"
        style={{ color: 'var(--color-fog)' }}
      >
        <span>Standings</span>
        <span style={{ opacity: 0.5 }}>· passive income vs expenses = who escapes first</span>
      </div>
      {others.map((p, i) => {
        const s = computeSummary(p.finances)
        const history = game.history[p.id] ?? []
        const track = p.boardTrack === 'rat_race' ? 'RR' : 'FT'
        const anchors = p.anchors.filter((a) => a.unlocked).length
        const fp = freedomPct(s.totalPassiveIncome, s.totalMonthlyExpenses)
        const isLeader = p.id === leaderId
        return (
          <div
            key={p.id}
            className="arcade-clip-sm"
            title={`${p.name} — Freedom ${fp}% · Net worth ${formatShort(s.netWorth)} · Cash flow ${formatShort(s.monthlyCashFlow)}/mo · Anchors ${anchors}/6`}
            style={{
              border: `1px solid ${isLeader ? 'var(--color-gold)' : 'var(--color-rim)'}`,
              background: isLeader ? 'rgba(255,201,60,0.06)' : 'var(--color-card)',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
            }}
          >
            <span style={{ width: '11px', flexShrink: 0, textAlign: 'center' }} aria-hidden>
              {isLeader ? '👑' : ''}
            </span>
            <span
              aria-hidden
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '9999px',
                background: p.color,
                boxShadow: `0 0 7px ${p.color}`,
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'var(--color-fog)', minWidth: '20px' }}>P{i + 2}</span>
            <span
              style={{
                color: 'var(--color-mist)',
                minWidth: '74px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.name}
            </span>

            {/* Freedom coverage — the headline "who's winning" metric */}
            <div className="flex items-center gap-1.5" style={{ minWidth: '78px' }}>
              <div className="neon-bar" style={{ width: '44px', height: '6px' }}>
                <div
                  className="neon-bar-fill"
                  style={{ width: `${fp}%`, background: gaugeColor(fp), boxShadow: `0 0 6px ${gaugeColor(fp)}` }}
                />
              </div>
              <span style={{ color: gaugeColor(fp), fontWeight: 600 }}>{fp}%</span>
            </div>

            <span style={{ color: 'var(--color-fog)' }} title="Board track & position">
              {track} {p.boardPosition}
            </span>
            <span style={{ color: 'var(--color-snow)' }} title="Net worth">NW {formatShort(s.netWorth)}</span>
            <span style={{ color: 'var(--color-fog)' }} title="Anchors unlocked">⚓{anchors}/6</span>
            <span style={{ color: 'var(--color-mist)' }} title="ESBI quadrant">{p.quadrant}</span>
            <div style={{ width: '54px', flexShrink: 0, marginLeft: 'auto' }} title="Net-worth trend">
              {history.length >= 2 && (
                <LineChart series={[{ points: history.map((h) => h.netWorth) }]} height={20} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
