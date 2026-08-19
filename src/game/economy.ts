/**
 * Matchday cash: tickets, merch, extras, prize, and wages.
 * Owns money in and out for one week for the human club.
 */
import type { Club, Fixture, MatchMoney } from '../types/game.ts'
import { extraLevel, extraLevelsOf, stadiumCapacity } from './stadium.ts'
import { getLeague } from './leagues.ts'

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
  const standLevel = stadium.standLevel
  const levels = extraLevelsOf(stadium)
  const shop = extraLevel(stadium, 'shop')
  const museum = extraLevel(stadium, 'museum')
  const boxes = extraLevel(stadium, 'hospitality')
  const screen = extraLevel(stadium, 'screen')
  const roof = extraLevel(stadium, 'roof')
  const lights = extraLevel(stadium, 'lights')

  if (!home) {
    const appearance = 18_000 + standLevel * 2_200
    const winnings = result === 'win' ? 12_000 : result === 'draw' ? 4_000 : 0
    const merch = shop > 0 ? 1_800 + shop * 1_400 : 0
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
      standLevel,
      extraLevels: levels,
    }
  }

  const crowd = result === 'win' ? 1.08 : result === 'draw' ? 1 : 0.9
  const fill = Math.min(
    0.98,
    0.78 * crowd * (1 + standLevel * 0.025) * (1 + roof * 0.035) * (1 + lights * 0.018),
  )
  const attendance = Math.round(stadiumCapacity(club) * fill)
  const ticketRate = price * (1 + standLevel * 0.045)
  const tickets = Math.round(attendance * ticketRate)
  const merch = shop > 0 ? Math.round(tickets * (0.055 + shop * 0.035)) : 0
  const hospitality = boxes > 0 ? Math.round(tickets * (0.09 + boxes * 0.045)) : 0
  const concessions = Math.round(tickets * (0.012 * (standLevel + 1) + screen * 0.028))
  const tours = museum > 0 ? Math.round(tickets * (0.028 + museum * 0.022)) : 0
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
    standLevel,
    extraLevels: levels,
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
