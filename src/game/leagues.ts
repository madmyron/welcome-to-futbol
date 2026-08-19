/**
 * The five-league pyramid: names, rank, and money/quality by level.
 * Owns “which league is higher”; tables and season-end read this.
 */
import type { Division } from '../types/game.ts'

export const DIVISIONS = [1, 2, 3, 4, 5] as const
export const TOP_DIVISION = 1
export const BOTTOM_DIVISION = 5

export type LeagueInfo = {
  id: Division
  name: string
  short: string
  rankLabel: string
  tag: 'Top' | 'Bottom' | ''
  minOvr: number
  maxOvr: number
  stadiumTier: number
  ticketPrice: number
  prizeMult: number
}

export const LEAGUES: LeagueInfo[] = [
  {
    id: 1,
    name: 'Crown League',
    short: 'Crown',
    rankLabel: '1st of 5',
    tag: 'Top',
    minOvr: 76,
    maxOvr: 88,
    stadiumTier: 3,
    ticketPrice: 32,
    prizeMult: 2.1,
  },
  {
    id: 2,
    name: 'Gold League',
    short: 'Gold',
    rankLabel: '2nd of 5',
    tag: '',
    minOvr: 70,
    maxOvr: 80,
    stadiumTier: 2,
    ticketPrice: 26,
    prizeMult: 1.7,
  },
  {
    id: 3,
    name: 'Silver League',
    short: 'Silver',
    rankLabel: '3rd of 5',
    tag: '',
    minOvr: 64,
    maxOvr: 74,
    stadiumTier: 1,
    ticketPrice: 20,
    prizeMult: 1.4,
  },
  {
    id: 4,
    name: 'Iron League',
    short: 'Iron',
    rankLabel: '4th of 5',
    tag: '',
    minOvr: 58,
    maxOvr: 68,
    stadiumTier: 0,
    ticketPrice: 15,
    prizeMult: 1.15,
  },
  {
    id: 5,
    name: 'Harbor League',
    short: 'Harbor',
    rankLabel: '5th of 5',
    tag: 'Bottom',
    minOvr: 52,
    maxOvr: 64,
    stadiumTier: 0,
    ticketPrice: 12,
    prizeMult: 1,
  },
]

export function getLeague(division: Division): LeagueInfo {
  return LEAGUES.find((l) => l.id === division) ?? LEAGUES[4]!
}

export function leagueLine(division: Division): string {
  const l = getLeague(division)
  return l.tag ? `${l.name} · ${l.rankLabel} · ${l.tag.toLowerCase()}` : `${l.name} · ${l.rankLabel}`
}

export function promotionHint(division: Division): string {
  const here = getLeague(division)
  if (division === TOP_DIVISION) {
    return `This is the top. Bottom 3 drop to ${getLeague(2).name}.`
  }
  if (division === BOTTOM_DIVISION) {
    return `This is the bottom. Top 3 go up to ${getLeague(4).name}.`
  }
  return `Top 3 go up to ${getLeague((division - 1) as Division).name}. Bottom 3 drop to ${getLeague((division + 1) as Division).name}. You are in ${here.name}.`
}

export function isDivision(value: unknown): value is Division {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}
