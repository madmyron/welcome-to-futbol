/**
 * Local save on this device (phone or computer, not yet shared).
 * Owns localStorage read/write; cloud login is a later milestone.
 */
import type { GameState } from '../types/game.ts'
import { SAVE_KEY } from './constants.ts'
import { createNewGame } from './generateWorld.ts'
import { migrateSave } from './migrateSave.ts'

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return createNewGame()
    const parsed = JSON.parse(raw) as GameState
    if (!parsed?.clubs?.length || !parsed.fixtures) return createNewGame()
    const migrated = migrateSave(parsed)
    saveGame(migrated)
    return migrated
  } catch {
    return createNewGame()
  }
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    // Private mode / full disk — keep playing in memory.
  }
}
