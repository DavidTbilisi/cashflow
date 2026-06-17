import type { PlayerState } from '../../../domain/entities/types'
import { computeSummary } from '../../../domain/services/financialCalc'
import { ChartCard } from '../primitives/ChartCard'
import { BarMeter } from '../primitives/BarMeter'

interface Props { player: PlayerState }

export function IncomeMix({ player }: Props) {
  const s = computeSummary(player.finances)
  const active = s.totalMonthlyIncome - s.totalPassiveIncome
  const bars = [
    { label: 'Active', value: active, total: s.totalMonthlyIncome },
    { label: 'Passive', value: s.totalPassiveIncome, total: s.totalMonthlyIncome, color: 'var(--color-seafoam)' },
  ]
  return (
    <ChartCard title="Income Mix" accent="var(--color-seafoam)">
      <BarMeter bars={bars} />
    </ChartCard>
  )
}
