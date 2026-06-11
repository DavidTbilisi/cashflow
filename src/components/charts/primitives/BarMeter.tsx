import { formatCurrency } from '../../../utils/currency'

export interface Bar {
  label: string
  value: number
  total: number
  /** Bar fill and value text colour. Defaults to snow/fog. */
  color?: string
}

interface Props {
  bars: Bar[]
}

export function BarMeter({ bars }: Props) {
  if (bars.length === 0) {
    return (
      <p style={{ color: 'var(--color-fog)', fontSize: '10px', fontFamily: 'var(--font-data)', margin: 0 }}>
        —
      </p>
    )
  }

  const maxVal = Math.max(...bars.map((b) => b.total || b.value), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {bars.map((b, i) => {
        const pct = (Math.max(0, b.value) / maxVal) * 100
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
            }}
          >
            <span
              style={{
                width: '70px',
                color: 'var(--color-mist)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {b.label}
            </span>
            <div
              style={{
                flex: 1,
                height: '4px',
                background: 'var(--color-rim)',
                borderRadius: '1px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: b.color ?? 'var(--color-snow)',
                  transition: 'width 0.4s',
                }}
              />
            </div>
            <span style={{ width: '58px', textAlign: 'right', color: b.color ?? 'var(--color-fog)', flexShrink: 0 }}>
              {formatCurrency(b.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
