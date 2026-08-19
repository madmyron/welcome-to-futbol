/**
 * League tables and this week’s fixtures.
 * Owns which league is open; standings math is elsewhere.
 */
import { useState } from 'react'
import { LeaguePyramid } from '../components/league/LeaguePyramid.tsx'
import { LeagueTable } from '../components/league/LeagueTable.tsx'
import { useGame } from '../context/useGame.ts'
import { HUMAN_CLUB_ID } from '../game/constants.ts'
import { getLeague } from '../game/leagues.ts'
import { clubName, humanClub } from '../game/selectors.ts'
import { standings } from '../game/standings.ts'
import type { Division } from '../types/game.ts'

export function TableScreen() {
  const { state } = useGame()
  const club = humanClub(state)
  const [div, setDiv] = useState<Division>(club.division)
  const rows = standings(state.clubs, state.fixtures, div)
  const weekGames = state.fixtures.filter((f) => f.week === state.week && f.division === div)
  const league = getLeague(div)

  return (
    <section className="stack">
      <LeaguePyramid selected={div} yourDivision={club.division} onPick={setDiv} />
      <article className="card">
        <h2>{league.name}</h2>
        <p className="muted">{league.rankLabel}{league.tag ? ` · ${league.tag}` : ''}</p>
        <LeagueTable rows={rows} division={div} />
      </article>
      <article className="card">
        <h2>
          Week {state.week} · {league.short}
        </h2>
        <ul className="fixture-list">
          {weekGames.map((f) => (
            <li key={f.id} className={f.homeId === HUMAN_CLUB_ID || f.awayId === HUMAN_CLUB_ID ? 'you' : ''}>
              <span>
                {clubName(state, f.homeId)} vs {clubName(state, f.awayId)}
              </span>
              <span>
                {f.played && f.homeGoals != null && f.awayGoals != null
                  ? `${f.homeGoals}–${f.awayGoals}`
                  : 'vs'}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
