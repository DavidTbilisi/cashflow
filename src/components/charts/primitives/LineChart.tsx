interface Series {
  points: number[]
  dashed?: boolean
}

interface Props {
  series: Series[]
  baselineZero?: boolean
  height?: number
}

export function LineChart({ series, baselineZero, height = 80 }: Props) {
  const allPoints = series.flatMap((s) => s.points)
  if (allPoints.length === 0 || series.every((s) => s.points.length < 2)) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-fog)',
          fontFamily: 'var(--font-data)',
          fontSize: '10px',
        }}
      >
        no data
      </div>
    )
  }

  const min = baselineZero ? Math.min(0, ...allPoints) : Math.min(...allPoints)
  const max = Math.max(...allPoints)
  const range = max - min || 1
  const W = 200
  const H = height

  const toX = (i: number, n: number) => (i / (n - 1)) * W
  const toY = (v: number) => H - ((v - min) / range) * (H - 2) - 1

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="none"
    >
      {baselineZero && min < 0 && max > 0 && (
        <line
          x1={0}
          y1={toY(0)}
          x2={W}
          y2={toY(0)}
          stroke="var(--color-wire)"
          strokeWidth={0.5}
        />
      )}
      {series.map((s, si) => {
        if (s.points.length < 2) return null
        const pts = s.points.map((v, i) => `${toX(i, s.points.length)},${toY(v)}`).join(' ')
        return (
          <polyline
            key={si}
            points={pts}
            fill="none"
            stroke={si === 0 ? 'var(--color-snow)' : 'var(--color-mist)'}
            strokeWidth={1}
            strokeDasharray={s.dashed ? '3 3' : undefined}
          />
        )
      })}
    </svg>
  )
}
