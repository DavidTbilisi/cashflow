import { useGameStore } from '../../store/gameStore'
import { computeSummary } from '../../domain/services/financialCalc'
import { formatShort } from '../../utils/currency'
import { LineChart } from '../charts/primitives/LineChart'

export function OpponentsStrip() {
  const game = useGameStore((s) => s.game)
  if (!game || game.players.length <= 1) return null

  const others = game.players.filter((_, i) => i !== game.currentPlayerIndex)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {others.map((p, i) => {
        const s = computeSummary(p.finances)
        const history = game.history[p.id] ?? []
        const track = p.boardTrack === 'rat_race' ? 'RR' : 'FT'
        const anchors = p.anchors.filter((a) => a.unlocked).length
        return (
          <div
            key={p.id}
            style={{
              border: '1px solid var(--color-rim)',
              borderRadius: '2px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
            }}
          >
            <span style={{ color: 'var(--color-fog)', minWidth: '20px' }}>P{i + 2}</span>
            <span
              style={{
                color: 'var(--color-mist)',
                minWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.name}
            </span>
            <span style={{ color: 'var(--color-fog)' }}>
              {track} {p.boardPosition}
            </span>
            <span style={{ color: 'var(--color-snow)' }}>NW {formatShort(s.netWorth)}</span>
            <span style={{ color: 'var(--color-mist)' }}>P {formatShort(s.totalPassiveIncome)}</span>
            <span style={{ color: s.monthlyCashFlow >= 0 ? 'var(--color-snow)' : 'var(--color-fog)' }}>
              CF {formatShort(s.monthlyCashFlow)}
            </span>
            <span style={{ color: 'var(--color-fog)' }}>A {anchors}/6</span>
            <span style={{ color: 'var(--color-mist)' }}>{p.quadrant}</span>
            <div style={{ width: '60px', flexShrink: 0 }}>
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
