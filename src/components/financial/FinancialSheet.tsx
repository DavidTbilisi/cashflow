import type { ReactNode } from 'react'
import type { PlayerState } from '../../domain/entities/types'
import { computeSummary } from '../../domain/services/financialCalc'
import { formatCurrency } from '../../utils/currency'
import { useGameStore } from '../../store/gameStore'
import { AnchorProgressBar } from '../progress/AnchorProgressBar'
import { PassiveIncomeGauge } from './PassiveIncomeGauge'
import { InfoLabel, TERM_INFO, type ConceptInfo } from '../ui/conceptInfo'

interface Props { player: PlayerState }

export function FinancialSheet({ player }: Props) {
  const { finances } = player
  const s = computeSummary(finances)
  const payOffDebt = useGameStore((st) => st.payOffDebt)
  const currentId = useGameStore((st) => (st.game ? st.game.players[st.game.currentPlayerIndex].id : null))
  const isCurrent = currentId === player.id

  return (
    <div className="flex flex-col gap-0 text-xs" style={{ color: 'var(--color-snow)' }}>

      {/* INCOME */}
      <Section label="Income" color="var(--color-seafoam)" info={TERM_INFO.income}>
        <TableHeader left="Source" right="Cash Flow/mo" />
        {finances.incomeSources.map((src) => (
          <TableRow
            key={src.id}
            left={
              <span>
                {src.label}
                {src.isPassive && (
                  <span
                    className="ml-1.5 text-[9px] font-bold px-1 py-px"
                    style={{ background: 'rgba(45,212,191,0.15)', color: 'var(--color-seafoam)', borderRadius: '2px' }}
                  >
                    PASSIVE
                  </span>
                )}
              </span>
            }
            right={<Num value={src.monthlyAmount} />}
          />
        ))}
        <TotalRow left="Total Income" right={<Num value={s.totalMonthlyIncome} bold />} />
      </Section>

      {/* EXPENSES */}
      <Section label="Expenses" color="var(--color-flame)" info={TERM_INFO.expenses}>
        <TableHeader left="Item" right="Amount/mo" />
        {finances.expenseLines.map((e) => (
          <TableRow key={e.id} left={e.label} right={<Num value={-e.monthlyAmount} />} />
        ))}
        <TotalRow left="Total Expenses" right={<Num value={-s.totalMonthlyExpenses} bold />} />
      </Section>

      {/* CASHFLOW SUMMARY */}
      <div
        className="mx-3 my-3 p-3"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-wire)',
          borderRadius: '3px',
        }}
      >
        <SummaryRow label="Cash on Hand" value={formatCurrency(finances.cashBalance)} bold color="var(--color-snow)" info={TERM_INFO.cash} />
        <SummaryRow label="Total Income" value={formatCurrency(s.totalMonthlyIncome)} color="var(--color-seafoam)" />
        <SummaryRow label="Total Expenses" value={formatCurrency(-s.totalMonthlyExpenses)} color="var(--color-flame)" />
        <div className="mt-1.5 pt-1.5" style={{ borderTop: '1px solid var(--color-wire)' }}>
          <SummaryRow label="Payday / Monthly CF" value={formatCurrency(s.monthlyCashFlow)} bold color={s.monthlyCashFlow >= 0 ? 'var(--color-seafoam)' : 'var(--color-flame)'} info={TERM_INFO.cashFlow} />
        </div>
      </div>

      {/* ASSETS + LIABILITIES side by side */}
      <div className="flex" style={{ borderTop: '1px solid var(--color-rim)' }}>
        {/* Assets */}
        <div className="flex-1" style={{ borderRight: '1px solid var(--color-rim)' }}>
          <div
            className="px-3 py-1.5 flex items-center gap-2"
            style={{ background: 'rgba(45,212,191,0.06)', borderBottom: '1px solid var(--color-rim)' }}
          >
            <InfoLabel
              info={TERM_INFO.assets}
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-seafoam)' }}
            >
              Assets
            </InfoLabel>
          </div>
          <div className="px-3 py-2">
            <ALHeader left="Item" right="Value" />
            <ALRow label="Cash" value={<Num value={finances.cashBalance} />} />
            {finances.assets.map((a) => (
              <ALRow
                key={a.id}
                label={a.name}
                value={<Num value={a.currentValue} />}
                sub={`+${formatCurrency(a.monthlyPassiveIncome)}/mo`}
              />
            ))}
            {finances.assets.length === 0 && (
              <p className="text-[10px] italic py-1" style={{ color: 'var(--color-fog)' }}>None yet</p>
            )}
            <ALTotal label="Total Assets" value={<Num value={s.totalAssetValue} bold />} />
          </div>
        </div>

        {/* Liabilities */}
        <div className="flex-1">
          <div
            className="px-3 py-1.5 flex items-center gap-2"
            style={{ background: 'rgba(240,96,112,0.06)', borderBottom: '1px solid var(--color-rim)' }}
          >
            <InfoLabel
              info={TERM_INFO.liabilities}
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-flame)' }}
            >
              Liabilities
            </InfoLabel>
          </div>
          <div className="px-3 py-2">
            <ALHeader left="Item" right="Owed" />
            {finances.liabilities.length === 0 ? (
              <p className="text-[10px] italic py-1" style={{ color: 'var(--color-fog)' }}>None</p>
            ) : (
              finances.liabilities.map((l) => {
                const isBankLoan = l.id === 'bank_loan'
                const cost = isBankLoan ? 1000 : l.totalOwed
                const canPay = isCurrent && finances.cashBalance >= cost
                return (
                  <div key={l.id} className="py-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] truncate max-w-[78px]" style={{ color: 'var(--color-mist)' }}>{l.label}</span>
                      <Num value={-l.totalOwed} />
                    </div>
                    {canPay && (
                      <button
                        onClick={() => payOffDebt(l.id, 1)}
                        className="text-[9px] mt-0.5 px-1.5 py-px transition-opacity hover:opacity-80"
                        style={{ color: 'var(--color-seafoam)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}
                      >
                        {isBankLoan ? 'Repay $1k' : `Pay off ${formatCurrency(l.totalOwed)}`}
                      </button>
                    )}
                  </div>
                )
              })
            )}
            <ALTotal label="Total Liabilities" value={<Num value={-s.totalLiabilities} bold />} />
          </div>
        </div>
      </div>

      {/* NET WORTH */}
      <div
        className="mx-3 mt-2 mb-3 px-3 py-2 flex justify-between items-center"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-wire)',
          borderRadius: '3px',
        }}
      >
        <InfoLabel info={TERM_INFO.netWorth} className="text-xs font-semibold" style={{ color: 'var(--color-mist)' }}>
          Net Worth
        </InfoLabel>
        <span
          className="text-sm font-bold"
          style={{
            color: s.netWorth >= 0 ? 'var(--color-seafoam)' : 'var(--color-flame)',
            fontFamily: 'var(--font-data)',
          }}
        >
          {formatCurrency(s.netWorth)}
        </span>
      </div>

      {/* PROGRESS */}
      <div className="px-3 pb-4 space-y-4" style={{ borderTop: '1px solid var(--color-rim)', paddingTop: '12px' }}>
        <PassiveIncomeGauge player={player} />
        <AnchorProgressBar player={player} />
      </div>

    </div>
  )
}

/* ── Primitives ───────────────────────────────────────────────── */

function Section({ label, color, children, info }: { label: string; color: string; children: ReactNode; info?: ConceptInfo }) {
  const titleStyle = { fontFamily: 'var(--font-display)', fontSize: '13px', color }
  const titleClass = 'text-[11px] font-bold tracking-widest uppercase'
  return (
    <div style={{ borderBottom: '1px solid var(--color-rim)' }}>
      <div
        className="px-3 py-1.5 flex items-center gap-2"
        style={{
          background: color + '0C',
          borderBottom: '1px solid var(--color-rim)',
          borderLeft: `2px solid ${color}`,
        }}
      >
        {info ? (
          <InfoLabel info={info} className={titleClass} style={titleStyle}>{label}</InfoLabel>
        ) : (
          <span className={titleClass} style={titleStyle}>{label}</span>
        )}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  )
}

function TableHeader({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between pb-1 mb-1" style={{ borderBottom: '1px solid var(--color-rim)' }}>
      <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-fog)' }}>{left}</span>
      <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-fog)' }}>{right}</span>
    </div>
  )
}

function TableRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="flex-1 truncate pr-2 text-[11px]" style={{ color: 'var(--color-mist)' }}>{left}</span>
      <span>{right}</span>
    </div>
  )
}

function TotalRow({ left, right }: { left: string; right: ReactNode }) {
  return (
    <div
      className="flex justify-between items-center py-0.5 mt-1 pt-1"
      style={{ borderTop: '1px solid var(--color-wire)' }}
    >
      <span className="text-[11px] font-semibold" style={{ color: 'var(--color-snow)' }}>{left}</span>
      <span>{right}</span>
    </div>
  )
}

function SummaryRow({ label, value, bold, color, info }: { label: string; value: string; bold?: boolean; color?: string; info?: ConceptInfo }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      {info ? (
        <InfoLabel info={info} className="text-[11px]" style={{ color: 'var(--color-fog)' }}>{label}</InfoLabel>
      ) : (
        <span className="text-[11px]" style={{ color: 'var(--color-fog)' }}>{label}</span>
      )}
      <span
        className={bold ? 'font-bold' : 'font-medium'}
        style={{ color: color ?? 'var(--color-snow)', fontFamily: 'var(--font-data)', fontSize: '12px' }}
      >
        {value}
      </span>
    </div>
  )
}

function ALHeader({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between pb-1 mb-0.5" style={{ borderBottom: '1px solid var(--color-rim)' }}>
      <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-fog)' }}>{left}</span>
      <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-fog)' }}>{right}</span>
    </div>
  )
}

function ALRow({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="py-0.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[11px] truncate max-w-[80px]" style={{ color: 'var(--color-mist)' }}>{label}</span>
        <span>{value}</span>
      </div>
      {sub && (
        <span className="text-[9px]" style={{ color: 'var(--color-seafoam)', fontFamily: 'var(--font-data)' }}>{sub}</span>
      )}
    </div>
  )
}

function ALTotal({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      className="flex justify-between items-center py-0.5 mt-1 pt-1"
      style={{ borderTop: '1px solid var(--color-wire)' }}
    >
      <span className="text-[10px] font-semibold" style={{ color: 'var(--color-snow)' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function Num({ value, bold }: { value: number; bold?: boolean }) {
  return (
    <span
      className={bold ? 'font-bold' : 'font-medium'}
      style={{
        color: value >= 0 ? 'var(--color-seafoam)' : 'var(--color-flame)',
        fontFamily: 'var(--font-data)',
        fontSize: '11px',
      }}
    >
      {formatCurrency(value)}
    </span>
  )
}
