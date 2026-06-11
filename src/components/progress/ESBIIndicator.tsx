import type { ESBIQuadrant } from '../../domain/entities/types'
import { QUADRANT_LABELS, QUADRANT_COLORS } from '../../domain/rules/quadrantRules'
import { Tooltip } from '../ui/Tooltip'
import { QUADRANT_INFO, InfoContent } from '../ui/conceptInfo'

interface Props {
  quadrant: ESBIQuadrant
  size?: 'sm' | 'lg'
}

export function ESBIIndicator({ quadrant, size = 'sm' }: Props) {
  const color = QUADRANT_COLORS[quadrant]
  const label = QUADRANT_LABELS[quadrant]

  if (size === 'lg') {
    return (
      <Tooltip content={<InfoContent info={QUADRANT_INFO[quadrant]} />}>
        <div className="flex items-center gap-2" style={{ cursor: 'help' }}>
          <span
            className="font-black text-xl px-2.5 py-0.5"
            style={{
              background: color + '1E',
              color,
              border: `1px solid ${color}44`,
              borderRadius: '3px',
            }}
          >
            {quadrant}
          </span>
          <span className="text-sm" style={{ color: 'var(--color-mist)' }}>{label}</span>
        </div>
      </Tooltip>
    )
  }

  return (
    <Tooltip content={<InfoContent info={QUADRANT_INFO[quadrant]} />}>
      <span
        className="font-bold text-[11px] px-1.5 py-0.5"
        style={{
          background: color + '1E',
          color,
          border: `1px solid ${color}38`,
          borderRadius: '2px',
          cursor: 'help',
        }}
      >
        {quadrant}
      </span>
    </Tooltip>
  )
}
