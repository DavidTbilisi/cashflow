import { useGameStore } from '../../store/gameStore'
import type { TurnLogEntry } from '../../domain/entities/types'

// Colour +$X green and -$X red; leave bare $X neutral.
const MONEY_RE = /(\+\$[\d,]+(?:\.\d+)?|-\$[\d,]+(?:\.\d+)?)/g

function formatLogText(text: string) {
  const parts = text.split(MONEY_RE)
  return parts.map((part, i) => {
    if (part.startsWith('+$'))
      return <span key={i} style={{ color: 'var(--color-seafoam)' }}>{part}</span>
    if (part.startsWith('-$'))
      return <span key={i} style={{ color: 'var(--color-flame)' }}>{part}</span>
    return part
  })
}

export function TurnLog() {
  const game = useGameStore((s) => s.game)

  if (!game || game.turnLog.length === 0) {
    return (
      <div
        style={{
          border: '1px solid var(--color-rim)',
          borderRadius: '2px',
          padding: '8px 12px',
          fontFamily: 'var(--font-data)',
          fontSize: '10px',
          color: 'var(--color-fog)',
        }}
      >
        No events yet
      </div>
    )
  }

  const entries = [...game.turnLog].reverse()

  return (
    <div style={{ border: '1px solid var(--color-rim)', borderRadius: '2px', overflow: 'hidden' }}>
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
        Event Log
      </div>
      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: '3px 8px',
              borderBottom: '1px solid var(--color-rim)',
              fontFamily: 'var(--font-data)',
              fontSize: '10px',
              color: 'var(--color-mist)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <span style={{ color: 'var(--color-fog)', flexShrink: 0 }}>T{entry.turn}</span>
            <span>{formatLogText(entry.text)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
