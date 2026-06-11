import type { ReactNode } from 'react'
import type { PlayerState } from '../../domain/entities/types'
import { computeSummary } from '../../domain/services/financialCalc'
import { CurrencyDisplay } from '../ui/CurrencyDisplay'

interface Props { player: PlayerState }

export function CashFlowStatement({ player }: Props) {
  const { finances } = player
  const summary = computeSummary(finances)

  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-fog)' }}
      >
        Cash Flow
      </p>

      <Section label="Income" color="var(--color-seafoam)">
        {finances.incomeSources.map((s) => (
          <Row key={s.id} label={s.label} value={s.monthlyAmount} passive={s.isPassive} />
        ))}
        <TotalRow label="Total Income" value={summary.totalMonthlyIncome} />
      </Section>

      <Section label="Expenses" color="var(--color-flame)">
        {finances.expenseLines.map((e) => (
          <Row key={e.id} label={e.label} value={-e.monthlyAmount} />
        ))}
        <TotalRow label="Total Expenses" value={-summary.totalMonthlyExpenses} />
      </Section>

      <div
        className="flex justify-between items-center mt-2 pt-2"
        style={{ borderTop: '1px solid var(--color-rim)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--color-snow)' }}>Monthly CF</span>
        <CurrencyDisplay amount={summary.monthlyCashFlow} className="text-sm font-bold" />
      </div>
    </div>
  )
}

function Section({ label, color, children }: { label: string; color: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-semibold mb-1 tracking-wider" style={{ color }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function Row({ label, value, passive }: { label: string; value: number; passive?: boolean }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-[11px] truncate max-w-[90px]" style={{ color: 'var(--color-fog)' }}>
        {label}
        {passive && (
          <span
            className="ml-1 text-[9px] font-bold"
            style={{ color: 'var(--color-seafoam)' }}
          >
            P
          </span>
        )}
      </span>
      <CurrencyDisplay amount={value} className="text-[11px]" />
    </div>
  )
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="flex justify-between py-0.5 mt-0.5 pt-0.5"
      style={{ borderTop: '1px solid var(--color-rim)' }}
    >
      <span className="text-[11px] font-semibold" style={{ color: 'var(--color-mist)' }}>{label}</span>
      <CurrencyDisplay amount={value} className="text-[11px] font-bold" />
    </div>
  )
}
