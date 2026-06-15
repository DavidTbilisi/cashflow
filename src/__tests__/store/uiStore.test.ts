import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../../store/uiStore'

beforeEach(() => {
  useUIStore.setState({ animQueue: [], modalOpen: null, sidebarTab: 'balance', helpOpen: false })
})

// ── Animation queue ──────────────────────────────────────────────────────────

describe('animation queue', () => {
  it('enqueues and dequeues in FIFO order', () => {
    const { enqueueAnim } = useUIStore.getState()
    enqueueAnim({ type: 'card_flip' })
    enqueueAnim({ type: 'anchor_unlock', anchorId: 'door' })
    const first = useUIStore.getState().dequeueAnim()
    expect(first).toEqual({ type: 'card_flip' })
    const second = useUIStore.getState().dequeueAnim()
    expect(second).toEqual({ type: 'anchor_unlock', anchorId: 'door' })
    expect(useUIStore.getState().animQueue).toHaveLength(0)
  })

  it('dequeue returns undefined on an empty queue', () => {
    expect(useUIStore.getState().dequeueAnim()).toBeUndefined()
  })
})

// ── Modals ───────────────────────────────────────────────────────────────────

describe('modal control', () => {
  it('opens and closes a modal', () => {
    useUIStore.getState().openModal('necst')
    expect(useUIStore.getState().modalOpen).toBe('necst')
    useUIStore.getState().closeModal()
    expect(useUIStore.getState().modalOpen).toBeNull()
  })
})

// ── Sidebar + help ───────────────────────────────────────────────────────────

describe('sidebar and help', () => {
  it('switches the sidebar tab', () => {
    useUIStore.getState().setSidebarTab('cashflow')
    expect(useUIStore.getState().sidebarTab).toBe('cashflow')
  })

  it('toggles help open and closed', () => {
    useUIStore.getState().toggleHelp()
    expect(useUIStore.getState().helpOpen).toBe(true)
    useUIStore.getState().toggleHelp()
    expect(useUIStore.getState().helpOpen).toBe(false)
  })

  it('sets help open state explicitly', () => {
    useUIStore.getState().setHelp(true)
    expect(useUIStore.getState().helpOpen).toBe(true)
  })
})
