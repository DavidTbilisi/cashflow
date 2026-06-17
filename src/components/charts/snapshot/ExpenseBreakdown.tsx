import type { PlayerState } from '../../../domain/entities/types'
import { computeSummary } from '../../../domain/services/financialCalc'
import { ChartCard } from '../primitives/ChartCard'
import { BarMeter } from '../primitives/BarMeter'

interface Props { player: PlayerState }

export function ExpenseBreakdown({ player }: Props) {
  const s = computeSummary(player.finances)
  const bars = [
    ...player.finances.expenseLines.map((e) => ({
      label: e.label,
      value: e.monthlyAmount,
      total: s.totalMonthlyExpenses,
      color: 'var(--color-flame)',
    })),
    ...(s.childExpense > 0
      ? [{ label: 'Children', value: s.childExpense, total: s.totalMonthlyExpenses, color: 'var(--color-flame)' }]
      : []),
  ]
  return (
    <ChartCard title="Expenses" accent="var(--color-flame)">
      <BarMeter bars={bars} />
    </ChartCard>
  )
}
