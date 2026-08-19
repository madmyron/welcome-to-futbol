/**
 * Holds the live save and ticks match charges.
 * Owns the live game state for the whole app.
 */
import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { applyRecharge } from '../game/charges.ts'
import { gameReducer } from '../game/reducer.ts'
import { loadGame, saveGame } from '../game/storage.ts'
import type { GameAction, GameState } from '../types/game.ts'
import { GameContext } from './game-context.ts'

function reduceAndSave(state: GameState, action: GameAction): GameState {
  const next = gameReducer(state, action)
  if (next !== state) saveGame(next)
  return next
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduceAndSave, undefined, loadGame)
  const [now, setNow] = useState(() => Date.now())
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const persist = () => saveGame(stateRef.current)
    const onHide = () => {
      if (document.visibilityState === 'hidden') persist()
    }
    window.addEventListener('pagehide', persist)
    window.addEventListener('beforeunload', persist)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      persist()
      window.removeEventListener('pagehide', persist)
      window.removeEventListener('beforeunload', persist)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  const live = useMemo(() => applyRecharge(state, now), [state, now])
  const value = useMemo(() => ({ state: live, now, dispatch }), [live, now])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
