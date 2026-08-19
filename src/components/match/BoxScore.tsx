/**
 * After-match box score: goals, shots, saves, cards.
 * Owns the table; parent passes an already-built LastMatch.
 */
import { matchBox } from '../../game/matchBox.ts'
import type { LastMatch } from '../../types/game.ts'

export function BoxScore({ match }: { match: LastMatch }) {
  const box = matchBox(match)
  return (
    <div className="box-score">
      <p className="box-final">
        {match.homeName} {match.homeGoals}–{match.awayGoals} {match.awayName}
      </p>
      {box.goals.length ? (
        <ul className="box-goals">
          {box.goals.map((goal) => (
            <li key={`${goal.minute}-${goal.name}`}>
              {goal.minute}' {goal.name}
              <span className="muted"> {goal.side === 'home' ? match.homeName : match.awayName}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No goals.</p>
      )}
      <p className="box-line">
        Shots {box.homeShots}–{box.awayShots} · Saves {box.homeSaves}–{box.awaySaves} · Yellows{' '}
        {box.homeYellows}–{box.awayYellows}
      </p>
      {match.recap.slice(1).map((line) => (
        <p key={line} className="muted">
          {line}
        </p>
      ))}
    </div>
  )
}
