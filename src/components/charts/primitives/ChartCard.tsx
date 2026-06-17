import type { ReactNode } from 'react'

interface Props {
  title: string
  /** Accent colour for the rail + title; defaults to the azure data accent. */
  accent?: string
  children: ReactNode
}

export function ChartCard({ title, accent = 'var(--color-azure)', children }: Props) {
  return (
    <div
      className="arcade-clip-sm"
      style={{
        border: '1px solid var(--color-rim)',
        background: 'var(--color-card)',
        boxShadow: 'inset 0 0 0 1px rgba(7,4,15,0.4)',
      }}
    >
      {/* glowing accent rail — echoes the modal hardware language */}
      <div style={{ height: '2px', background: accent, boxShadow: `0 0 8px ${accent}` }} />
      <div
        className="flex items-center gap-1.5"
        style={{
          borderBottom: '1px solid var(--color-rim)',
          padding: '4px 8px',
          fontFamily: 'var(--font-data)',
          fontSize: '9px',
          color: accent,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        <span aria-hidden style={{ width: '4px', height: '4px', background: accent, boxShadow: `0 0 5px ${accent}` }} />
        {title}
      </div>
      <div style={{ padding: '8px' }}>{children}</div>
    </div>
  )
}
