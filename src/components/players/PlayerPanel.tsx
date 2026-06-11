import { useGameStore } from '../../store/gameStore'
import { ESBIIndicator } from '../progress/ESBIIndicator'
import { computeSummary } from '../../domain/services/financialCalc'
import { canEnterFastTrack } from '../../domain/rules/winRules'
import { formatCurrency } from '../../utils/currency'
import { InfoLabel, TERM_INFO, type ConceptInfo } from '../ui/conceptInfo'

export function PlayerPanel() {
  const game = useGameStore((s) => s.game)
  const dispatch = useGameStore((s) => s.dispatch)
  const rollDiceWith = useGameStore((s) => s.rollDiceWith)
  const takeLoan = useGameStore((s) => s.takeLoan)
  const payOffDebt = useGameStore((s) => s.payOffDebt)
  const moveToFastTrack = useGameStore((s) => s.moveToFastTrack)
  const phase = game?.currentTurnPhase

  if (!game) return null

  const player = game.players[game.currentPlayerIndex]
  const summary = computeSummary(player.finances)
  const onFastTrack = player.boardTrack === 'fast_track'
  const idle = phase === 'idle'

  const canRoll = phase === 'idle'
  const canEndTurn = phase === 'end_check'
  const mustSkip = player.skipTurns > 0
  const canPromote = idle && canEnterFastTrack(player)
  const bankLoan = player.finances.liabilities.find((l) => l.id === 'bank_loan')
  const steps = (game.lastDiceRoll ?? []).reduce((a, b) => a + b, 0)

  return (
    <div
      className="w-52 flex flex-col p-3 gap-4 flex-shrink-0"
      style={{
        background: 'var(--color-paper)',
        borderLeft: '1px solid var(--color-rim)',
      }}
    >
      <div className="pb-3" style={{ borderBottom: '1px solid var(--color-rim)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: player.color, boxShadow: `0 0 6px ${player.color}80` }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: 'var(--color-snow)', fontFamily: 'var(--font-ui)' }}
          >
            {player.name}
          </span>
        </div>
        <ESBIIndicator quadrant={player.quadrant} size="lg" />
        <div className="flex gap-3 mt-2 flex-wrap" style={{ color: 'var(--color-fog)' }}>
          <span className="text-[11px]">
            Track: <span style={{ color: 'var(--color-mist)' }} className="capitalize">
              {player.boardTrack.replace('_', ' ')}
            </span>
          </span>
          <span className="text-[11px]">
            Pos: <span style={{ color: 'var(--color-mist)' }}>{player.boardPosition}</span>
          </span>
        </div>
      </div>

      {game.lastDiceRoll && (
        <div className="flex gap-2 justify-center py-1">
          {game.lastDiceRoll.map((d, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center text-xl font-black shadow-md"
              style={{ background: 'var(--color-snow)', color: 'var(--color-ink)', borderRadius: '3px' }}
            >
              {['⚀','⚁','⚂','⚃','⚄','⚅'][d - 1]}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <StatRow label="Cash" value={formatCurrency(player.finances.cashBalance)} color="var(--color-seafoam)" info={TERM_INFO.cash} />
        <StatRow
          label="Monthly CF"
          value={formatCurrency(summary.monthlyCashFlow)}
          color={summary.monthlyCashFlow >= 0 ? 'var(--color-seafoam)' : 'var(--color-flame)'}
          info={TERM_INFO.cashFlow}
        />
        <StatRow
          label="Passive /mo"
          value={formatCurrency(summary.totalPassiveIncome)}
          color="var(--color-azure)"
          info={TERM_INFO.passiveIncome}
        />
      </div>

      {onFastTrack && (
        <div className="space-y-1.5 pt-2" style={{ borderTop: '1px solid var(--color-rim)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-fog)' }}>
            CASHFLOW Day
          </p>
          <StatRow label="Day income" value={formatCurrency(player.cashflowDayIncome)} color="var(--color-honey)" />
          <StatRow label="Win at" value={formatCurrency(player.cashflowDayGoal)} color="var(--color-gold)" />
          <div className="h-1.5 overflow-hidden" style={{ background: 'var(--color-rim)', borderRadius: '2px' }}>
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${player.cashflowDayGoal > 0 ? Math.min(100, Math.round((player.cashflowDayIncome / player.cashflowDayGoal) * 100)) : 0}%`,
                background: 'var(--color-gold)',
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-auto space-y-2">
        {/* Bank: borrow / repay in $1,000 units (Rat Race only). */}
        {!onFastTrack && (
          <div className="flex gap-1.5">
            <button
              onClick={() => takeLoan(1000)}
              className="flex-1 py-1.5 text-[10px] font-medium tracking-wider uppercase transition-all"
              style={{ border: '1px solid var(--color-wire)', color: 'var(--color-mist)', borderRadius: '3px', background: 'transparent', cursor: 'pointer' }}
            >
              Borrow $1k
            </button>
            <button
              onClick={() => payOffDebt('bank_loan', 1)}
              disabled={!bankLoan || player.finances.cashBalance < 1000}
              className="flex-1 py-1.5 text-[10px] font-medium tracking-wider uppercase transition-all"
              style={{
                border: '1px solid var(--color-wire)',
                color: !bankLoan || player.finances.cashBalance < 1000 ? 'var(--color-fog)' : 'var(--color-mist)',
                borderRadius: '3px',
                background: 'transparent',
                cursor: !bankLoan || player.finances.cashBalance < 1000 ? 'not-allowed' : 'pointer',
              }}
            >
              Repay $1k
            </button>
          </div>
        )}

        {canPromote && (
          <button
            onClick={moveToFastTrack}
            className="w-full py-2 font-semibold text-xs tracking-[0.12em] uppercase transition-all active:scale-[0.98]"
            style={{ background: 'var(--color-gold)', color: 'var(--color-ink)', borderRadius: '3px', border: 'none', cursor: 'pointer' }}
          >
            Move to Fast Track →
          </button>
        )}

        {phase === 'rolling' ? (
          // Step 2 of the turn: the dice are cast, now a dedicated button advances the pawn.
          <button
            onClick={() => dispatch({ type: 'MOVE_COMPLETE' })}
            className="w-full py-3 font-semibold text-xs tracking-[0.12em] uppercase transition-all active:scale-[0.98]"
            style={{
              background: 'var(--color-azure)',
              color: 'var(--color-ink)',
              borderRadius: '3px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {`Move Pawn (${steps}) →`}
          </button>
        ) : canRoll && onFastTrack && player.fastTrackDiceChoice && !mustSkip ? (
          // Fast Track Charity perk: choose 1, 2, or 3 dice this turn.
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase tracking-widest text-center" style={{ color: 'var(--color-fog)' }}>
              Charity · choose your dice
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => rollDiceWith(n)}
                  className="flex-1 py-3 font-bold text-base transition-all active:scale-[0.98]"
                  style={{ background: 'var(--color-seafoam)', color: 'var(--color-ink)', borderRadius: '3px', border: 'none', cursor: 'pointer' }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Step 1 of the turn: roll the dice (or skip / lose a turn).
          <button
            onClick={() => dispatch({ type: 'ROLL_DICE' })}
            disabled={!canRoll}
            className="w-full py-3 font-semibold text-xs tracking-[0.12em] uppercase transition-all active:scale-[0.98]"
            style={{
              background: canRoll ? (mustSkip ? 'var(--color-flame)' : 'var(--color-seafoam)') : 'var(--color-rim)',
              color: canRoll ? 'var(--color-ink)' : 'var(--color-fog)',
              cursor: canRoll ? 'pointer' : 'not-allowed',
              borderRadius: '3px',
              border: 'none',
            }}
          >
            {mustSkip ? `Lose Turn (${player.skipTurns})` : onFastTrack || player.extraDiceTurns > 0 ? 'Roll 2 Dice' : 'Roll Die'}
          </button>
        )}

        <button
          onClick={() => dispatch({ type: 'END_TURN' })}
          disabled={!canEndTurn}
          className="w-full py-2 text-xs font-medium tracking-wider uppercase transition-all"
          style={{
            border: `1px solid ${canEndTurn ? 'var(--color-wire)' : 'var(--color-rim)'}`,
            color: canEndTurn ? 'var(--color-mist)' : 'var(--color-fog)',
            cursor: canEndTurn ? 'pointer' : 'not-allowed',
            borderRadius: '3px',
            background: 'transparent',
          }}
        >
          End Turn
        </button>
      </div>
    </div>
  )
}

function StatRow({ label, value, color, info }: { label: string; value: string; color: string; info?: ConceptInfo }) {
  return (
    <div className="flex justify-between items-center">
      {info ? (
        <InfoLabel info={info} className="text-[11px]" style={{ color: 'var(--color-fog)' }}>{label}</InfoLabel>
      ) : (
        <span className="text-[11px]" style={{ color: 'var(--color-fog)' }}>{label}</span>
      )}
      <span
        className="text-xs font-medium"
        style={{ color, fontFamily: 'var(--font-data)' }}
      >
        {value}
      </span>
    </div>
  )
}
