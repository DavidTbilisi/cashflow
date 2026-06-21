import type { PlayerState } from '../../domain/entities/types'
import { computeSummary } from '../../domain/services/financialCalc'
import { formatCurrency } from '../../utils/currency'
import { gaugeColor } from '../../utils/colors'
import { InfoLabel, TERM_INFO } from '../ui/conceptInfo'

interface Props { player: PlayerState }

export function PassiveIncomeGauge({ player }: Props) {
  const summary = computeSummary(player.finances)
  const ratio = summary.totalMonthlyExpenses > 0
    ? Math.min(summary.totalPassiveIncome / summary.totalMonthlyExpenses, 1)
    : 0
  const pct = Math.round(ratio * 100)
  const free = pct >= 100

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <InfoLabel
          info={TERM_INFO.freedomGauge}
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-fog)' }}
        >
          Freedom Gauge
        </InfoLabel>
        <span
          className="text-xs font-bold"
          style={{
            color: gaugeColor(pct),
            fontFamily: 'var(--font-data)',
            textShadow: `0 0 8px ${gaugeColor(pct)}`,
          }}
        >
          {pct}%
        </span>
      </div>

      <div className="neon-bar h-2" style={{ position: 'relative' }}>
        <div
          className="neon-bar-fill"
          style={{
            width: `${pct}%`,
            background: gaugeColor(pct),
            boxShadow: `0 0 10px ${gaugeColor(pct)}`,
          }}
        />
        {/* Zone tick at 50% — where the gauge turns from "struggling" red to "progress" gold. */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: '-1px',
            bottom: '-1px',
            left: '50%',
            width: '1px',
            background: 'rgba(242,236,255,0.28)',
          }}
        />
      </div>

      <div
        className="flex justify-between text-[10px] mt-1"
        style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)' }}
      >
        <span>{formatCurrency(summary.totalPassiveIncome)}/mo passive</span>
        {free ? (
          <span style={{ color: 'var(--color-seafoam)' }}>{formatCurrency(summary.totalMonthlyExpenses)}/mo needed ✓</span>
        ) : (
          <span title="Extra monthly passive income needed to escape the Rat Race">
            need {formatCurrency(Math.max(summary.totalMonthlyExpenses - summary.totalPassiveIncome, 0))} more/mo
          </span>
        )}
      </div>

      {free && (
        <div
          className="arcade-clip-sm anim-pulse mt-1.5 text-center text-[11px] font-bold uppercase tracking-[0.2em] py-1.5"
          style={{
            background: 'rgba(46,242,166,0.12)',
            color: 'var(--color-seafoam)',
            border: '1px solid var(--color-seafoam)',
            boxShadow: '0 0 16px rgba(46,242,166,0.45), inset 0 0 12px rgba(46,242,166,0.15)',
          }}
        >
          ◆ Financial Freedom ◆
        </div>
      )}
    </div>
  )
}
