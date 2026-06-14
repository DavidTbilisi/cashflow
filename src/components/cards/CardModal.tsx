import { motion, AnimatePresence } from 'framer-motion'
import type { Card } from '../../domain/entities/types'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { computeSummary } from '../../domain/services/financialCalc'
import { DOODAD_NEGOTIATE_COST } from '../../domain/services/timeService'
import { formatCurrency } from '../../utils/currency'
import { valueColor } from '../../utils/colors'
import { KbdHint } from '../ui/KbdHint'
import { useShortcutBadge } from '../../hooks/useGameShortcuts'

const TYPE_META: Record<string, { color: string; label: string }> = {
  small_deal:          { color: '#5B8FF9', label: 'Small Deal' },
  big_deal:            { color: '#C8963C', label: 'Big Deal' },
  market:              { color: '#2DD4BF', label: 'The Market' },
  doodad:              { color: '#F0A050', label: 'Lifestyle' },
  event:               { color: '#8090A8', label: 'Event' },
  income:              { color: '#2DD4BF', label: 'Income' },
  expense_liability:   { color: '#F06070', label: 'Expense' },
  asset_acquisition:   { color: '#5B8FF9', label: 'Asset' },
  system_building:     { color: '#A87BF0', label: 'System' },
  decision_temptation: { color: '#F0A050', label: 'Decision' },
  obstacle_challenge:  { color: '#F06070', label: 'Obstacle' },
  network:             { color: '#5BC8A0', label: 'Network' },
}

const LIFESTYLE_NEED_COLOR = '#F06070'
const LIFESTYLE_WANT_COLOR = '#F0A050'

const DECLINABLE = new Set(['asset_acquisition', 'decision_temptation', 'small_deal', 'big_deal'])

interface Props { card: Card }

export function CardModal({ card }: Props) {
  const resolveCard = useGameStore((s) => s.resolveCard)
  const borrowAndBuy = useGameStore((s) => s.borrowAndBuy)
  const negotiateDoodad = useGameStore((s) => s.negotiateDoodad)
  const player = useGameStore((s) => s.game ? s.game.players[s.game.currentPlayerIndex] : null)
  const doodadNegotiated = useGameStore((s) => s.game?.doodadNegotiated ?? false)
  const finances = player?.finances ?? null
  const cash = finances?.cashBalance ?? 0
  const openModal = useUIStore((s) => s.openModal)
  const primaryBadge = useShortcutBadge('primary')
  const dismissBadge = useShortcutBadge('dismiss')
  const negotiateBadge = useShortcutBadge('negotiate')
  const meta = TYPE_META[card.type] ?? { color: '#8090A8', label: card.type }

  const isDoodad = card.type === 'doodad'
  const isWant = isDoodad && card.lifestyleCategory === 'want'
  const isNeed = isDoodad && card.lifestyleCategory === 'need'
  const canNegotiate = isWant && !doodadNegotiated && (player?.freeTimeUnits ?? 0) >= DOODAD_NEGOTIATE_COST

  // Deals show a down payment; you can't accept what you can't afford.
  const dealEffect = card.effects.find((e) => e.type === 'acquire_asset')
  const downPayment = dealEffect && dealEffect.type === 'acquire_asset'
    ? dealEffect.asset.purchasePrice - dealEffect.asset.liabilityAmount
    : 0
  const unaffordable = downPayment > 0 && cash < downPayment

  // Borrow-and-buy amounts (only relevant when unaffordable)
  const borrowAmount = unaffordable ? Math.ceil((downPayment - cash) / 1000) * 1000 : 0
  const assetIncome = (dealEffect && dealEffect.type === 'acquire_asset') ? dealEffect.asset.monthlyPassiveIncome : 0
  const assetMaintenance = (dealEffect && dealEffect.type === 'acquire_asset') ? dealEffect.asset.monthlyExpense : 0
  const loanPayment = Math.round(borrowAmount * 0.1)
  const netCF = assetIncome - assetMaintenance - loanPayment

  // Warn if combined monthly expenses exceed total income after the transaction
  const summary = finances ? computeSummary(finances) : null
  const postBorrowCashFlow = summary ? summary.monthlyCashFlow + netCF : netCF
  const cashFlowWarning = unaffordable && postBorrowCashFlow < 0

  // Remaining cash after purchase (affordable path)
  const remainingCash = cash - downPayment
  const monthlyExpenses = summary?.totalMonthlyExpenses ?? 0
  const remainingCashColor = remainingCash < monthlyExpenses ? 'var(--color-flame)' : 'var(--color-seafoam)'

  const handleAccept = () => {
    if (unaffordable) return
    if (card.requiresNECST) { openModal('necst'); return }
    resolveCard(card, true)
  }
  const handleBorrowAndBuy = () => borrowAndBuy(card)
  const handleDecline = () => resolveCard(card, false)
  const canDecline = DECLINABLE.has(card.type) || isWant

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
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-rim)',
            borderRadius: '4px',
          }}
          initial={{ scale: 0.87, y: 18, rotateX: 6 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        >
          <div className="h-0.5" style={{ background: isNeed ? LIFESTYLE_NEED_COLOR : isWant ? LIFESTYLE_WANT_COLOR : meta.color }} />

          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <span
                className="text-[10px] font-bold tracking-[0.22em] uppercase px-2 py-1"
                style={{
                  background: (isNeed ? LIFESTYLE_NEED_COLOR : isWant ? LIFESTYLE_WANT_COLOR : meta.color) + '1A',
                  color: isNeed ? LIFESTYLE_NEED_COLOR : isWant ? LIFESTYLE_WANT_COLOR : meta.color,
                  border: `1px solid ${(isNeed ? LIFESTYLE_NEED_COLOR : isWant ? LIFESTYLE_WANT_COLOR : meta.color)}44`,
                  borderRadius: '2px',
                }}
              >
                {isNeed ? 'Lifestyle · Need' : isWant ? 'Lifestyle · Want' : meta.label}
              </span>
              {isDoodad && (
                <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-fog)' }}>
                  {isNeed ? 'mandatory' : 'optional'}
                </span>
              )}
            </div>

            <h2
              className="text-2xl font-semibold mb-2 leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)' }}
            >
              {card.title}
            </h2>

            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-mist)' }}>
              {card.description}
            </p>

            {card.flavorText && (
              <p
                className="text-xs italic pl-3 mb-4 leading-relaxed"
                style={{
                  color: 'var(--color-fog)',
                  borderLeft: `2px solid ${meta.color}44`,
                }}
              >
                {card.flavorText}
              </p>
            )}

            {card.lesson && (
              <div
                className="p-3 mb-4"
                style={{
                  background: 'rgba(200,150,60,0.08)',
                  borderLeft: '2px solid var(--color-gold)',
                  borderRadius: '0 3px 3px 0',
                }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-honey)' }}>
                  {card.lesson}
                </p>
              </div>
            )}

            {downPayment > 0 && (
              <div className="mb-3 text-xs" style={{ fontFamily: 'var(--font-data)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-fog)' }}>Down payment</span>
                  <span style={{ color: 'var(--color-flame)' }}>
                    −{formatCurrency(downPayment)}
                  </span>
                </div>
                {!unaffordable && (
                  <div className="flex justify-between mt-0.5">
                    <span style={{ color: 'var(--color-fog)' }}>Remaining cash</span>
                    <span style={{ color: remainingCashColor }}>{formatCurrency(remainingCash)}</span>
                  </div>
                )}
              </div>
            )}

            {unaffordable && (
              <div
                className="mb-3 px-3 py-2 text-[11px] leading-relaxed"
                style={{ background: 'rgba(91,143,249,0.08)', border: '1px solid rgba(91,143,249,0.22)', borderRadius: '3px', fontFamily: 'var(--font-data)' }}
              >
                <div className="flex justify-between mb-0.5">
                  <span style={{ color: 'var(--color-fog)' }}>
                    {assetIncome > 0 ? `+${formatCurrency(assetIncome)}/mo income` : 'No income'}
                  </span>
                  {assetMaintenance > 0 && (
                    <span style={{ color: 'var(--color-fog)' }}>−{formatCurrency(assetMaintenance)}/mo maint.</span>
                  )}
                </div>
                <div className="flex justify-between mb-0.5">
                  <span style={{ color: 'var(--color-fog)' }}>−{formatCurrency(loanPayment)}/mo loan</span>
                  <span style={{ color: valueColor(netCF), fontWeight: 600 }}>
                    {netCF >= 0 ? '+' : ''}{formatCurrency(netCF)}/mo net
                  </span>
                </div>
                {cashFlowWarning && (
                  <p className="mt-1 text-[10px]" style={{ color: 'var(--color-honey)' }}>
                    ⚠ Monthly expenses will exceed income — cash flow goes negative.
                  </p>
                )}
              </div>
            )}

            {isWant && (
              <div className="mb-3 px-3 py-2" style={{ background: 'rgba(120,180,100,0.07)', border: '1px solid rgba(120,180,100,0.22)', borderRadius: '3px' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'var(--color-fog)' }}>
                    {doodadNegotiated ? '✓ Negotiated — expense halved' : `Negotiate: spend ${DOODAD_NEGOTIATE_COST}h free time to halve this Want`}
                  </span>
                  {!doodadNegotiated && (
                    <button
                      onClick={negotiateDoodad}
                      disabled={!canNegotiate}
                      className="ml-3 px-2.5 py-1 text-[11px] font-semibold transition-opacity"
                      style={{
                        background: canNegotiate ? 'rgba(120,180,100,0.25)' : 'var(--color-rim)',
                        color: canNegotiate ? '#8fc472' : 'var(--color-fog)',
                        border: `1px solid ${canNegotiate ? '#8fc47244' : 'transparent'}`,
                        borderRadius: '2px',
                        cursor: canNegotiate ? 'pointer' : 'not-allowed',
                        flexShrink: 0,
                      }}
                    >
                      {canNegotiate ? `−${DOODAD_NEGOTIATE_COST}h` : `Need ${DOODAD_NEGOTIATE_COST}h`}{negotiateBadge && <KbdHint k={negotiateBadge} />}
                    </button>
                  )}
                </div>
                {!canNegotiate && !doodadNegotiated && (
                  <p className="text-[10px] mt-1" style={{ color: 'var(--color-fog)' }}>
                    You have {player?.freeTimeUnits ?? 0}h free time. Advance your quadrant to unlock more.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              {canDecline && (
                <button
                  onClick={handleDecline}
                  className="flex-1 py-2.5 text-sm font-medium transition-all"
                  style={{
                    border: '1px solid var(--color-rim)',
                    color: 'var(--color-mist)',
                    borderRadius: '3px',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-rim)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  {isWant ? 'Skip · Save it' : 'Pass'}{dismissBadge && <KbdHint k={dismissBadge} />}
                </button>
              )}
              {unaffordable ? (
                <button
                  onClick={handleBorrowAndBuy}
                  className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: '#5B8FF9',
                    color: 'var(--color-ink)',
                    borderRadius: '3px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Borrow {formatCurrency(borrowAmount)} & Buy{primaryBadge && <KbdHint k={primaryBadge} />}
                </button>
              ) : (
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: meta.color,
                    color: 'var(--color-ink)',
                    borderRadius: '3px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isWant ? 'Spend It' : canDecline ? 'Accept' : 'Continue'}{primaryBadge && <KbdHint k={primaryBadge} />}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
