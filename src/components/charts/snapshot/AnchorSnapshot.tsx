import type { PlayerState } from '../../../domain/entities/types'
import { ChartCard } from '../primitives/ChartCard'
import { AnchorProgressBar } from '../../progress/AnchorProgressBar'

interface Props { player: PlayerState }

export function AnchorSnapshot({ player }: Props) {
  return (
    <ChartCard title="Six Anchors" accent="var(--color-neon)">
      <AnchorProgressBar player={player} />
    </ChartCard>
  )
}
