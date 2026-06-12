import { useGameStore } from '../../store/gameStore'
import { RAT_RACE_SPACES, FAST_TRACK_SPACES } from '../../domain/data/boardSpaces'
import { formatCurrency } from '../../utils/currency'

export function PositionPanel() {
  const game = useGameStore((s) => s.game)
  if (!game) return null

  const player = game.players[game.currentPlayerIndex]
  const spaces = player.boardTrack === 'rat_race' ? RAT_RACE_SPACES : FAST_TRACK_SPACES
  const len = spaces.length
  const pct = (player.boardPosition / len) * 100
  const track = player.boardTrack === 'rat_race' ? 'RAT RACE' : 'FAST TRACK'
  const currentSpace = spaces[player.boardPosition]

  return (
    <div
      style={{
        border: '1px solid var(--color-rim)',
        borderRadius: '2px',
        padding: '10px 12px',
        fontFamily: 'var(--font-data)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--color-snow)', letterSpacing: '0.05em' }}>
          Pos {player.boardPosition}/{len} · {track}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-mist)' }}>
          {currentSpace?.label || '—'}
        </span>
      </div>
      <div
        style={{
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
            background: 'var(--color-snow)',
            transition: 'width 0.4s',
          }}
        />
      </div>
      {player.boardTrack === 'fast_track' && (
        <div
          style={{
            marginTop: '6px',
            fontSize: '10px',
            color: 'var(--color-fog)',
          }}
        >
          CF Day: {formatCurrency(player.cashflowDayIncome)} · Goal:{' '}
          {formatCurrency(player.cashflowDayGoal)}
        </div>
      )}
    </div>
  )
}
