import { useGameStore } from '../../store/gameStore'
import type { TurnLogEntry, TurnLogKind } from '../../domain/entities/types'
import { formatCurrency } from '../../utils/currency'

const KIND_LABEL: Record<TurnLogKind, string> = {
  landing: 'LAND',
  income: 'PAY',
  card: 'CARD',
  charity: 'GIVE',
  purchase: 'BUY',
  penalty: 'HIT',
  fast_track: 'PROMO',
  note: 'NOTE',
}

const KIND_COLOR: Record<TurnLogKind, string> = {
  landing: 'var(--color-fog)',
  income: 'var(--color-seafoam)',
  card: '#a78bfa',
  charity: '#f472b6',
  purchase: 'var(--color-seafoam)',
  penalty: 'var(--color-flame)',
  fast_track: '#facc15',
  note: 'var(--color-fog)',
}

const MONEY_RE = /(\+\$[\d,]+(?:\.\d+)?|-\$[\d,]+(?:\.\d+)?)/g

function formatLogText(text: string) {
  return text.split(MONEY_RE).map((part, i) => {
    if (part.startsWith('+$'))
      return <span key={i} style={{ color: 'var(--color-seafoam)' }}>{part}</span>
    if (part.startsWith('-$'))
      return <span key={i} style={{ color: 'var(--color-flame)' }}>{part}</span>
    return part
  })
}

function EntryRow({ entry }: { entry: TurnLogEntry }) {
  const kindColor = KIND_COLOR[entry.kind]

  return (
    <div
      style={{
        padding: '6px 10px',
        borderBottom: '1px solid var(--color-rim)',
        fontFamily: 'var(--font-data)',
        fontSize: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}
    >
      {/* Row 1: badge · player · turn/round · roll · movement */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: kindColor,
            border: `1px solid ${kindColor}`,
            borderRadius: '2px',
            padding: '0 3px',
            lineHeight: '14px',
            flexShrink: 0,
          }}
        >
          {KIND_LABEL[entry.kind]}
        </span>

        <span style={{ color: 'var(--color-snow)', fontWeight: 600, flexShrink: 0 }}>
          {entry.playerName}
        </span>

        <span style={{ color: 'var(--color-fog)', marginLeft: 'auto', flexShrink: 0 }}>
          R{entry.round} T{entry.turn}
        </span>

        {entry.roll != null && (
          <span style={{ color: 'var(--color-fog)', flexShrink: 0 }}>
            🎲{entry.roll}
          </span>
        )}

        {entry.fromPos != null && entry.toPos != null && (
          <span style={{ color: 'var(--color-fog)', flexShrink: 0 }}>
            {entry.fromPos}→{entry.toPos}
          </span>
        )}

        {entry.cashDelta != null && entry.cashDelta !== 0 && (
          <span
            style={{
              color: entry.cashDelta > 0 ? 'var(--color-seafoam)' : 'var(--color-flame)',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {entry.cashDelta > 0 ? '+' : ''}{formatCurrency(entry.cashDelta)}
          </span>
        )}
      </div>

      {/* Row 2: description text */}
      <div style={{ color: 'var(--color-mist)', lineHeight: '1.4' }}>
        {formatLogText(entry.text)}
      </div>
    </div>
  )
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
          padding: '4px 10px',
          fontFamily: 'var(--font-data)',
          fontSize: '9px',
          color: 'var(--color-fog)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Event Log</span>
        <span>{game.turnLog.length} events</span>
      </div>
      <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
        {entries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
