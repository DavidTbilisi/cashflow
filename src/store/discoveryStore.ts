import { create } from 'zustand'
import { principleById } from '../domain/data/principles'

/**
 * Lifetime record of which Wealth-Codex principles the player has *encountered
 * in play*. Persisted to localStorage so the Codex fills in across games — the
 * principles become a collection you complete by playing, not a static list.
 */

const KEY = 'cashflow_discovered_principles'

function load(): Record<string, true> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function persist(map: Record<string, true>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // storage unavailable — discovery just won't persist this session
  }
}

interface DiscoveryState {
  /** principleId → true for every principle ever encountered. */
  discovered: Record<string, true>
  /** Newly-discovered ids awaiting a toast (FIFO). */
  toastQueue: string[]
  /** Mark ids discovered; genuinely-new, real principles are queued for a toast unless `silent`. */
  discover: (ids: string[], silent?: boolean) => void
  /** Remove an id from the toast queue once shown. */
  clearToast: (id: string) => void
  /** Wipe lifetime progress (used by a Codex "reset" affordance). */
  reset: () => void
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  discovered: load(),
  toastQueue: [],
  discover: (ids, silent = false) => {
    const cur = get().discovered
    const fresh = ids.filter((id) => id && !cur[id] && principleById(id))
    if (fresh.length === 0) return
    const next = { ...cur }
    for (const id of fresh) next[id] = true
    persist(next)
    set({
      discovered: next,
      toastQueue: silent ? get().toastQueue : [...get().toastQueue, ...fresh],
    })
  },
  clearToast: (id) => set({ toastQueue: get().toastQueue.filter((x) => x !== id) }),
  reset: () => {
    persist({})
    set({ discovered: {}, toastQueue: [] })
  },
}))

/** Count of discovered principles that still exist in the catalog. */
export function discoveredCount(discovered: Record<string, true>): number {
  return Object.keys(discovered).filter((id) => principleById(id)).length
}
