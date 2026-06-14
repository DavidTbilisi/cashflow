import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useTutorialStore } from '../store/tutorialStore'
import { TUTORIAL_STEPS } from '../tutorial/tutorialSteps'

/**
 * Drives the guided tutorial: queues each step's forced dice on entry, and
 * auto-advances when a step's `done(game)` predicate is satisfied. Because
 * `stepIndex` is an effect dependency, advancing re-runs the check against the
 * same game state — so a single action can chain through several auto steps,
 * stopping at the next manual step. Call once, in GameScreen.
 */
export function useTutorialDriver() {
  const active = useTutorialStore((s) => s.active)
  const stepIndex = useTutorialStore((s) => s.stepIndex)
  const next = useTutorialStore((s) => s.next)
  const game = useGameStore((s) => s.game)
  const forceNextDice = useGameStore((s) => s.forceNextDice)

  // Queue forced dice when a step becomes active.
  useEffect(() => {
    if (!active) return
    const step = TUTORIAL_STEPS[stepIndex]
    if (step?.forceDice) forceNextDice(step.forceDice)
  }, [active, stepIndex, forceNextDice])

  // Auto-advance once the current step's action is complete.
  useEffect(() => {
    if (!active || !game) return
    const step = TUTORIAL_STEPS[stepIndex]
    if (step?.done && step.done(game)) next()
  }, [active, stepIndex, game, next])
}
