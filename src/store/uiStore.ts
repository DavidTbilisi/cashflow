import { create } from 'zustand'

export type AnimEvent =
  | { type: 'dice_roll'; values: [number, number] }
  | { type: 'pawn_move'; playerId: string; from: number; to: number; track: string }
  | { type: 'anchor_unlock'; anchorId: string }
  | { type: 'card_flip' }

interface UIState {
  animQueue: AnimEvent[]
  modalOpen: 'card' | 'necst' | 'leverage' | 'roadmap' | 'results' | null
  sidebarTab: 'balance' | 'cashflow' | 'assets'
  enqueueAnim: (event: AnimEvent) => void
  dequeueAnim: () => AnimEvent | undefined
  openModal: (m: UIState['modalOpen']) => void
  closeModal: () => void
  setSidebarTab: (tab: UIState['sidebarTab']) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  animQueue: [],
  modalOpen: null,
  sidebarTab: 'balance',
  enqueueAnim: (event) => set((s) => ({ animQueue: [...s.animQueue, event] })),
  dequeueAnim: () => {
    const [head, ...rest] = get().animQueue
    set({ animQueue: rest })
    return head
  },
  openModal: (m) => set({ modalOpen: m }),
  closeModal: () => set({ modalOpen: null }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
}))
