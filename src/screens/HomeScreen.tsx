/**
 * Home: next opponent, play button, last recap, match charges.
 * Owns the toilet-session front door — play or leave.
 */
import { InviteFriends } from '../components/club/InviteFriends.tsx'
import { ChargeMeter } from '../components/match/ChargeMeter.tsx'
import { MatchRecap } from '../components/match/MatchRecap.tsx'
import { useGame } from '../context/useGame.ts'
import { WEEKS_PER_SEASON } from '../game/constants.ts'
import { getLeague } from '../game/leagues.ts'
import { lineupError, xiPower } from '../game/lineup.ts'
import { clubById, clubName, humanClub, nextHumanFixture, opponentOf } from '../game/selectors.ts'
import { stadiumCapacity } from '../game/stadium.ts'
import { standings, placeOf } from '../game/standings.ts'

export function HomeScreen({ onSquad, onMarket }: { onSquad: () => void; onMarket: () => void }) {
  const { state, now, dispatch } = useGame()
  const club = humanClub(state)
  const next = nextHumanFixture(state)
  const last = state.lastMatch
  const table = standings(state.clubs, state.fixtures, club.division)
  const place = placeOf(table, club.id)
  const problem = lineupError(club)
  const canPlay = state.charges >= 1 && !problem && next
  const opp = next ? clubById(state, opponentOf(next)) : undefined
  const youPower = xiPower(club)
  const themPower = opp ? xiPower(opp) : 0
  const youFavored = youPower > themPower + 12
  const themFavored = themPower > youPower + 12

  return (
    <section className="stack">
      <ChargeMeter state={state} now={now} />

      <article className="card next-card">
        <p className="eyebrow">
          Season {state.season} · Match {Math.min(state.week, WEEKS_PER_SEASON)} of {WEEKS_PER_SEASON}
        </p>
        {next ? (
          <>
            <h2>
              {next.homeId === club.id ? 'Home vs' : 'Away vs'} {clubName(state, opponentOf(next))}
            </h2>
            <p className="matchup-power">
              <span>
                {club.name} <span className="pwr">{youPower}</span>
              </span>
              <span className="muted">vs</span>
              <span>
                {opp?.name ?? 'Opponent'} <span className="pwr">{themPower}</span>
              </span>
            </p>
            <p className={youFavored ? 'ok' : themFavored ? 'warn' : 'muted'}>
              {youFavored
                ? 'You are favored to win'
                : themFavored
                  ? 'They are favored to win'
                  : 'This one looks even'}
            </p>
            <p className="muted">
              {place ? `${place}` : '—'} in {getLeague(club.division).name} ({getLeague(club.division).rankLabel}
              {getLeague(club.division).tag ? ` · ${getLeague(club.division).tag}` : ''}) ·{' '}
              {stadiumCapacity(club).toLocaleString()} seats
            </p>
          </>
        ) : (
          <h2>No match left this season</h2>
        )}
        <button
          type="button"
          className="btn play"
          disabled={!canPlay}
          onClick={() => dispatch({ type: 'PLAY_WEEK', now: Date.now() })}
        >
          Play match
        </button>
        {problem ? (
          <p className="warn">
            {problem}.{' '}
            <button type="button" className="link" onClick={onSquad}>
              Fix squad
            </button>
          </p>
        ) : null}
        {state.charges < 1 ? <p className="muted">Wait for a match charge, or fill charges to test.</p> : null}
      </article>

      {last ? <MatchRecap match={last} onWatch={() => dispatch({ type: 'WATCH_MATCH' })} /> : null}

      <InviteFriends />

      <article className="card">
        <h2>How to improve</h2>
        <p className="muted">
          A season is {WEEKS_PER_SEASON} matches — you play each of the other 9 clubs home and away.
        </p>
        <ul className="howto">
          <li>
            Buy higher-rated players on{' '}
            <button type="button" className="link" onClick={onMarket}>
              Market
            </button>
            . Sit low-energy players on Squad. Starters who play well can rise in power; bad games can drop them.
          </li>
          <li>
            Win matches for ticket money. On Club, expand stands or upgrade the shop, museum, and other extras — each
            level pays more next home game.
          </li>
          <li>
            Two yellows in one match is a red — that player misses the next match. Yellows add up: 5 in a season is
            also a one-match ban (Premier League style).
          </li>
          <li>
            Finish top 3 to go up a league. Bottom 3 go down. Crown League is the top; Harbor League is the bottom
            (where you start).
          </li>
        </ul>
      </article>

      <button type="button" className="btn ghost" onClick={() => dispatch({ type: 'FILL_CHARGES' })}>
        Fill charges (test)
      </button>
    </section>
  )
}
