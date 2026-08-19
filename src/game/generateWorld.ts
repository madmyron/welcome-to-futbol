/**
 * Builds a new save: five leagues, fixtures, free agents, match charges.
 * Owns first-time setup; later seasons reuse clubs and only rebuild fixtures.
 */
import { CPU_CLUB_NAMES, DEFAULT_HUMAN_NAME } from '../data/clubNames.ts'
import type { Club, Division, GameState } from '../types/game.ts'
import { HUMAN_CLUB_ID, MAX_CHARGES, TEAMS_PER_DIVISION } from './constants.ts'
import { generateFixtures } from './fixtures.ts'
import { generateClub } from './generateClub.ts'
import { generateFreeAgents } from './generatePlayer.ts'
import { BOTTOM_DIVISION, DIVISIONS, getLeague, isDivision } from './leagues.ts'

function fixturesFor(clubs: Club[]) {
  return DIVISIONS.flatMap((div) => {
    const ids = clubs.filter((c) => c.division === div).map((c) => c.id)
    return generateFixtures(ids, div)
  })
}

export function createNewGame(): GameState {
  let nameIndex = 0
  const nextName = () => CPU_CLUB_NAMES[nameIndex++] ?? `Club ${nameIndex}`

  const human = generateClub({
    id: HUMAN_CLUB_ID,
    name: DEFAULT_HUMAN_NAME,
    isHuman: true,
    division: BOTTOM_DIVISION,
    minOvr: 50,
    maxOvr: 62,
  })

  const cpu: Club[] = []
  for (const league of DIVISIONS.map(getLeague)) {
    const cpuCount = league.id === BOTTOM_DIVISION ? TEAMS_PER_DIVISION - 1 : TEAMS_PER_DIVISION
    for (let i = 0; i < cpuCount; i += 1) {
      cpu.push(
        generateClub({
          name: nextName(),
          isHuman: false,
          division: league.id,
          minOvr: league.minOvr,
          maxOvr: league.maxOvr,
        }),
      )
    }
  }

  const clubs = [human, ...cpu]
  return {
    season: 1,
    week: 1,
    clubs,
    fixtures: fixturesFor(clubs),
    freeAgents: generateFreeAgents(),
    charges: MAX_CHARGES,
    nextChargeAt: 0,
    lastHumanFixtureId: null,
    lastMatch: null,
    watchingMatch: false,
    seasonReport: null,
    needsName: true,
    invites: [],
  }
}

export function expandToFiveLeagues(state: GameState): GameState {
  const distinct = new Set(state.clubs.map((c) => c.division))
  if (distinct.size >= 5 && state.clubs.length >= TEAMS_PER_DIVISION * 5) return state

  const remapped: Club[] = state.clubs.map((c) => {
    let division: Division = isDivision(c.division) ? c.division : BOTTOM_DIVISION
    if (division === 2 && new Set(state.clubs.map((x) => x.division)).size < 5) {
      division = BOTTOM_DIVISION
    }
    return { ...c, division }
  })
  const usedNames = new Set(remapped.map((c) => c.name))
  const unused = CPU_CLUB_NAMES.filter((n) => !usedNames.has(n))
  let nameIndex = 0
  const nextName = () => unused[nameIndex++] ?? `United ${nameIndex}`

  const clubs = [...remapped]
  for (const league of DIVISIONS.map(getLeague)) {
    while (clubs.filter((c) => c.division === league.id).length < TEAMS_PER_DIVISION) {
      clubs.push(
        generateClub({
          name: nextName(),
          isHuman: false,
          division: league.id,
          minOvr: league.minOvr,
          maxOvr: league.maxOvr,
        }),
      )
    }
  }

  return {
    ...state,
    week: 1,
    clubs,
    fixtures: fixturesFor(clubs),
    lastHumanFixtureId: null,
  }
}
