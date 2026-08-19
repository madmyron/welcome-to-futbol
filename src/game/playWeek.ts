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
      lastMatch = {
        week: fx.week,
        homeName: home.name,
        awayName: away.name,
        homeGoals: result.homeGoals ?? 0,
        awayGoals: result.awayGoals ?? 0,
        recap: result.recap ?? [],
        events: result.events ?? [],
        homeCrest: home.crest,
        awayCrest: away.crest,
        money,
      }
      clubs = clubs.map((c) => {
        if (c.id !== HUMAN_CLUB_ID) return c
        return applyMatchDiscipline(applyEnergy({ ...c, cash: c.cash + money.net }), result.events ?? [])
      })
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
