import { motion, AnimatePresence } from 'framer-motion'
import { useTutorialStore } from '../../store/tutorialStore'
import { TUTORIAL_STEPS } from '../../tutorial/tutorialSteps'
import { TutorialSpotlight } from './TutorialSpotlight'

export function TutorialCoach() {
  const active = useTutorialStore((s) => s.active)
  const stepIndex = useTutorialStore((s) => s.stepIndex)
  const next = useTutorialStore((s) => s.next)
  const skip = useTutorialStore((s) => s.skip)

  const step = TUTORIAL_STEPS[stepIndex]
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1
  const isManual = !step?.done

  return (
    <>
      {active && step && <TutorialSpotlight target={step.target} />}
      <AnimatePresence>
        {active && step && (
          <motion.div
            key={step.id}
            className="fixed bottom-4 left-1/2 z-[56] w-[340px]"
            style={{ transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          >
            <div
              className="overflow-hidden shadow-2xl"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-gold)', borderRadius: '8px' }}
            >
              <div className="h-1" style={{ background: 'var(--color-gold)' }} />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--color-gold)' }}>
                    Tutorial · {stepIndex + 1}/{TUTORIAL_STEPS.length}
                  </span>
                  <button
                    onClick={skip}
                    className="text-[10px] tracking-wider transition-opacity hover:opacity-100 opacity-60"
                    style={{ color: 'var(--color-fog)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    Skip tutorial
                  </button>
                </div>

                <h3 className="text-base font-semibold mb-1.5 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-snow)' }}>
                  {step.title}
                </h3>
                <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--color-mist)' }}>
                  {step.body}
                </p>

                {/* Progress dots */}
                <div className="flex items-center gap-1 mb-3">
                  {TUTORIAL_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 transition-colors"
                      style={{ background: i <= stepIndex ? 'var(--color-gold)' : 'var(--color-rim)', borderRadius: '1px' }}
                    />
                  ))}
                </div>

                {isManual ? (
                  <button
                    onClick={isLast ? skip : next}
                    className="w-full py-2.5 text-xs font-semibold tracking-[0.1em] uppercase transition-opacity hover:opacity-90 active:scale-[0.98]"
                    style={{ background: 'var(--color-gold)', color: 'var(--color-ink)', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                  >
                    {step.cta ?? 'Next →'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 py-1.5 px-1">
                    <span className="tutorial-pulse-dot w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--color-gold)' }} />
                    <span className="text-[11px] italic" style={{ color: 'var(--color-fog)' }}>
                      {step.waiting ?? 'Complete the action to continue'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
