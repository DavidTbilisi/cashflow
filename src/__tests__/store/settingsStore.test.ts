import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '../../store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({ soundEnabled: true, animSpeed: 'normal', theme: 'dark' })
})

describe('settingsStore', () => {
  it('starts with sensible defaults', () => {
    const s = useSettingsStore.getState()
    expect(s.soundEnabled).toBe(true)
    expect(s.animSpeed).toBe('normal')
    expect(s.theme).toBe('dark')
  })

  it('toggles sound on and off', () => {
    useSettingsStore.getState().toggleSound()
    expect(useSettingsStore.getState().soundEnabled).toBe(false)
    useSettingsStore.getState().toggleSound()
    expect(useSettingsStore.getState().soundEnabled).toBe(true)
  })

  it('sets the animation speed', () => {
    useSettingsStore.getState().setAnimSpeed('fast')
    expect(useSettingsStore.getState().animSpeed).toBe('fast')
  })

  it('sets the theme', () => {
    useSettingsStore.getState().setTheme('light')
    expect(useSettingsStore.getState().theme).toBe('light')
  })
})
