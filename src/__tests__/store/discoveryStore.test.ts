import { beforeEach, describe, expect, it } from 'vitest'
import { useDiscoveryStore, discoveredCount } from '../../store/discoveryStore'

describe('discoveryStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useDiscoveryStore.getState().reset()
  })

  it('marks principles discovered and queues toasts for new, real ones', () => {
    useDiscoveryStore.getState().discover(['six-anchors', 'mr-market'])
    const s = useDiscoveryStore.getState()
    expect(s.discovered['six-anchors']).toBe(true)
    expect(s.discovered['mr-market']).toBe(true)
    expect(s.toastQueue).toEqual(['six-anchors', 'mr-market'])
  })

  it('ignores unknown ids and does not re-queue already-discovered ones', () => {
    const { discover } = useDiscoveryStore.getState()
    discover(['six-anchors'])
    discover(['six-anchors', 'not-a-real-principle', 'esbi-quadrant'])
    const s = useDiscoveryStore.getState()
    expect(s.discovered['not-a-real-principle']).toBeUndefined()
    // six-anchors already known → only esbi-quadrant is freshly queued the 2nd time
    expect(s.toastQueue).toEqual(['six-anchors', 'esbi-quadrant'])
  })

  it('silent discovery updates the count without queuing toasts', () => {
    useDiscoveryStore.getState().discover(['six-anchors', 'rat-race'], true)
    const s = useDiscoveryStore.getState()
    expect(s.toastQueue).toEqual([])
    expect(discoveredCount(s.discovered)).toBe(2)
  })

  it('discoveredCount only counts ids that still exist in the catalog', () => {
    useDiscoveryStore.setState({ discovered: { 'six-anchors': true, 'ghost-principle': true } })
    expect(discoveredCount(useDiscoveryStore.getState().discovered)).toBe(1)
  })

  it('persists across store reloads via localStorage', () => {
    useDiscoveryStore.getState().discover(['necst-test'])
    expect(localStorage.getItem('cashflow_discovered_principles')).toContain('necst-test')
  })
})
