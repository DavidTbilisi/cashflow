import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { useGameStore } from '../../store/gameStore'
import { computeSummary } from '../../domain/services/financialCalc'
import { DREAM_NEUTRALIZE_COST } from '../../domain/services/socialService'
import { DREAMS } from '../../domain/data/fastTrack'
import { formatCurrency } from '../../utils/currency'
import { KbdHint } from '../ui/KbdHint'
import { useShortcutBadge } from '../../hooks/useGameShortcuts'

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
          className="arcade-panel max-w-sm w-full mx-4 overflow-hidden"
          style={{
            background: 'var(--color-card)',
            border: `1px solid ${accent}55`,
            boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 44px ${accent}33`,
          }}
          initial={{ scale: 0.87, y: 18 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        >
          <div className="h-[3px]" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
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

function PrimaryBtn({ onClick, disabled, color, hint, children }: { onClick: () => void; disabled?: boolean; color: string; hint?: string | null; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="arcade-clip-sm flex-1 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] transition-all hover:brightness-110"
      style={{
        background: disabled ? 'var(--color-rim)' : color,
        color: disabled ? 'var(--color-fog)' : 'var(--color-ink)',
        border: 'none',
        boxShadow: disabled ? 'none' : `0 0 16px ${color}66`,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}{hint && !disabled && <KbdHint k={hint} />}
    </button>
  )
}

function GhostBtn({ onClick, hint, children }: { onClick: () => void; hint?: string | null; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="arcade-clip-sm flex-1 py-2.5 text-sm font-medium uppercase tracking-[0.12em] transition-all"
      style={{ border: '1px solid var(--color-wire)', color: 'var(--color-mist)', background: 'transparent', cursor: 'pointer' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(176,107,255,0.10)'; e.currentTarget.style.borderColor = 'var(--color-iris)'; e.currentTarget.style.color = 'var(--color-snow)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(176,107,255,0.35)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--color-wire)'; e.currentTarget.style.color = 'var(--color-mist)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {children}{hint && <KbdHint k={hint} />}
    </button>
  )
}

// ── Opportunity: choose Small Deal or Big Deal ──────────────────────────────
export function DealChooser() {
  const chooseDeal = useGameStore((s) => s.chooseDeal)
  const smallBadge = useShortcutBadge('dealSmall')
  const bigBadge = useShortcutBadge('dealBig')
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
    <ModalShell accent="#2EF2A6" label="Opportunity" title="Choose Your Deal">
      <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>Which kind of opportunity do you want to draw?</p>
      <div className="flex flex-col gap-2">
        <Card size="small" color="#2DE2FF" title={<>Small Deal{smallBadge && <KbdHint k={smallBadge} />}</>} sub="Stocks & small real estate · ≤ $5,000 to get in" />
        <Card size="big" color="#FFC93C" title={<>Big Deal{bigBadge && <KbdHint k={bigBadge} />}</>} sub="Apartments & businesses · $6,000+ to get in" />
      </div>
    </ModalShell>
  )
}

// ── Charity ─────────────────────────────────────────────────────────────────
export function CharityModal() {
  const game = useGameStore((s) => s.game)
  const accept = useGameStore((s) => s.acceptCharity)
  const decline = useGameStore((s) => s.declineCharity)
  const primaryBadge = useShortcutBadge('primary')
  const dismissBadge = useShortcutBadge('dismiss')
  if (!game) return null
  const player = game.players[game.currentPlayerIndex]
  const tithe = Math.round(computeSummary(player.finances).totalMonthlyIncome * 0.1)
  const ratRace = player.boardTrack === 'rat_race'
  return (
    <ModalShell accent="#FF2EA6" label="Charity" title="Give to Charity?">
      <p className="text-sm mb-4" style={{ color: 'var(--color-mist)' }}>
        Donate 10% of your total income ({formatCurrency(tithe)}){' '}
        {ratRace ? 'to roll two dice on each of your next 3 turns.' : 'to choose how many dice you roll for the rest of the game.'}
      </p>
      <div className="flex gap-2">
        <GhostBtn onClick={decline} hint={dismissBadge}>Decline</GhostBtn>
        <PrimaryBtn onClick={accept} disabled={player.finances.cashBalance < tithe} color="#FF2EA6" hint={primaryBadge}>
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
  const dismissBadge = useShortcutBadge('dismiss')
  if (!game || !game.activeCard) return null
  const { activeCard: card, marketOffer: offers } = game
  const player = game.players[game.currentPlayerIndex]
  return (
    <ModalShell accent="#1FE0C4" label="The Market" title={card.title}>
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
              style={{ background: 'rgba(31,224,196,0.10)', border: '1px solid rgba(31,224,196,0.4)', borderRadius: '3px', cursor: 'pointer' }}
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
        <GhostBtn onClick={pass} hint={dismissBadge}>Keep · Pass</GhostBtn>
      </div>
    </ModalShell>
  )
}

// ── Fast Track: buy a Business (green) or a Dream (pink) ─────────────────────
export function PurchaseModal() {
  const game = useGameStore((s) => s.game)
  const buy = useGameStore((s) => s.buyPending)
  const skip = useGameStore((s) => s.skipPending)
  const neutralize = useGameStore((s) => s.neutralizeDreamMarker)
  const primaryBadge = useShortcutBadge('primary')
  const dismissBadge = useShortcutBadge('dismiss')
  if (!game || !game.pendingPurchase) return null
  const pp = game.pendingPurchase
  const player = game.players[game.currentPlayerIndex]
  const cash = player.finances.cashBalance
  const afford = cash >= pp.cost
  const isDream = pp.kind === 'dream'
  const accent = isDream ? '#FF2EA6' : '#2EF2A6'

  // SC sink: rivals who landed on your Dream inflated its price; pull strings to undo one.
  const dreamId = isDream ? game.boardSpaces.find((s) => s.id === pp.spaceId)?.dreamId : undefined
  const markers = dreamId ? (game.dreamMarkers[dreamId] ?? 0) : 0
  const baseCost = dreamId ? DREAMS.find((d) => d.id === dreamId)?.cost ?? 0 : 0
  const canNeutralize = markers > 0 && player.socialCapital >= DREAM_NEUTRALIZE_COST

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

      {isDream && markers > 0 && (
        <div
          className="mb-4 px-3 py-2"
          style={{ background: 'rgba(91,200,160,0.08)', border: '1px solid rgba(91,200,160,0.25)', borderRadius: '3px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] leading-snug" style={{ color: 'var(--color-mist)' }}>
              Rivals inflated this Dream by {markers}× (+{formatCurrency(baseCost * markers)}).
            </span>
            <button
              onClick={neutralize}
              disabled={!canNeutralize}
              className="ml-3 px-2.5 py-1 text-[11px] font-semibold flex-shrink-0"
              style={{
                background: canNeutralize ? '#5BC8A0' : 'var(--color-rim)',
                color: canNeutralize ? 'var(--color-ink)' : 'var(--color-fog)',
                borderRadius: '2px',
                border: 'none',
                cursor: canNeutralize ? 'pointer' : 'not-allowed',
              }}
            >
              🤝 Pull strings −{DREAM_NEUTRALIZE_COST} SC
            </button>
          </div>
          {!canNeutralize && (
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-fog)' }}>
              Need {DREAM_NEUTRALIZE_COST} SC — you have {player.socialCapital}.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <GhostBtn onClick={skip} hint={dismissBadge}>Skip</GhostBtn>
        <PrimaryBtn onClick={buy} disabled={!afford} color={accent} hint={primaryBadge}>
          {afford ? (isDream ? 'Buy Dream' : 'Buy Business') : 'Not enough cash'}
        </PrimaryBtn>
      </div>
    </ModalShell>
  )
}
