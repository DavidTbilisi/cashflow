import { useGameStore } from '../../store/gameStore'
import { RAT_RACE_SPACES, FAST_TRACK_SPACES } from '../../domain/data/boardSpaces'
import { formatCurrency } from '../../utils/currency'
import type { SpaceType } from '../../domain/entities/types'

const SPACE_EMOJI: Record<SpaceType, string> = {
  payday: '💰',
  opportunity: '🎯',
  doodad: '🛍️',
  market: '📈',
  baby: '👶',
  charity: '❤️',
  downsized: '📉',
  card_draw: '🃏',
  anchor_milestone: '⚓',
  fast_track_entry: '🚀',
  cashflow_day: '🏆',
  dream: '⭐',
  business_investment: '🏢',
  tax_audit: '📋',
  divorce: '💔',
  lawsuit: '⚖️',
  neutral: '·',
}

export function PositionPanel() {
  const game = useGameStore((s) => s.game)
  if (!game) return null

  const player = game.players[game.currentPlayerIndex]
  const isRatRace = player.boardTrack === 'rat_race'
  const spaces = isRatRace ? RAT_RACE_SPACES : FAST_TRACK_SPACES
  const len = spaces.length
  const track = isRatRace ? 'RAT RACE' : 'FAST TRACK'
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
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--color-snow)', letterSpacing: '0.05em' }}>
          {track} · {player.boardPosition}/{len}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-mist)' }}>
          {currentSpace?.label || '—'}
        </span>
      </div>

      {isRatRace ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center' }}>
          {spaces.map((space, i) => {
            const active = i === player.boardPosition
            return (
              <div
                key={i}
                title={`${i}: ${space.label || space.type}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '20px',
                }}
              >
                <span
                  style={{
                    fontSize: space.type === 'neutral' ? '12px' : '16px',
                    lineHeight: '1',
                    opacity: active ? 1 : 0.45,
                  }}
                >
                  {SPACE_EMOJI[space.type] ?? '·'}
                </span>
                <span
                  style={{
                    fontSize: '8px',
                    lineHeight: '1',
                    color: 'var(--color-snow)',
                    visibility: active ? 'visible' : 'hidden',
                    marginTop: '1px',
                  }}
                >
                  ▲
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <>
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
                width: `${(player.boardPosition / len) * 100}%`,
                height: '100%',
                background: 'var(--color-snow)',
                transition: 'width 0.4s',
              }}
            />
          </div>
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
        </>
      )}
    </div>
  )
}
