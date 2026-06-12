import type { PlayerState, PlayerHistoryPoint } from '../../domain/entities/types'
import { AssetClassMix } from './snapshot/AssetClassMix'
import { IncomeMix } from './snapshot/IncomeMix'
import { ExpenseBreakdown } from './snapshot/ExpenseBreakdown'
import { NetWorthTrend } from './trend/NetWorthTrend'
import { PassiveVsExpensesTrend } from './trend/PassiveVsExpensesTrend'

interface Props {
  player: PlayerState
  history: PlayerHistoryPoint[]
}

export function ChartsDashboard({ player, history }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
      <NetWorthTrend history={history} />
      <PassiveVsExpensesTrend history={history} />
      <AssetClassMix player={player} />
      <IncomeMix player={player} />
      <ExpenseBreakdown player={player} />
    </div>
  )
}
