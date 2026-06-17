import type { PlayerHistoryPoint } from '../../../domain/entities/types'
import { ChartCard } from '../primitives/ChartCard'
import { LineChart } from '../primitives/LineChart'

interface Props { history: PlayerHistoryPoint[] }

export function PassiveVsExpensesTrend({ history }: Props) {
  return (
    <ChartCard title="Passive vs Expenses" accent="var(--color-seafoam)">
      {history.length < 2 ? (
        <p
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: '10px',
            color: 'var(--color-fog)',
            margin: 0,
          }}
        >
          need 2+ turns
        </p>
      ) : (
        <>
          <LineChart
            series={[
              { points: history.map((h) => h.passiveIncome) },
              { points: history.map((h) => h.totalExpenses), dashed: true },
            ]}
          />
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '4px',
              fontFamily: 'var(--font-data)',
              fontSize: '9px',
              color: 'var(--color-fog)',
            }}
          >
            <span>─── passive</span>
            <span>- - - expenses</span>
          </div>
        </>
      )}
    </ChartCard>
  )
}
