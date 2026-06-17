import { describe, it, expect, beforeEach } from 'vitest'
import { saveGame, loadGame, clearSave } from '../../utils/persistence'
import { makeGame } from '../fixtures'

const KEY = 'cashflow_save'

beforeEach(() => {
  localStorage.clear()
})

describe('saveGame / loadGame', () => {
  it('round-trips a game state through localStorage', () => {
    const game = makeGame()
    saveGame(game)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded!.id).toBe(game.id)
    expect(loaded!.players[0].name).toBe(game.players[0].name)
  })

  it('returns null when nothing is saved', () => {
    expect(loadGame()).toBeNull()
  })

  it('backfills missing history and turnLog with empty defaults', () => {
    const game = makeGame() as unknown as Record<string, unknown>
    delete game.history
    delete game.turnLog
    localStorage.setItem(KEY, JSON.stringify(game))
    const loaded = loadGame()!
    expect(loaded.history).toEqual({})
    expect(loaded.turnLog).toEqual([])
  })

  it('returns null for malformed JSON instead of throwing', () => {
    localStorage.setItem(KEY, 'not-valid-json{')
    expect(loadGame()).toBeNull()
  })
})

describe('clearSave', () => {
  it('removes a saved game', () => {
    saveGame(makeGame())
    clearSave()
    expect(loadGame()).toBeNull()
  })
})
