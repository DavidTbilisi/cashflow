// Note: this module provides pure helper functions used by gameStore.ts.
// The main turn state machine lives in gameStore.ts dispatch() to keep it synchronous.
// This file exposes the move-calculation helpers for reuse and testing.

import { diceTotal } from './diceService'
import type { GameState, PlayerState } from '../entities/types'

export function computeNewPosition(
  player: PlayerState,
  roll: number[],
  state: GameState,
): number {
  const spaces = state.boardSpaces.filter((s) => s.track === player.boardTrack)
  return (player.boardPosition + diceTotal(roll)) % spaces.length
}

export function advanceToNextPlayer(state: GameState): GameState {
  const next = (state.currentPlayerIndex + 1) % state.players.length
  const newRound = next === 0 ? state.round + 1 : state.round
  return {
    ...state,
    currentPlayerIndex: next,
    currentTurnPhase: 'idle',
    round: newRound,
    turn: state.turn + 1,
    lastDiceRoll: null,
  }
}
