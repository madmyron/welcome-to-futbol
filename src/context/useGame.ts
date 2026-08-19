/**
 * Hook screens use to read the save and fire actions.
 * Owns the “missing provider” guard.
 */
import { use } from 'react'
import { GameContext } from './game-context.ts'

export function useGame() {
  const ctx = use(GameContext)
  if (!ctx) throw new Error('useGame must be inside GameProvider')
  return ctx
}
