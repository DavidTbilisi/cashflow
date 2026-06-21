import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { CodexScreen } from '../../screens/CodexScreen'
import { PRINCIPLES } from '../../domain/data/principles'
import { useDiscoveryStore, discoveredCount } from '../../store/discoveryStore'

// React 19's act() needs this flag set in a non-RTL environment.
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

function mount(ui: ReactNode) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(ui)
  })
}

beforeEach(() => {
  localStorage.clear()
  useDiscoveryStore.getState().reset()
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

function findButton(label: RegExp): HTMLButtonElement | undefined {
  return [...container.querySelectorAll('button')].find((b) => label.test(b.textContent ?? ''))
}

describe('CodexScreen — all principles visible and the view scrolls', () => {
  it('mounts exactly one bounded scroll container (regression: was min-h-screen, which could not scroll)', () => {
    mount(<CodexScreen onBack={() => {}} />)
    const scrollers = Array.from(container.querySelectorAll<HTMLElement>('.overflow-y-auto'))
    // The whole screen scrolls through a single container.
    expect(scrollers).toHaveLength(1)
    const scroller = scrollers[0]
    // h-screen = bounded height, so overflow-y-auto actually produces a scrollbar.
    expect(scroller.classList.contains('h-screen')).toBe(true)
    // The bug: min-h-screen lets the element grow past the viewport with nothing to
    // scroll — so content below the fold became unreachable (worst inside the
    // in-game fixed overlay). Guard against it coming back.
    expect(scroller.classList.contains('min-h-screen')).toBe(false)
  })

  it('renders every principle, including the last one below the fold', () => {
    mount(<CodexScreen onBack={() => {}} />)
    const text = container.textContent ?? ''
    const missing = PRINCIPLES.filter((p) => !text.includes(p.name)).map((p) => p.name)
    expect(missing, `principle cards missing from the DOM: ${missing.join(', ')}`).toEqual([])
    expect(PRINCIPLES.length).toBeGreaterThanOrEqual(50)
    // The final catalog entry must be in the DOM — proof the bottom content renders
    // (and is reachable once the container scrolls).
    expect(text).toContain(PRINCIPLES[PRINCIPLES.length - 1].name)
  })

  it('stays a self-contained scroller when embedded in the in-game fixed overlay', () => {
    // Mirrors GameScreen: <div class="fixed inset-0"> wraps the Codex. A bounded
    // h-screen child scrolls inside the 100vh fixed parent.
    mount(
      <div className="fixed inset-0 z-50">
        <CodexScreen onBack={() => {}} backLabel="Back to Game" />
      </div>,
    )
    const scroller = container.querySelector<HTMLElement>('.overflow-y-auto')
    expect(scroller).not.toBeNull()
    expect(scroller!.classList.contains('h-screen')).toBe(true)
    // Last principle still rendered within the overlay.
    expect(container.textContent ?? '').toContain(PRINCIPLES[PRINCIPLES.length - 1].name)
  })

  it('reset-progress button clears discovered progress after confirming', () => {
    useDiscoveryStore.getState().discover(['six-anchors', 'mr-market'])
    expect(discoveredCount(useDiscoveryStore.getState().discovered)).toBe(2)

    mount(<CodexScreen onBack={() => {}} />)

    // First click asks for confirmation rather than wiping immediately.
    const resetBtn = findButton(/Reset progress/i)
    expect(resetBtn, 'reset button should appear once something is discovered').toBeTruthy()
    act(() => resetBtn!.click())
    expect(discoveredCount(useDiscoveryStore.getState().discovered)).toBe(2) // not yet

    // Confirming clears lifetime progress.
    const yesBtn = findButton(/Yes, reset/i)
    expect(yesBtn).toBeTruthy()
    act(() => yesBtn!.click())
    expect(discoveredCount(useDiscoveryStore.getState().discovered)).toBe(0)
  })

  it('hides the reset button when nothing has been discovered', () => {
    mount(<CodexScreen onBack={() => {}} />)
    expect(findButton(/Reset progress/i)).toBeUndefined()
  })
})
