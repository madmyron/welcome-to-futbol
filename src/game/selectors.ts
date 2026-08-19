/**
 * Read-only helpers the screens use (human club, next match, last recap).
 * Owns lookups so UI files don’t hunt through arrays.
 */
import type { Club, Fixture, GameState } from '../types/game.ts'
import { HUMAN_CLUB_ID } from './constants.ts'

export function humanClub(state: GameState): Club {
  const club = state.clubs.find((c) => c.id === HUMAN_CLUB_ID)
  if (!club) throw new Error('Human club missing')
  return club
}

export function clubById(state: GameState, id: string): Club | undefined {
  return state.clubs.find((c) => c.id === id)
}

export function clubName(state: GameState, id: string): string {
  return clubById(state, id)?.name ?? 'Unknown'
}

export function nextHumanFixture(state: GameState): Fixture | null {
  const upcoming = state.fixtures
    .filter((f) => !f.played && (f.homeId === HUMAN_CLUB_ID || f.awayId === HUMAN_CLUB_ID))
    .sort((a, b) => a.week - b.week)
  return upcoming[0] ?? null
}

export function lastHumanFixture(state: GameState): Fixture | null {
  if (!state.lastHumanFixtureId) return null
  return state.fixtures.find((f) => f.id === state.lastHumanFixtureId) ?? null
}

export function opponentOf(fixture: Fixture): string {
  return fixture.homeId === HUMAN_CLUB_ID ? fixture.awayId : fixture.homeId
}
