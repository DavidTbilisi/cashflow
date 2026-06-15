import { describe, it, expect, beforeEach } from 'vitest'
import { useTutorialStore } from '../../store/tutorialStore'
import { TUTORIAL_STEPS } from '../../tutorial/tutorialSteps'

beforeEach(() => {
  useTutorialStore.setState({ active: false, stepIndex: 0 })
})

describe('tutorialStore', () => {
  it('start activates the tutorial at step 0', () => {
    useTutorialStore.setState({ stepIndex: 5 })
    useTutorialStore.getState().start()
    const s = useTutorialStore.getState()
    expect(s.active).toBe(true)
    expect(s.stepIndex).toBe(0)
  })

  it('next advances one step', () => {
    useTutorialStore.getState().start()
    useTutorialStore.getState().next()
    expect(useTutorialStore.getState().stepIndex).toBe(1)
  })

  it('next clamps at the final step', () => {
    useTutorialStore.getState().start()
    for (let i = 0; i < TUTORIAL_STEPS.length + 5; i++) useTutorialStore.getState().next()
    expect(useTutorialStore.getState().stepIndex).toBe(TUTORIAL_STEPS.length - 1)
  })

  it('skip deactivates and resets to step 0', () => {
    useTutorialStore.setState({ active: true, stepIndex: 4 })
    useTutorialStore.getState().skip()
    const s = useTutorialStore.getState()
    expect(s.active).toBe(false)
    expect(s.stepIndex).toBe(0)
  })
})
