/**
 * Stadium size, cosmetics, and paid extras (shop, roof, lights…).
 * Owns costs, seat counts, and matchday money bonuses.
 */
import type { Club, PitchStyle, Stadium, StadiumExtraId } from '../types/game.ts'
import { STADIUM_EXTRA_IDS } from '../types/game.ts'
import { STADIUM_COSTS, STADIUM_TIERS } from './constants.ts'

export type StadiumExtraInfo = {
  id: StadiumExtraId
  name: string
  cost: number
  bonus: number
  blurb: string
}

export const STADIUM_EXTRAS: StadiumExtraInfo[] = [
  { id: 'lights', name: 'Floodlights', cost: 90_000, bonus: 0.04, blurb: 'Night games. A bit more gate.' },
  { id: 'shop', name: 'Club shop', cost: 140_000, bonus: 0.08, blurb: 'Shirt sales on matchday.' },
  { id: 'screen', name: 'Big screen', cost: 200_000, bonus: 0.05, blurb: 'Fans stay for the replay.' },
  { id: 'museum', name: 'Club museum', cost: 180_000, bonus: 0.04, blurb: 'Tourists buy a ticket too.' },
  { id: 'hospitality', name: 'Hospitality boxes', cost: 320_000, bonus: 0.14, blurb: 'Pricier seats for rich fans.' },
  { id: 'roof', name: 'Roof', cost: 520_000, bonus: 0.08, blurb: 'Covered stands. More people come.' },
]

export function defaultStadium(clubName: string, standLevel: number, seatColor: string): Stadium {
  const base = clubName.replace(/\s+FC$/i, '').trim() || 'Harbor'
  return {
    name: `${base} Park`,
    standLevel,
    seatColor,
    pitchStyle: 'stripes',
    extras: standLevel >= 2 ? ['lights'] : [],
  }
}

export function stadiumCapacity(club: Club): number {
  return STADIUM_TIERS[club.stadium.standLevel] ?? STADIUM_TIERS[0]
}

export function hasExtra(stadium: Stadium, id: StadiumExtraId): boolean {
  return stadium.extras.includes(id)
}

export function extraBonus(stadium: Stadium): number {
  let bonus = 0
  for (const extra of STADIUM_EXTRAS) {
    if (hasExtra(stadium, extra.id)) bonus += extra.bonus
  }
  return bonus
}

export function nextStadiumCost(club: Club): number | null {
  const next = club.stadium.standLevel + 1
  if (next >= STADIUM_TIERS.length) return null
  return STADIUM_COSTS[next] ?? null
}

export function upgradeStadium(club: Club): Club {
  const cost = nextStadiumCost(club)
  if (cost == null || club.cash < cost) return club
  const standLevel = club.stadium.standLevel + 1
  return {
    ...club,
    cash: club.cash - cost,
    stadium: { ...club.stadium, standLevel },
  }
}

export function buyStadiumExtra(club: Club, extraId: StadiumExtraId): Club {
  const extra = STADIUM_EXTRAS.find((item) => item.id === extraId)
  if (!extra || hasExtra(club.stadium, extraId) || club.cash < extra.cost) return club
  return {
    ...club,
    cash: club.cash - extra.cost,
    stadium: { ...club.stadium, extras: [...club.stadium.extras, extraId] },
  }
}

export function isPitchStyle(value: unknown): value is PitchStyle {
  return value === 'plain' || value === 'stripes' || value === 'check'
}

export function isExtraId(value: unknown): value is StadiumExtraId {
  return typeof value === 'string' && (STADIUM_EXTRA_IDS as readonly string[]).includes(value)
}
