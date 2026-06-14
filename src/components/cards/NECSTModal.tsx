import { useState } from 'react'
import { motion } from 'framer-motion'
import { NECST_QUESTIONS } from '../../domain/rules/necstTest'
import { NECST_DISCOUNT_COST } from '../../domain/services/socialService'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import type { NECSTAnswers } from '../../domain/entities/types'

export function NECSTModal() {
  const [answers, setAnswers] = useState<NECSTAnswers>({
    need: false, entry: false, control: false, scale: false, time: false,
  })
  const [useDiscount, setUseDiscount] = useState(false)
  const resolveNECST = useGameStore((s) => s.resolveNECST)
  const closeModal = useUIStore((s) => s.closeModal)
  const card = useGameStore((s) => s.game?.activeCard)
  const player = useGameStore((s) => s.game ? s.game.players[s.game.currentPlayerIndex] : null)

  const score = Object.values(answers).filter(Boolean).length
  const baseThreshold = card?.necstPassThreshold ?? 3
  // SC sink: an advisor's vouch lowers the bar by 1 (only meaningful above 1).
  const canDiscount = baseThreshold > 1 && (player?.socialCapital ?? 0) >= NECST_DISCOUNT_COST
  const discountActive = useDiscount && canDiscount
  const threshold = discountActive ? baseThreshold - 1 : baseThreshold
  const passes = score >= threshold

  const handleSubmit = () => {
    resolveNECST(answers, discountActive)
    closeModal()
  }

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(7,10,18,0.88)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="max-w-lg w-full mx-4 shadow-2xl"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-rim)',
          borderTop: `2px solid var(--color-honey)`,
          borderRadius: '4px',
        }}
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div className="p-6">
          <div className="mb-4">
            <span
              className="text-[10px] font-bold tracking-[0.22em] uppercase px-2 py-1"
              style={{
                background: 'rgba(240,160,80,0.12)',
                color: 'var(--color-honey)',
                border: '1px solid rgba(240,160,80,0.3)',
                borderRadius: '2px',
              }}
            >
              Venture Evaluation
            </span>
          </div>

          <h2
            className="text-2xl font-semibold mb-1 leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)' }}
          >
            NECST Test
          </h2>
          <p className="text-xs mb-5" style={{ color: 'var(--color-fog)' }}>
            Answer honestly — pass {threshold} of 5 criteria to proceed with this venture.
          </p>

          <div className="space-y-3">
            {NECST_QUESTIONS.map(({ key, question }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers[key]}
                  onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded"
                  style={{ accentColor: 'var(--color-honey)' }}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: answers[key] ? 'var(--color-snow)' : 'var(--color-mist)' }}
                >
                  <span
                    className="font-bold text-xs uppercase tracking-wider mr-1"
                    style={{ color: 'var(--color-honey)' }}
                  >
                    {key}:
                  </span>
                  {question}
                </span>
              </label>
            ))}
          </div>

          {canDiscount && (
            <button
              onClick={() => setUseDiscount((v) => !v)}
              className="mt-4 w-full flex items-center justify-between px-3 py-2 text-left transition-colors"
              style={{
                background: discountActive ? 'rgba(91,200,160,0.12)' : 'transparent',
                border: `1px solid ${discountActive ? 'rgba(91,200,160,0.4)' : 'var(--color-rim)'}`,
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <span className="text-xs leading-snug" style={{ color: discountActive ? '#5BC8A0' : 'var(--color-mist)' }}>
                <span className="font-semibold">🤝 Call in a favor</span>
                <span className="block text-[10px]" style={{ color: 'var(--color-fog)' }}>
                  Spend {NECST_DISCOUNT_COST} SC — a trusted advisor vouches, lowering the bar to {baseThreshold - 1}/5.
                </span>
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ml-3 flex-shrink-0"
                style={{
                  background: discountActive ? '#5BC8A0' : 'var(--color-rim)',
                  color: discountActive ? 'var(--color-ink)' : 'var(--color-fog)',
                  borderRadius: '2px',
                }}
              >
                {discountActive ? 'On' : 'Off'}
              </span>
            </button>
          )}

          <div
            className="mt-5 pt-4"
            style={{ borderTop: '1px solid var(--color-rim)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'var(--color-mist)' }}>
                Score:{' '}
                <span
                  className="font-bold"
                  style={{
                    color: passes ? 'var(--color-seafoam)' : 'var(--color-flame)',
                    fontFamily: 'var(--font-data)',
                  }}
                >
                  {score}/{NECST_QUESTIONS.length}
                </span>
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 tracking-wider"
                style={{
                  background: passes ? 'rgba(45,212,191,0.12)' : 'rgba(240,96,112,0.12)',
                  color: passes ? 'var(--color-seafoam)' : 'var(--color-flame)',
                  border: `1px solid ${passes ? 'rgba(45,212,191,0.3)' : 'rgba(240,96,112,0.3)'}`,
                  borderRadius: '2px',
                }}
              >
                {passes ? 'PASS' : 'FAIL'}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-2.5 font-semibold text-sm transition-opacity hover:opacity-90"
              style={{
                background: 'var(--color-honey)',
                color: 'var(--color-ink)',
                borderRadius: '3px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Submit Decision
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
