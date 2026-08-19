/**
 * Matchday cash: tickets, merch, extras, prize, and wages.
 * Owns money in and out for one week for the human club.
 */
import type { Club, Fixture, MatchMoney } from '../types/game.ts'
import { getLeague } from './leagues.ts'
import { hasExtra, stadiumCapacity } from './stadium.ts'

function ticketPrice(division: Club['division']): number {
  return getLeague(division).ticketPrice
}

export function weekWages(club: Club): number {
  return club.players.reduce((sum, p) => sum + p.wage, 0)
}

export function matchdayReport(
  club: Club,
  fixture: Fixture,
  homeGoals: number,
  awayGoals: number,
): MatchMoney {
  const home = fixture.homeId === club.id
  const scored = home ? homeGoals : awayGoals
  const conceded = home ? awayGoals : homeGoals
  const result: MatchMoney['result'] = scored > conceded ? 'win' : scored === conceded ? 'draw' : 'loss'
  const wages = weekWages(club)
  const price = ticketPrice(club.division)
  const prizeMult = getLeague(club.division).prizeMult
  const stadium = club.stadium

  if (!home) {
    const appearance = 18_000
    const winnings = result === 'win' ? 12_000 : result === 'draw' ? 4_000 : 0
    const merch = hasExtra(stadium, 'shop') ? 2_800 : 0
    const net = appearance + winnings + merch - wages
    return {
      home: false,
      result,
      attendance: 0,
      tickets: 0,
      merch,
      hospitality: 0,
      concessions: 0,
      tours: 0,
      winnings,
      appearance,
      wages,
      net,
    }
  }

  const crowd = result === 'win' ? 1.08 : result === 'draw' ? 1 : 0.9
  const fill =
    0.82 * crowd * (hasExtra(stadium, 'roof') ? 1.08 : 1) * (hasExtra(stadium, 'lights') ? 1.04 : 1)
  const attendance = Math.round(stadiumCapacity(club) * Math.min(0.98, fill))
  const tickets = Math.round(attendance * price)
  const merch = hasExtra(stadium, 'shop') ? Math.round(tickets * 0.1) : 0
  const hospitality = hasExtra(stadium, 'hospitality') ? Math.round(tickets * 0.16) : 0
  const concessions = Math.round(tickets * (hasExtra(stadium, 'screen') ? 0.06 : 0.02))
  const tours = hasExtra(stadium, 'museum') ? Math.round(tickets * 0.05) : 0
  const winnings =
    result === 'win' ? Math.round(22_000 * prizeMult) : result === 'draw' ? Math.round(7_000 * prizeMult) : 0
  const net = tickets + merch + hospitality + concessions + tours + winnings - wages
  return {
    home: true,
    result,
    attendance,
    tickets,
    merch,
    hospitality,
    concessions,
    tours,
    winnings,
    appearance: 0,
    wages,
    net,
  }
}

export function matchdayCash(club: Club, fixture: Fixture, homeGoals: number, awayGoals: number): number {
  return matchdayReport(club, fixture, homeGoals, awayGoals).net
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
