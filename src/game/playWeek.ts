/**
 * Plays every fixture in the current week, then advances or ends the season.
 * Owns the “tap Play” loop; match sim and money helpers do the messy parts.
 */
import type { Club, GameState, LastMatch } from '../types/game.ts'
import { HUMAN_CLUB_ID, WEEKS_PER_SEASON } from './constants.ts'
import { applyMatchDiscipline } from './cards.ts'
import { applyEnergy, matchdayReport } from './economy.ts'
import { generateFreeAgents } from './generatePlayer.ts'
import { lineupError } from './lineup.ts'
import { matchDebrief } from './matchDebrief.ts'
import { applyMatchRatings } from './playerRatings.ts'
import { simulateMatch } from './matchSim.ts'
import { endSeason } from './seasonEnd.ts'

function clubById(clubs: Club[], id: string): Club {
  const club = clubs.find((c) => c.id === id)
  if (!club) throw new Error(`Missing club ${id}`)
  return club
}

export function playWeek(state: GameState): GameState {
  const human = clubById(state.clubs, HUMAN_CLUB_ID)
  const lineupProblem = lineupError(human)
  if (lineupProblem) return state

  let clubs = state.clubs
  let lastHumanFixtureId: string | null = state.lastHumanFixtureId
  let lastMatch: LastMatch | null = state.lastMatch
  const fixtures = state.fixtures.map((fx) => {
    if (fx.week !== state.week || fx.played) return fx
    const home = clubById(clubs, fx.homeId)
    const away = clubById(clubs, fx.awayId)
    const result = simulateMatch(home, away)
    if (fx.homeId === HUMAN_CLUB_ID || fx.awayId === HUMAN_CLUB_ID) {
      lastHumanFixtureId = fx.id
      const money = matchdayReport(human, fx, result.homeGoals ?? 0, result.awayGoals ?? 0)
      const ourGoals = fx.homeId === HUMAN_CLUB_ID ? result.homeGoals ?? 0 : result.awayGoals ?? 0
      const theirGoals = fx.homeId === HUMAN_CLUB_ID ? result.awayGoals ?? 0 : result.homeGoals ?? 0
      const them = fx.homeId === HUMAN_CLUB_ID ? away : home
      const ourSide = fx.homeId === HUMAN_CLUB_ID ? 'home' : 'away'
      const events = result.events ?? []
      const humanNow = clubById(clubs, HUMAN_CLUB_ID)
      const afterCash = applyEnergy({ ...humanNow, cash: humanNow.cash + money.net })
      const afterCards = applyMatchDiscipline(afterCash, events)
      const rated = applyMatchRatings(afterCards, events, ourSide, ourGoals, theirGoals)
      clubs = clubs.map((c) => (c.id === HUMAN_CLUB_ID ? rated.club : c))
      lastMatch = {
        week: fx.week,
        homeName: home.name,
        awayName: away.name,
        homeGoals: result.homeGoals ?? 0,
        awayGoals: result.awayGoals ?? 0,
        recap: result.recap ?? [],
        events,
        homeCrest: home.crest,
        awayCrest: away.crest,
        money,
        debrief: matchDebrief({
          us: human,
          them,
          home: fx.homeId === HUMAN_CLUB_ID,
          ourGoals,
          theirGoals,
          events,
        }),
        ratingMoves: rated.moves,
      }
    }
    return { ...fx, played: true, ...result }
  })

  if (state.week >= WEEKS_PER_SEASON) {
    return endSeason({ ...state, clubs, fixtures, lastHumanFixtureId, lastMatch })
  }

  return {
    ...state,
    clubs,
    fixtures,
    lastHumanFixtureId,
    lastMatch,
    week: state.week + 1,
    freeAgents: generateFreeAgents(),
  }
}
