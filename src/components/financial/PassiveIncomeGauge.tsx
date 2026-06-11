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
          }}
        >
          {pct}%
        </span>
      </div>

      <div
        className="h-1.5 overflow-hidden"
        style={{ background: 'var(--color-rim)', borderRadius: '2px' }}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: gaugeColor(pct),
            borderRadius: '2px',
          }}
        />
      </div>

      <div
        className="flex justify-between text-[10px] mt-1"
        style={{ color: 'var(--color-fog)', fontFamily: 'var(--font-data)' }}
      >
        <span>{formatCurrency(summary.totalPassiveIncome)}/mo passive</span>
        <span>{formatCurrency(summary.totalMonthlyExpenses)}/mo needed</span>
      </div>

      {free && (
        <div
          className="mt-1.5 text-center text-[11px] font-bold tracking-wider py-1"
          style={{
            background: 'var(--color-wire)',
            color: 'var(--color-snow)',
            border: '1px solid var(--color-mist)',
            borderRadius: '2px',
          }}
        >
          FINANCIAL FREEDOM
        </div>
      )}
    </div>
  )
}
