import type { PlayerState } from '../../domain/entities/types'

const QUADRANT_LABEL: Record<string, string> = { E: 'Employee', S: 'Self-Employed', B: 'Business Owner', I: 'Investor' }

function timeColor(ratio: number): string {
  if (ratio <= 0.15) return 'var(--color-flame)'
  if (ratio <= 0.4)  return 'var(--color-honey)'
  return 'var(--color-seafoam)'
}

interface Props { player: PlayerState }

export function TimeGauge({ player }: Props) {
  const { freeTimeUnits, timeCapacity, quadrant } = player
  const ratio = timeCapacity > 0 ? Math.min(freeTimeUnits / timeCapacity, 1) : 0
  const pct = Math.round(ratio * 100)
  const color = timeColor(ratio)

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-fog)' }}>
          Free Time
        </span>
        <span className="text-xs font-bold" style={{ color, fontFamily: 'var(--font-data)', textShadow: `0 0 8px ${color}` }}>
          {freeTimeUnits}/{timeCapacity}h
        </span>
      </div>

      <div className="neon-bar h-2">
        <div
          className="neon-bar-fill"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>

      <div className="mt-1 text-[10px]" style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)' }}>
        {QUADRANT_LABEL[quadrant]} · capacity grows as you advance
      </div>
    </div>
  )
}
