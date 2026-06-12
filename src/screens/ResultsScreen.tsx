import type { ReactNode } from 'react'
import { useGameStore } from '../store/gameStore'
import { computeSummary } from '../domain/services/financialCalc'
import { CurrencyDisplay } from '../components/ui/CurrencyDisplay'
import { AnchorProgressBar } from '../components/progress/AnchorProgressBar'
import { ESBIIndicator } from '../components/progress/ESBIIndicator'
import { NetWorthTrend } from '../components/charts/trend/NetWorthTrend'
import { PassiveVsExpensesTrend } from '../components/charts/trend/PassiveVsExpensesTrend'

interface Props { onPlayAgain: () => void }

export function ResultsScreen({ onPlayAgain }: Props) {
  const game = useGameStore((s) => s.game)
  const reset = useGameStore((s) => s.resetGame)

  if (!game) return null

  const winner = game.winnerId ? game.players.find((p) => p.id === game.winnerId) : null
  const isWin = game.status === 'completed_win'

  const handlePlayAgain = () => {
    reset()
    onPlayAgain()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
      style={{ background: 'var(--color-ink)' }}
    >
      <div className="text-center">
        <h1
          className="text-5xl font-light mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-snow)',
          }}
        >
          {isWin ? 'Financial Freedom' : 'Game Over'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-mist)' }}>
          {isWin
            ? `${winner?.name ?? 'A player'} escaped the Rat Race!`
            : game.failureReason}
        </p>
      </div>

      <div className="w-full max-w-lg space-y-3">
        {game.players.map((player) => {
          const summary = computeSummary(player.finances)
          const isWinner = player.id === game.winnerId
          return (
            <div
              key={player.id}
              className="p-4"
              style={{
                background: 'var(--color-card)',
                border: `1px solid ${isWinner ? 'var(--color-mist)' : 'var(--color-rim)'}`,
                borderRadius: '3px',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[9px] font-bold px-1"
                  style={{ color: 'var(--color-mist)', border: '1px solid var(--color-wire)', fontFamily: 'var(--font-data)' }}
                >
                  P{game.players.indexOf(player) + 1}
                </span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-ui)' }}
                >
                  {player.name}
                </span>
                <ESBIIndicator quadrant={player.quadrant} />
                {isWinner && (
                  <span
                    className="ml-auto text-[11px] font-bold tracking-widest uppercase px-2 py-0.5"
                    style={{
                      color: 'var(--color-snow)',
                      background: 'var(--color-wire)',
                      border: '1px solid var(--color-mist)',
                      borderRadius: '2px',
                    }}
                  >
                    Winner
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <StatBox label="Net Worth" value={<CurrencyDisplay amount={summary.netWorth} className="text-xs" />} />
                <StatBox label="Passive /mo" value={<CurrencyDisplay amount={summary.totalPassiveIncome} className="text-xs" />} />
                <StatBox label="Monthly CF" value={<CurrencyDisplay amount={summary.monthlyCashFlow} className="text-xs" />} />
              </div>

              <AnchorProgressBar player={player} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <NetWorthTrend history={game.history[player.id] ?? []} />
                <PassiveVsExpensesTrend history={game.history[player.id] ?? []} />
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={handlePlayAgain}
        className="px-12 py-4 font-semibold text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-90 active:scale-[0.98]"
        style={{
          background: 'var(--color-wire)',
          color: 'var(--color-snow)',
          border: '1px solid var(--color-mist)',
          fontFamily: 'var(--font-ui)',
          borderRadius: '3px',
          cursor: 'pointer',
        }}
      >
        Play Again
      </button>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      className="p-2"
      style={{
        background: 'var(--color-paper)',
        border: '1px solid var(--color-rim)',
        borderRadius: '3px',
      }}
    >
      <p
        className="text-[10px] uppercase tracking-wider mb-0.5"
        style={{ color: 'var(--color-fog)' }}
      >
        {label}
      </p>
      <div>{value}</div>
    </div>
  )
}
