/**
 * Matchday cash: tickets, wages, and a small result bonus.
 * Owns money in and out for one week for the human club.
 */
import type { Club, Fixture } from '../types/game.ts'
import { getLeague } from './leagues.ts'
import { extraBonus, stadiumCapacity } from './stadium.ts'

function ticketPrice(division: Club['division']): number {
  return getLeague(division).ticketPrice
}

export function weekWages(club: Club): number {
  return club.players.reduce((sum, p) => sum + p.wage, 0)
}

export function matchdayCash(club: Club, fixture: Fixture, homeGoals: number, awayGoals: number): number {
  const humanHome = fixture.homeId === club.id
  const scored = humanHome ? homeGoals : awayGoals
  const conceded = humanHome ? awayGoals : homeGoals
  const win = scored > conceded
  const draw = scored === conceded
  const resultMult = win ? 1.18 : draw ? 1 : 0.86

  const homeGate = Math.round(
    stadiumCapacity(club) * 0.82 * ticketPrice(club.division) * resultMult * (1 + extraBonus(club.stadium)),
  )
  const awayShare = Math.round(18_000 + (win ? 12_000 : draw ? 4_000 : 0))
  const tickets = humanHome ? homeGate : awayShare
  const wages = weekWages(club)
  return tickets - wages
}

export function applyEnergy(club: Club): Club {
  if (!club.isHuman) return club
  const starters = new Set(club.lineupIds)
  const players = club.players.map((p) => {
    if (starters.has(p.id)) {
      return { ...p, energy: Math.max(42, p.energy - 12) }
    }
    return { ...p, energy: Math.min(100, p.energy + 8) }
  })
  return { ...club, players }
}

export function restSquad(club: Club): Club {
  return { ...club, players: club.players.map((p) => ({ ...p, energy: 100 })) }
}
