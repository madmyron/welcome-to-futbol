/**
 * First-run name your club overlay.
 * Owns the form; dispatching NAME_CLUB is the parent’s job via useGame.
 */
import { useState } from 'react'
import { DEFAULT_HUMAN_NAME } from '../../data/clubNames.ts'
import { useGame } from '../../context/useGame.ts'
import { humanClub } from '../../game/selectors.ts'

export function NameClubModal() {
  const { state, dispatch } = useGame()
  const club = humanClub(state)
  const [name, setName] = useState(club.name || DEFAULT_HUMAN_NAME)

  if (!state.needsName) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-labelledby="name-club-title">
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault()
          dispatch({ type: 'NAME_CLUB', name })
        }}
      >
        <h2 id="name-club-title">Name your club</h2>
        <p className="muted">You can change this later on the Club screen.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          autoFocus
          aria-label="Club name"
        />
        <button type="submit" className="btn primary">
          Let’s play
        </button>
      </form>
    </div>
  )
}
