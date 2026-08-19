/**
 * Last-match score, box score, and two-line story.
 * Owns recap layout only.
 */
import type { LastMatch } from '../../types/game.ts'
import { BoxScore } from './BoxScore.tsx'

export function MatchRecap({
  match,
  onWatch,
}: {
  match: LastMatch
  onWatch: () => void
}) {
  if (!match.recap.length) return null
  return (
    <article className="card recap">
      <h2>Last match</h2>
      <BoxScore match={match} />
      {match.events.length ? (
        <button type="button" className="btn small" onClick={onWatch}>
          Watch again
        </button>
      ) : null}
    </article>
  )
}
