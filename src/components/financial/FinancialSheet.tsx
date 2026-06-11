import type { ReactNode } from 'react'
import type { PlayerState } from '../../domain/entities/types'
import { computeSummary } from '../../domain/services/financialCalc'
import { formatCurrency } from '../../utils/currency'
import { valueColor } from '../../utils/colors'
import { useGameStore } from '../../store/gameStore'
import { AnchorProgressBar } from '../progress/AnchorProgressBar'
import { InfoLabel, TERM_INFO, type ConceptInfo } from '../ui/conceptInfo'

interface Props { player: PlayerState }

export function FinancialSheet({ player }: Props) {
  const { finances } = player
  const s = computeSummary(finances)
  const payOffDebt = useGameStore((st) => st.payOffDebt)
  const takeLoan = useGameStore((st) => st.takeLoan)
  const currentId = useGameStore((st) => (st.game ? st.game.players[st.game.currentPlayerIndex].id : null))
  const isCurrent = currentId === player.id
  const canBorrow = isCurrent && player.boardTrack !== 'fast_track'

  return (
    <div className="flex flex-col gap-0 text-xs" style={{ color: 'var(--color-snow)' }}>

      {/* INCOME */}
      <Section label="Income" color="var(--color-mist)" info={TERM_INFO.income}>
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
                    style={{ background: 'var(--color-wire)', color: 'var(--color-mist)', borderRadius: '2px' }}
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
      <Section label="Expenses" color="var(--color-fog)" info={TERM_INFO.expenses}>
        <TableHeader left="Item" right="Amount/mo" />
        {finances.expenseLines.map((e) => (
          <TableRow key={e.id} left={e.label} right={<Num value={-e.monthlyAmount} />} />
        ))}
        <TotalRow left="Total Expenses" right={<Num value={-s.totalMonthlyExpenses} bold />} />
      </Section>


      {/* ASSETS + LIABILITIES side by side */}
      <div className="flex" style={{ borderTop: '1px solid var(--color-rim)' }}>
        {/* Assets */}
        <div className="flex-1" style={{ borderRight: '1px solid var(--color-rim)' }}>
          <div
            className="px-3 py-1.5 flex items-center gap-2"
            style={{ background: 'var(--color-rim)', borderBottom: '1px solid var(--color-rim)' }}
          >
            <InfoLabel
              info={TERM_INFO.assets}
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-mist)' }}
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
            style={{ background: 'var(--color-rim)', borderBottom: '1px solid var(--color-rim)' }}
          >
            <InfoLabel
              info={TERM_INFO.liabilities}
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--color-fog)' }}
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
                        style={{ color: 'var(--color-mist)', border: '1px solid var(--color-wire)', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}
                      >
                        {isBankLoan ? 'Repay $1k' : `Pay off ${formatCurrency(l.totalOwed)}`}
                      </button>
                    )}
                  </div>
                )
              })
            )}
            {canBorrow && (
              <button
                onClick={() => takeLoan(1000)}
                className="mt-1 text-[9px] px-1.5 py-px transition-opacity hover:opacity-80"
                style={{ color: 'var(--color-mist)', border: '1px solid var(--color-wire)', borderRadius: '2px', background: 'transparent', cursor: 'pointer' }}
              >
                Borrow $1k
              </button>
            )}
            <ALTotal label="Total Liabilities" value={<Num value={-s.totalLiabilities} bold />} />
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid var(--color-rim)', paddingTop: '12px' }}>
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
        <span className="text-[9px]" style={{ color: 'var(--color-mist)', fontFamily: 'var(--font-data)' }}>{sub}</span>
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
        color: valueColor(value),
        fontFamily: 'var(--font-data)',
        fontSize: '11px',
      }}
    >
      {formatCurrency(value)}
    </span>
  )
}
