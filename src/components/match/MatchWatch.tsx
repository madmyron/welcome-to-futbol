/**
 * Live match overlay: scoreboard plus action as the minutes tick.
 * Owns the watch-along playback; skip jumps to full time.
 */
import { useEffect, useState, type CSSProperties } from 'react'
import { MATCH_GOAL_TICK_MS, MATCH_TICK_MS } from '../../game/constants.ts'
import { useGame } from '../../context/useGame.ts'
import { ClubCrest } from '../crest/ClubCrest.tsx'
import { BoxScore } from './BoxScore.tsx'
import './match-watch.css'

function WinFireworks() {
  return (
    <div className="win-fireworks" aria-hidden>
      {Array.from({ length: 5 }, (_, burst) => (
        <span key={burst} className="fw-burst" style={{ '--b': burst } as CSSProperties}>
          {Array.from({ length: 10 }, (_, spark) => (
            <i key={spark} style={{ '--s': spark } as CSSProperties} />
          ))}
        </span>
      ))}
    </div>
  )
}

function tickMs(kind: string | undefined): number {
  if (kind === 'goal' || kind === 'red') return MATCH_GOAL_TICK_MS
  if (kind === 'ht' || kind === 'ft') return 2200
  return MATCH_TICK_MS
}

export function MatchWatch() {
  const { state, dispatch } = useGame()
  const match = state.lastMatch
  const [shown, setShown] = useState(1)

  useEffect(() => {
    if (!match) return
    if (shown >= match.events.length) return
    const current = match.events[shown - 1]
    const id = window.setTimeout(() => setShown((n) => n + 1), tickMs(current?.kind))
    return () => window.clearTimeout(id)
  }, [match, shown])

  if (!match) return null

  const visible = match.events.slice(0, shown)
  const homeGoals = visible.filter((e) => e.kind === 'goal' && e.side === 'home').length
  const awayGoals = visible.filter((e) => e.kind === 'goal' && e.side === 'away').length
  const latest = visible[visible.length - 1]
  const done = shown >= match.events.length

  return (
    <div className="watch-backdrop" role="dialog" aria-labelledby="watch-title">
        {done && match.money?.result === 'win' ? <WinFireworks /> : null}
        <div className={`watch-panel ${done && match.money?.result === 'win' ? 'win' : ''}`}>
        <p className="eyebrow" id="watch-title">
          Week {match.week}
        </p>
        <div className="watch-score">
          <div className="watch-side">
            <ClubCrest crest={match.homeCrest} size={44} titles={match.homeCrownCups ?? 0} />
            <span>{match.homeName}</span>
          </div>
          <strong>
            {done ? `${match.homeGoals}–${match.awayGoals}` : `${homeGoals}–${awayGoals}`}
          </strong>
          <div className="watch-side">
            <ClubCrest crest={match.awayCrest} size={44} titles={match.awayCrownCups ?? 0} />
            <span>{match.awayName}</span>
          </div>
        </div>
        {done ? (
          <BoxScore match={match} />
        ) : (
          <>
            <div className="watch-pitch">
              <p className="watch-minute">{latest ? `${latest.minute}'` : ''}</p>
              <p className={`watch-line kind-${latest?.kind ?? 'kickoff'}`}>{latest?.text}</p>
            </div>
            <ol className="watch-feed">
              {visible
                .slice()
                .reverse()
                .slice(0, 4)
                .map((event, i) => (
                  <li key={`${event.minute}-${event.text}-${i}`}>
                    <span>{event.minute}'</span> {event.text}
                  </li>
                ))}
            </ol>
          </>
        )}
        {done ? (
          <button type="button" className="btn primary" onClick={() => dispatch({ type: 'DISMISS_MATCH_WATCH' })}>
            Done
          </button>
        ) : (
          <button type="button" className="btn ghost" onClick={() => setShown(match.events.length)}>
            Skip to recap
          </button>
        )}
      </div>
    </div>
  )
}
