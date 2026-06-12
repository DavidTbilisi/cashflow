import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
}

export function ChartCard({ title, children }: Props) {
  return (
    <div style={{ border: '1px solid var(--color-rim)', borderRadius: '2px' }}>
      <div
        style={{
          borderBottom: '1px solid var(--color-rim)',
          padding: '4px 8px',
          fontFamily: 'var(--font-data)',
          fontSize: '9px',
          color: 'var(--color-fog)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <div style={{ padding: '8px' }}>{children}</div>
    </div>
  )
}
