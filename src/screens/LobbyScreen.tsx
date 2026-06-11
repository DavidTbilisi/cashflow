import { useState } from 'react'
import { STARTING_PROFILES, type StartingProfile } from '../domain/data/startingProfiles'
import { DREAMS } from '../domain/data/fastTrack'
import { useGameStore } from '../store/gameStore'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']

interface PlayerSetup {
  name: string
  color: string
  profile: StartingProfile
  dreamId: string
}

interface Props {
  onStart: () => void
}

export function LobbyScreen({ onStart }: Props) {
  const initGame = useGameStore((s) => s.initGame)
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: 'Player 1', color: COLORS[0], profile: STARTING_PROFILES[0], dreamId: DREAMS[0].id },
  ])

  const addPlayer = () => {
    if (players.length >= 4) return
    setPlayers((p) => [
      ...p,
      { name: `Player ${p.length + 1}`, color: COLORS[p.length], profile: STARTING_PROFILES[0], dreamId: DREAMS[p.length % DREAMS.length].id },
    ])
  }

  const removePlayer = (i: number) => setPlayers((p) => p.filter((_, j) => j !== i))

  const updatePlayer = (i: number, patch: Partial<PlayerSetup>) =>
    setPlayers((p) => p.map((pl, j) => (j === i ? { ...pl, ...patch } : pl)))

  const handleStart = () => {
    initGame(players)
    onStart()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
      style={{ background: 'var(--color-ink)' }}
    >
      <div className="text-center">
        <p
          className="text-[10px] tracking-[0.3em] uppercase font-medium mb-2"
          style={{ color: 'var(--color-fog)' }}
        >
          Setup
        </p>
        <h2
          className="text-4xl font-light"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)' }}
        >
          Choose Your Players
        </h2>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md">
        {players.map((p, i) => (
          <div
            key={i}
            className="flex gap-3 items-center p-3"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-rim)',
              borderRadius: '3px',
            }}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: p.color, boxShadow: `0 0 0 2px var(--color-card), 0 0 0 3.5px ${p.color}70` }}
            />
            <input
              value={p.name}
              onChange={(e) => updatePlayer(i, { name: e.target.value })}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{
                color: 'var(--color-snow)',
                borderBottom: '1px solid transparent',
                fontFamily: 'var(--font-ui)',
                paddingBottom: '1px',
              }}
              onFocus={(e) => { e.currentTarget.style.borderBottomColor = 'var(--color-wire)' }}
              onBlur={(e) => { e.currentTarget.style.borderBottomColor = 'transparent' }}
              placeholder="Player name"
            />
            <select
              value={STARTING_PROFILES.indexOf(p.profile)}
              onChange={(e) => updatePlayer(i, { profile: STARTING_PROFILES[+e.target.value] })}
              className="text-xs outline-none px-2 py-1"
              style={{
                background: 'var(--color-paper)',
                color: 'var(--color-mist)',
                border: '1px solid var(--color-rim)',
                borderRadius: '3px',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {STARTING_PROFILES.map((pr, j) => (
                <option key={j} value={j}>{pr.label}</option>
              ))}
            </select>
            <select
              value={p.dreamId}
              onChange={(e) => updatePlayer(i, { dreamId: e.target.value })}
              title="Your Dream on the Fast Track"
              className="text-xs outline-none px-2 py-1"
              style={{
                background: 'var(--color-paper)',
                color: 'var(--color-mist)',
                border: '1px solid var(--color-rim)',
                borderRadius: '3px',
                fontFamily: 'var(--font-ui)',
                maxWidth: '92px',
              }}
            >
              {DREAMS.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            {players.length > 1 && (
              <button
                onClick={() => removePlayer(i)}
                className="text-base leading-none transition-colors"
                style={{ color: 'var(--color-fog)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-flame)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-fog)' }}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {players.length < 4 && (
          <button
            onClick={addPlayer}
            className="w-full py-3 text-xs tracking-widest transition-all"
            style={{
              border: '1px dashed var(--color-rim)',
              color: 'var(--color-fog)',
              borderRadius: '3px',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-wire)'
              e.currentTarget.style.color = 'var(--color-mist)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-rim)'
              e.currentTarget.style.color = 'var(--color-fog)'
            }}
          >
            + Add Player
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
        {STARTING_PROFILES.map((pr) => (
          <div
            key={pr.label}
            className="p-3"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-rim)',
              borderRadius: '3px',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <p
                className="font-semibold text-sm"
                style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-ui)' }}
              >
                {pr.label}
              </p>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5"
                style={{
                  background: 'rgba(200,150,60,0.15)',
                  color: 'var(--color-gold)',
                  border: '1px solid rgba(200,150,60,0.3)',
                  borderRadius: '2px',
                }}
              >
                {pr.quadrant}
              </span>
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--color-fog)' }}
            >
              {pr.description}
            </p>
            <p
              className="text-xs mt-1.5"
              style={{ color: 'var(--color-seafoam)', fontFamily: 'var(--font-data)' }}
            >
              ${pr.finances.incomeSources[0]?.monthlyAmount.toLocaleString()}/mo
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        className="px-14 py-4 font-semibold text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-90 active:scale-[0.98] shadow-lg"
        style={{
          background: 'var(--color-gold)',
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-ui)',
          borderRadius: '3px',
        }}
      >
        Start Game
      </button>
    </div>
  )
}
