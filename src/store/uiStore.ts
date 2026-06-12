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
  helpOpen: boolean
  enqueueAnim: (event: AnimEvent) => void
  dequeueAnim: () => AnimEvent | undefined
  openModal: (m: UIState['modalOpen']) => void
  closeModal: () => void
  setSidebarTab: (tab: UIState['sidebarTab']) => void
  toggleHelp: () => void
  setHelp: (open: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  animQueue: [],
  modalOpen: null,
  sidebarTab: 'balance',
  helpOpen: false,
  enqueueAnim: (event) => set((s) => ({ animQueue: [...s.animQueue, event] })),
  dequeueAnim: () => {
    const [head, ...rest] = get().animQueue
    set({ animQueue: rest })
    return head
  },
  openModal: (m) => set({ modalOpen: m }),
  closeModal: () => set({ modalOpen: null }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
  setHelp: (open) => set({ helpOpen: open }),
}))
