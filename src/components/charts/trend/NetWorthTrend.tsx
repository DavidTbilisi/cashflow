import type { PlayerHistoryPoint } from '../../../domain/entities/types'
import { formatShort } from '../../../utils/currency'
import { ChartCard } from '../primitives/ChartCard'
import { LineChart } from '../primitives/LineChart'

interface Props { history: PlayerHistoryPoint[] }

export function NetWorthTrend({ history }: Props) {
  return (
    <ChartCard title="Net Worth Trend" accent="var(--color-azure)">
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
          <LineChart series={[{ points: history.map((h) => h.netWorth) }]} baselineZero />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '4px',
              fontFamily: 'var(--font-data)',
              fontSize: '9px',
              color: 'var(--color-fog)',
            }}
          >
            <span>T{history[0].turn}</span>
            <span style={{ color: 'var(--color-mist)' }}>
              {formatShort(history[history.length - 1].netWorth)}
            </span>
            <span>T{history[history.length - 1].turn}</span>
          </div>
        </>
      )}
    </ChartCard>
  )
}
