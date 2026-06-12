import type { PlayerState, ESBIQuadrant } from '../../../domain/entities/types'
import { ChartCard } from '../primitives/ChartCard'
import { QUADRANT_LABELS } from '../../../domain/rules/quadrantRules'

interface Props { player: PlayerState }

const QUADRANT_ORDER: ESBIQuadrant[] = ['E', 'S', 'B', 'I']

export function ESBISnapshot({ player }: Props) {
  return (
    <ChartCard title="ESBI Quadrant">
      <div style={{ display: 'flex', gap: '4px' }}>
        {QUADRANT_ORDER.map((q) => {
          const active = player.quadrant === q
          return (
            <div
              key={q}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 2px',
                border: `1px solid ${active ? 'var(--color-mist)' : 'var(--color-rim)'}`,
                borderRadius: '2px',
                background: active ? 'var(--color-wire)' : 'transparent',
                fontFamily: 'var(--font-data)',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: active ? 'var(--color-snow)' : 'var(--color-fog)',
                }}
              >
                {q}
              </div>
              <div
                style={{
                  fontSize: '8px',
                  color: active ? 'var(--color-mist)' : 'var(--color-wire)',
                  marginTop: '2px',
                }}
              >
                {QUADRANT_LABELS[q].split(' ')[0]}
              </div>
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}
