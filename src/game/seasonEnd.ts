/**
 * Season wrap: prize money, promotion/relegation, Crown Cup, new fixtures.
 * Owns the jump from week 18 into the next season.
 */
import type { Club, Division, GameState, SeasonReport } from '../types/game.ts'
import { HUMAN_CLUB_ID, TEAMS_PER_DIVISION } from './constants.ts'
import { resetSeasonYellows } from './cards.ts'
import { restSquad } from './economy.ts'
import { generateFixtures } from './fixtures.ts'
import { generateFreeAgents } from './generatePlayer.ts'
import { BOTTOM_DIVISION, DIVISIONS, getLeague, TOP_DIVISION } from './leagues.ts'
import { placeOf, standings } from './standings.ts'

function prizeFor(place: number, division: Division, crownChampion: boolean): number {
  const table = [0, 420_000, 260_000, 160_000, 90_000, 70_000, 55_000, 45_000, 40_000, 35_000, 30_000]
  const base = table[place] ?? 30_000
  const leaguePrize = Math.round(base * getLeague(division).prizeMult)
  return crownChampion ? leaguePrize + 750_000 : leaguePrize
}

export function endSeason(state: GameState): GameState {
  const human = state.clubs.find((c) => c.id === HUMAN_CLUB_ID)!
  const table = standings(state.clubs, state.fixtures, human.division)
  const place = placeOf(table, HUMAN_CLUB_ID)
  const crownTable = standings(state.clubs, state.fixtures, TOP_DIVISION)
  const crownWinnerId = crownTable[0]?.clubId ?? null
  const crownChampion = crownWinnerId === HUMAN_CLUB_ID
  const prize = prizeFor(place, human.division, crownChampion)

  const nextDiv = new Map<string, Division>()
  for (const club of state.clubs) {
    nextDiv.set(club.id, club.division)
  }
  for (const div of DIVISIONS) {
    const rows = standings(state.clubs, state.fixtures, div)
    if (div < BOTTOM_DIVISION) {
      for (const row of rows.slice(-3)) {
        nextDiv.set(row.clubId, (div + 1) as Division)
      }
    }
    if (div > TOP_DIVISION) {
      for (const row of rows.slice(0, 3)) {
        nextDiv.set(row.clubId, (div - 1) as Division)
      }
    }
  }

  const clubs: Club[] = state.clubs.map((c) => {
    const division = nextDiv.get(c.id) ?? c.division
    const withRest = restSquad({ ...c, division })
    const players = withRest.players.map(resetSeasonYellows)
    const wonCup = crownWinnerId === c.id
    const crownCups = (c.crownCups ?? 0) + (wonCup ? 1 : 0)
    if (c.id === HUMAN_CLUB_ID) {
      return { ...withRest, players, cash: c.cash + prize, crownCups }
    }
    return { ...withRest, players, crownCups }
  })

  const after = nextDiv.get(HUMAN_CLUB_ID) ?? human.division
  const humanAfter = clubs.find((c) => c.id === HUMAN_CLUB_ID)!
  const report: SeasonReport = {
    season: state.season,
    division: human.division,
    place,
    promoted: after < human.division,
    relegated: after > human.division,
    prize,
    crownChampion,
    crownCups: humanAfter.crownCups,
  }

  const fixtures = DIVISIONS.flatMap((div) => {
    const ids = clubs.filter((c) => c.division === div).map((c) => c.id)
    if (ids.length !== TEAMS_PER_DIVISION) return []
    return generateFixtures(ids, div)
  })

  return {
    ...state,
    season: state.season + 1,
    week: 1,
    clubs,
    fixtures,
    freeAgents: generateFreeAgents(),
    lastHumanFixtureId: null,
    seasonReport: report,
  }
}
