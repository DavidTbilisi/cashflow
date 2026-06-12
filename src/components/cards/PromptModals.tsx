import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { useGameStore } from '../../store/gameStore'
import { computeSummary } from '../../domain/services/financialCalc'
import { formatCurrency } from '../../utils/currency'
import { KbdHint } from '../ui/KbdHint'

function ModalShell({ accent, label, title, children }: { accent: string; label: string; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: 'rgba(7,10,18,0.88)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="max-w-sm w-full mx-4 overflow-hidden shadow-2xl"
          style={{ background: 'var(--color-card)', border: '1px solid var(--color-rim)', borderRadius: '4px' }}
          initial={{ scale: 0.87, y: 18 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        >
          <div className="h-0.5" style={{ background: accent }} />
          <div className="p-6">
            <div className="mb-4">
              <span
                className="text-[10px] font-bold tracking-[0.22em] uppercase px-2 py-1"
                style={{ background: accent + '1A', color: accent, border: `1px solid ${accent}44`, borderRadius: '2px' }}
              >
                {label}
              </span>
            </div>
            <h2 className="text-2xl font-semibold mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)' }}>
              {title}
            </h2>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function PrimaryBtn({ onClick, disabled, color, hint, children }: { onClick: () => void; disabled?: boolean; color: string; hint?: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
      style={{
        background: disabled ? 'var(--color-rim)' : color,
        color: disabled ? 'var(--color-fog)' : 'var(--color-ink)',
        borderRadius: '3px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}{hint && !disabled && <KbdHint k={hint} />}
    </button>
  )
}

function GhostBtn({ onClick, hint, children }: { onClick: () => void; hint?: string; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2.5 text-sm font-medium transition-all"
      style={{ border: '1px solid var(--color-rim)', color: 'var(--color-mist)', borderRadius: '3px', background: 'transparent', cursor: 'pointer' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-rim)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}{hint && <KbdHint k={hint} />}
    </button>
  )
}

// ── Opportunity: choose Small Deal or Big Deal ──────────────────────────────
export function DealChooser() {
  const chooseDeal = useGameStore((s) => s.chooseDeal)
  const Card = ({ size, color, title, sub }: { size: 'small' | 'big'; color: string; title: ReactNode; sub: string }) => (
    <button
      onClick={() => chooseDeal(size)}
      className="w-full text-left p-3 transition-all hover:opacity-90"
      style={{ background: color + '14', border: `1px solid ${color}55`, borderRadius: '3px', cursor: 'pointer' }}
    >
      <span className="block text-sm font-semibold" style={{ color }}>{title}</span>
      <span className="block text-xs mt-0.5" style={{ color: 'var(--color-fog)' }}>{sub}</span>
    </button>
  )
  return (
    <ModalShell accent="#9bbb4c" label="Opportunity" title="Choose Your Deal">
      <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>Which kind of opportunity do you want to draw?</p>
      <div className="flex flex-col gap-2">
        <Card size="small" color="#5B8FF9" title={<>Small Deal<KbdHint k="1" /></>} sub="Stocks & small real estate · ≤ $5,000 to get in" />
        <Card size="big" color="#C8963C" title={<>Big Deal<KbdHint k="2" /></>} sub="Apartments & businesses · $6,000+ to get in" />
      </div>
    </ModalShell>
  )
}

// ── Charity ─────────────────────────────────────────────────────────────────
export function CharityModal() {
  const game = useGameStore((s) => s.game)
  const accept = useGameStore((s) => s.acceptCharity)
  const decline = useGameStore((s) => s.declineCharity)
  if (!game) return null
  const player = game.players[game.currentPlayerIndex]
  const tithe = Math.round(computeSummary(player.finances).totalMonthlyIncome * 0.1)
  const ratRace = player.boardTrack === 'rat_race'
  return (
    <ModalShell accent="#d9799f" label="Charity" title="Give to Charity?">
      <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>
        Donate 10% of your total income ({formatCurrency(tithe)}){' '}
        {ratRace ? 'to roll two dice on each of your next 3 turns.' : 'to choose how many dice you roll for the rest of the game.'}
      </p>
      <div className="flex gap-2">
        <GhostBtn onClick={decline} hint="Esc">Decline</GhostBtn>
        <PrimaryBtn onClick={accept} disabled={player.finances.cashBalance < tithe} color="#d9799f" hint="↵">
          {player.finances.cashBalance < tithe ? 'Not enough cash' : `Donate ${formatCurrency(tithe)}`}
        </PrimaryBtn>
      </div>
    </ModalShell>
  )
}

// ── The Market: sell a matching asset, or pass ──────────────────────────────
export function MarketModal() {
  const game = useGameStore((s) => s.game)
  const sell = useGameStore((s) => s.sellMarketAsset)
  const pass = useGameStore((s) => s.passMarket)
  if (!game || !game.activeCard) return null
  const { activeCard: card, marketOffer: offers } = game
  const player = game.players[game.currentPlayerIndex]
  return (
    <ModalShell accent="#2DD4BF" label="The Market" title={card.title}>
      <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>{card.description}</p>
      <div className="flex flex-col gap-2 mb-3">
        {(offers ?? []).map((o) => {
          const lib = player.finances.liabilities.find((l) => l.assetId === o.assetId)
          const settlement = o.salePrice - (lib?.totalOwed ?? 0)
          return (
            <button
              key={o.assetId}
              onClick={() => sell(o.assetId)}
              className="w-full flex items-center justify-between p-3 transition-all hover:opacity-90"
              style={{ background: 'rgba(45,212,191,0.10)', border: '1px solid rgba(45,212,191,0.4)', borderRadius: '3px', cursor: 'pointer' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--color-snow)' }}>Sell {o.assetName}</span>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-seafoam)', fontFamily: 'var(--font-data)' }}>
                net {formatCurrency(settlement)}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex">
        <GhostBtn onClick={pass} hint="Esc">Keep · Pass</GhostBtn>
      </div>
    </ModalShell>
  )
}

// ── Fast Track: buy a Business (green) or a Dream (pink) ─────────────────────
export function PurchaseModal() {
  const game = useGameStore((s) => s.game)
  const buy = useGameStore((s) => s.buyPending)
  const skip = useGameStore((s) => s.skipPending)
  if (!game || !game.pendingPurchase) return null
  const pp = game.pendingPurchase
  const cash = game.players[game.currentPlayerIndex].finances.cashBalance
  const afford = cash >= pp.cost
  const isDream = pp.kind === 'dream'
  const accent = isDream ? '#d9799f' : '#9bbb4c'
  return (
    <ModalShell accent={accent} label={isDream ? 'Dream' : 'Business Investment'} title={pp.label}>
      <p className="text-sm mb-3" style={{ color: 'var(--color-mist)' }}>
        {isDream
          ? `Buy your Dream for ${formatCurrency(pp.cost)} — and win the game!`
          : `Put ${formatCurrency(pp.cost)} down to add ${formatCurrency(pp.cashFlow)}/mo to your CASHFLOW Day income.`}
      </p>
      <div className="flex justify-between text-xs mb-4" style={{ fontFamily: 'var(--font-data)' }}>
        <span style={{ color: 'var(--color-fog)' }}>Cost</span>
        <span style={{ color: afford ? 'var(--color-snow)' : 'var(--color-flame)' }}>
          −{formatCurrency(pp.cost)} · cash {formatCurrency(cash)}
        </span>
      </div>
      <div className="flex gap-2">
        <GhostBtn onClick={skip} hint="Esc">Skip</GhostBtn>
        <PrimaryBtn onClick={buy} disabled={!afford} color={accent} hint="↵">
          {afford ? (isDream ? 'Buy Dream' : 'Buy Business') : 'Not enough cash'}
        </PrimaryBtn>
      </div>
    </ModalShell>
  )
}
