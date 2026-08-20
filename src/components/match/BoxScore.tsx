/**
 * After-match box score: goals, shots, saves, cards, and money.
 * Owns the table; parent passes an already-built LastMatch.
 */
import { matchBox } from '../../game/matchBox.ts'
import type { LastMatch } from '../../types/game.ts'
import { MatchPayout } from './MatchPayout.tsx'

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
        {box.homeReds || box.awayReds ? ` · Reds ${box.homeReds}–${box.awayReds}` : ''}
      </p>
      {match.debrief?.length ? (
        <div className="debrief">
          <h3 className="group-title">How we did</h3>
          {match.debrief.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : (
        match.recap.slice(1).map((line) => (
          <p key={line} className="muted">
            {line}
          </p>
        ))
      )}
      {match.ratingMoves?.length ? (
        <div className="rating-moves">
          <h3 className="group-title">Power swings</h3>
          <ul>
            {match.ratingMoves.map((move) => (
              <li key={move.playerId}>
                <span>
                  {move.name} <span className="muted">{move.position}</span>
                </span>
                <span className={move.delta > 0 ? 'ok' : 'warn'}>
                  {move.from} → {move.to} ({move.delta > 0 ? '+' : ''}
                  {move.delta})
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {match.money ? <MatchPayout money={match.money} /> : null}
    </div>
  )
}
