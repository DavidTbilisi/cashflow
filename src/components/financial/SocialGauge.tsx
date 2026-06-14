import type { PlayerState } from '../../domain/entities/types'

const QUADRANT_LABEL: Record<string, string> = { E: 'Employee', S: 'Self-Employed', B: 'Business Owner', I: 'Investor' }

// Relationship capital reads as a strength, not a danger — fuller is better,
// so the colour warms up as the network deepens (inverse of the Time gauge).
function socialColor(ratio: number): string {
  if (ratio >= 0.6) return 'var(--color-seafoam)'
  if (ratio >= 0.3) return 'var(--color-honey)'
  return 'var(--color-fog)'
}

interface Props { player: PlayerState }

export function SocialGauge({ player }: Props) {
  const { socialCapital, socialCapitalCap, quadrant } = player
  const ratio = socialCapitalCap > 0 ? Math.min(socialCapital / socialCapitalCap, 1) : 0
  const pct = Math.round(ratio * 100)
  const color = socialColor(ratio)

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-fog)' }}>
          Network
        </span>
        <span className="text-xs font-bold" style={{ color, fontFamily: 'var(--font-data)' }}>
          {socialCapital}/{socialCapitalCap} SC
        </span>
      </div>

      <div className="h-1.5 overflow-hidden" style={{ background: 'var(--color-rim)', borderRadius: '2px' }}>
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, borderRadius: '2px' }}
        />
      </div>

      <div className="mt-1 text-[10px]" style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)' }}>
        {QUADRANT_LABEL[quadrant]} · social capital opens off-market deals
      </div>
    </div>
  )
}
