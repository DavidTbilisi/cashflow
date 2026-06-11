import type { PlayerState } from '../../domain/entities/types'
import { computeSummary } from '../../domain/services/financialCalc'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'

interface Props { player: PlayerState }

export function BalanceSheet({ player }: Props) {
  const { finances } = player
  const summary = computeSummary(finances)

  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-fog)' }}
      >
        Balance Sheet
      </p>

      <div className="grid grid-cols-2 gap-x-3">
        <div>
          <p
            className="text-[10px] font-semibold mb-1 tracking-wider"
            style={{ color: 'var(--color-seafoam)' }}
          >
            Assets
          </p>
          <Row label="Cash" value={finances.cashBalance} />
          {finances.assets.map((a) => (
            <Row key={a.id} label={a.name} value={a.currentValue} />
          ))}
          <TotalRow label="Total" value={summary.totalAssetValue} />
        </div>
        <div>
          <p
            className="text-[10px] font-semibold mb-1 tracking-wider"
            style={{ color: 'var(--color-flame)' }}
          >
            Liabilities
          </p>
          {finances.liabilities.length === 0 ? (
            <p className="text-[11px] italic" style={{ color: 'var(--color-fog)' }}>None</p>
          ) : (
            finances.liabilities.map((l) => (
              <Row key={l.id} label={l.label} value={-l.totalOwed} />
            ))
          )}
          <TotalRow label="Total" value={-summary.totalLiabilities} />
        </div>
      </div>

      <div
        className="mt-2 pt-2 flex justify-between items-center"
        style={{ borderTop: '1px solid var(--color-rim)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--color-snow)' }}>Net Worth</span>
        <CurrencyDisplay amount={summary.netWorth} className="text-xs font-bold" />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-[10px] truncate max-w-[60px]" style={{ color: 'var(--color-fog)' }}>
        {label}
      </span>
      <CurrencyDisplay amount={value} className="text-[10px]" />
    </div>
  )
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="flex justify-between py-0.5 mt-0.5 pt-0.5"
      style={{ borderTop: '1px solid var(--color-rim)' }}
    >
      <span className="text-[10px] font-semibold" style={{ color: 'var(--color-mist)' }}>{label}</span>
      <CurrencyDisplay amount={value} className="text-[10px] font-bold" />
    </div>
  )
}
