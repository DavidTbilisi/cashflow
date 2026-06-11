import { useState } from 'react'
import { motion } from 'framer-motion'
import { NECST_QUESTIONS } from '../../domain/rules/necstTest'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import type { NECSTAnswers } from '../../domain/entities/types'

export function NECSTModal() {
  const [answers, setAnswers] = useState<NECSTAnswers>({
    need: false, entry: false, control: false, scale: false, time: false,
  })
  const resolveNECST = useGameStore((s) => s.resolveNECST)
  const closeModal = useUIStore((s) => s.closeModal)
  const card = useGameStore((s) => s.game?.activeCard)

  const score = Object.values(answers).filter(Boolean).length
  const threshold = card?.necstPassThreshold ?? 3
  const passes = score >= threshold

  const handleSubmit = () => {
    resolveNECST(answers)
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
