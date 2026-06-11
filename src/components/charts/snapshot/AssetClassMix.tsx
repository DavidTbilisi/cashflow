import type { PlayerState } from '../../../domain/entities/types'
import { ChartCard } from '../primitives/ChartCard'
import { BarMeter } from '../primitives/BarMeter'

interface Props { player: PlayerState }

export function AssetClassMix({ player }: Props) {
  const byClass: Record<string, number> = {}
  for (const a of player.finances.assets) {
    byClass[a.assetClass] = (byClass[a.assetClass] ?? 0) + a.currentValue
  }
  const total = player.finances.cashBalance + Object.values(byClass).reduce((s, v) => s + v, 0)
  const bars = [
    { label: 'Cash', value: player.finances.cashBalance, total, color: 'var(--color-seafoam)' },
    ...Object.entries(byClass).map(([cls, val]) => ({
      label: cls.replace(/_/g, ' '),
      value: val,
      total,
      color: 'var(--color-seafoam)',
    })),
  ]
  return (
    <ChartCard title="Asset Mix">
      <BarMeter bars={bars} />
    </ChartCard>
  )
}
