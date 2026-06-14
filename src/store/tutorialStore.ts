import { create } from 'zustand'
import { TUTORIAL_STEPS } from '../tutorial/tutorialSteps'

interface TutorialState {
  active: boolean
  stepIndex: number
  /** Begin the guided playthrough at step 0. */
  start: () => void
  /** Advance one step (clamped at the last step). */
  next: () => void
  /** End the tutorial and reset to the start. */
  skip: () => void
}

export const useTutorialStore = create<TutorialState>((set) => ({
  active: false,
  stepIndex: 0,
  start: () => set({ active: true, stepIndex: 0 }),
  next: () => set((s) => ({ stepIndex: Math.min(s.stepIndex + 1, TUTORIAL_STEPS.length - 1) })),
  skip: () => set({ active: false, stepIndex: 0 }),
}))
