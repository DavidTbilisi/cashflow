import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  soundEnabled: boolean
  animSpeed: 'slow' | 'normal' | 'fast'
  theme: 'dark' | 'light'
  toggleSound: () => void
  setAnimSpeed: (s: SettingsState['animSpeed']) => void
  setTheme: (t: SettingsState['theme']) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      animSpeed: 'normal',
      theme: 'dark',
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setAnimSpeed: (animSpeed) => set({ animSpeed }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'cashflow_settings' },
  ),
)
