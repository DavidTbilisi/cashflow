import { motion, AnimatePresence } from 'framer-motion'
import type { Card } from '../../domain/entities/types'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'

const TYPE_META: Record<string, { color: string; label: string }> = {
  small_deal:          { color: '#5B8FF9', label: 'Small Deal' },
  big_deal:            { color: '#C8963C', label: 'Big Deal' },
  market:              { color: '#2DD4BF', label: 'The Market' },
  doodad:              { color: '#F0A050', label: 'Doodad' },
  event:               { color: '#8090A8', label: 'Event' },
  income:              { color: '#2DD4BF', label: 'Income' },
  expense_liability:   { color: '#F06070', label: 'Expense' },
  asset_acquisition:   { color: '#5B8FF9', label: 'Asset' },
  system_building:     { color: '#A87BF0', label: 'System' },
  decision_temptation: { color: '#F0A050', label: 'Decision' },
  obstacle_challenge:  { color: '#F06070', label: 'Obstacle' },
}

const DECLINABLE = new Set(['asset_acquisition', 'decision_temptation', 'small_deal', 'big_deal'])

interface Props { card: Card }

export function CardModal({ card }: Props) {
  const resolveCard = useGameStore((s) => s.resolveCard)
  const cash = useGameStore((s) => (s.game ? s.game.players[s.game.currentPlayerIndex].finances.cashBalance : 0))
  const openModal = useUIStore((s) => s.openModal)
  const meta = TYPE_META[card.type] ?? { color: '#8090A8', label: card.type }

  // Deals show a down payment; you can't accept what you can't afford.
  const dealEffect = card.effects.find((e) => e.type === 'acquire_asset')
  const downPayment = dealEffect && dealEffect.type === 'acquire_asset'
    ? dealEffect.asset.purchasePrice - dealEffect.asset.liabilityAmount
    : 0
  const unaffordable = downPayment > 0 && cash < downPayment

  const handleAccept = () => {
    if (unaffordable) return
    if (card.requiresNECST) { openModal('necst'); return }
    resolveCard(card, true)
  }
  const handleDecline = () => resolveCard(card, false)
  const canDecline = DECLINABLE.has(card.type)

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
          <div className="h-0.5" style={{ background: meta.color }} />

          <div className="p-6">
            <div className="mb-4">
              <span
                className="text-[10px] font-bold tracking-[0.22em] uppercase px-2 py-1"
                style={{
                  background: meta.color + '1A',
                  color: meta.color,
                  border: `1px solid ${meta.color}44`,
                  borderRadius: '2px',
                }}
              >
                {meta.label}
              </span>
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
              <div className="flex justify-between text-xs mb-3" style={{ fontFamily: 'var(--font-data)' }}>
                <span style={{ color: 'var(--color-fog)' }}>Down payment</span>
                <span style={{ color: unaffordable ? 'var(--color-flame)' : 'var(--color-snow)' }}>
                  {dealEffect && dealEffect.type === 'acquire_asset' && `−$${downPayment.toLocaleString()} · cash $${cash.toLocaleString()}`}
                </span>
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
                  Pass
                </button>
              )}
              <button
                onClick={handleAccept}
                disabled={unaffordable}
                className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: unaffordable ? 'var(--color-rim)' : meta.color,
                  color: unaffordable ? 'var(--color-fog)' : 'var(--color-ink)',
                  borderRadius: '3px',
                  border: 'none',
                  cursor: unaffordable ? 'not-allowed' : 'pointer',
                }}
              >
                {unaffordable ? 'Not enough cash' : canDecline ? 'Accept' : 'Continue'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
