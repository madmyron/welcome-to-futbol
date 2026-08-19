/**
 * Tappable league pyramid, top to bottom.
 * Owns the rank drawing; Table screen passes which league is open.
 */
import { LEAGUES } from '../../game/leagues.ts'
import type { Division } from '../../types/game.ts'

export function LeaguePyramid({
  selected,
  yourDivision,
  onPick,
}: {
  selected: Division
  yourDivision: Division
  onPick: (id: Division) => void
}) {
  return (
    <article className="card">
      <h2>The pyramid</h2>
      <p className="muted">Top of the list is the top league. You start at the bottom.</p>
      <div className="pyramid">
        {LEAGUES.map((league) => {
          const yours = league.id === yourDivision
          const on = league.id === selected
          return (
            <button
              key={league.id}
              type="button"
              className={`pyramid-btn tier-${league.id}${on ? ' on' : ''}${yours ? ' yours' : ''}`}
              onClick={() => onPick(league.id)}
            >
              <span>
                {league.name}
                {yours ? ' · you' : ''}
              </span>
              <span className="pyramid-tag">
                {league.tag || league.rankLabel}
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}
