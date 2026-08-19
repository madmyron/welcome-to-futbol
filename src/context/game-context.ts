/**
 * React context for the live save (no UI).
 * Owns the context object so the provider and hook can live in separate files.
 */
import { createContext } from 'react'
import type { GameAction, GameState } from '../types/game.ts'

export type GameContextValue = {
  state: GameState
  now: number
  dispatch: (action: GameAction) => void
}

export const GameContext = createContext<GameContextValue | null>(null)
