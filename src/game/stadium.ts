/**
 * Stadium size, cosmetics, and paid extras (shop, roof, lights…).
 * Owns costs, seat counts, extra levels, and matchday money bonuses.
 */
import type { Club, PitchStyle, Stadium, StadiumExtraId } from '../types/game.ts'
import { STADIUM_EXTRA_IDS } from '../types/game.ts'
import { MAX_EXTRA_LEVEL, STADIUM_COSTS, STADIUM_TIERS } from './constants.ts'

export type StadiumExtraInfo = {
  id: StadiumExtraId
  name: string
  cost: number
  blurb: string
  earn: string
  tiers: readonly [string, string, string, string, string]
}

const COST_MULT = [1, 1.7, 2.75, 4.4, 7] as const

export const STADIUM_EXTRAS: StadiumExtraInfo[] = [
  {
    id: 'lights',
    name: 'Floodlights',
    cost: 90_000,
    blurb: 'Night games. More fans show up.',
    earn: 'Bigger crowd',
    tiers: ['Poles', 'Floodlights', 'LED banks', 'Broadcast lights', 'Arena lights'],
  },
  {
    id: 'shop',
    name: 'Club shop',
    cost: 140_000,
    blurb: 'Shirts and scarves on matchday.',
    earn: 'Merch',
    tiers: ['Kiosk', 'Club shop', 'Superstore', 'Megastore', 'Flagship store'],
  },
  {
    id: 'screen',
    name: 'Big screen',
    cost: 200_000,
    blurb: 'Fans stay for food and the replay.',
    earn: 'Concessions',
    tiers: ['Scoreboard', 'Big screen', 'Corner screens', 'Ribbon boards', 'Full wrap'],
  },
  {
    id: 'museum',
    name: 'Club museum',
    cost: 180_000,
    blurb: 'Tourists buy a ticket too.',
    earn: 'Tours',
    tiers: ['Trophy case', 'Club museum', 'Hall of fame', 'Heritage centre', 'National collection'],
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    cost: 320_000,
    blurb: 'Pricier seats and boxes.',
    earn: 'Hospitality',
    tiers: ['Lounge', 'Boxes', 'Club level', 'Executive suite', 'Directors’ wing'],
  },
  {
    id: 'roof',
    name: 'Roof',
    cost: 520_000,
    blurb: 'Covered stands. More people come.',
    earn: 'Bigger crowd',
    tiers: ['Dugout cover', 'Main stand roof', 'Two-stand roof', 'Three-stand roof', 'Full bowl roof'],
  },
]

export function extraLevel(stadium: Stadium, id: StadiumExtraId): number {
  const fromMap = stadium.extraLevels?.[id]
  if (typeof fromMap === 'number' && fromMap > 0) {
    return Math.min(MAX_EXTRA_LEVEL, Math.floor(fromMap))
  }
  if (stadium.extras?.includes(id)) return 1
  return 0
}

export function extraLevelsOf(stadium: Stadium): Partial<Record<StadiumExtraId, number>> {
  const levels: Partial<Record<StadiumExtraId, number>> = {}
  for (const id of STADIUM_EXTRA_IDS) {
    const n = extraLevel(stadium, id)
    if (n > 0) levels[id] = n
  }
  return levels
}

export function extrasFromLevels(levels: Partial<Record<StadiumExtraId, number>>): StadiumExtraId[] {
  return STADIUM_EXTRA_IDS.filter((id) => (levels[id] ?? 0) > 0)
}

export function extraUpgradeCost(id: StadiumExtraId, nextLevel: number): number | null {
  if (nextLevel < 1 || nextLevel > MAX_EXTRA_LEVEL) return null
  const extra = STADIUM_EXTRAS.find((item) => item.id === id)
  if (!extra) return null
  return Math.round(extra.cost * COST_MULT[nextLevel - 1]!)
}

export function extraTierName(id: StadiumExtraId, level: number): string {
  const extra = STADIUM_EXTRAS.find((item) => item.id === id)
  if (!extra || level < 1) return extra?.name ?? id
  return extra.tiers[Math.min(MAX_EXTRA_LEVEL, level) - 1] ?? extra.name
}

export function withExtraLevels(stadium: Stadium): Stadium {
  const extraLevels = extraLevelsOf(stadium)
  return { ...stadium, extraLevels, extras: extrasFromLevels(extraLevels) }
}

export function defaultStadium(clubName: string, standLevel: number, seatColor: string): Stadium {
  const base = clubName.replace(/\s+FC$/i, '').trim() || 'Harbor'
  const extraLevels: Partial<Record<StadiumExtraId, number>> = standLevel >= 2 ? { lights: 1 } : {}
  return {
    name: `${base} Park`,
    standLevel,
    seatColor,
    pitchStyle: 'stripes',
    extraLevels,
    extras: extrasFromLevels(extraLevels),
  }
}

export function stadiumCapacity(club: Club): number {
  return STADIUM_TIERS[club.stadium.standLevel] ?? STADIUM_TIERS[0]
}

export function hasExtra(stadium: Stadium, id: StadiumExtraId): boolean {
  return extraLevel(stadium, id) > 0
}

/** Rough extra gate from extras, for the Club screen summary. */
export function extraBonus(stadium: Stadium): number {
  let bonus = 0
  bonus += extraLevel(stadium, 'shop') * 0.07
  bonus += extraLevel(stadium, 'museum') * 0.04
  bonus += extraLevel(stadium, 'hospitality') * 0.12
  bonus += extraLevel(stadium, 'screen') * 0.03
  bonus += extraLevel(stadium, 'roof') * 0.04
  bonus += extraLevel(stadium, 'lights') * 0.02
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
    stadium: withExtraLevels({ ...club.stadium, standLevel }),
  }
}

export function buyStadiumExtra(club: Club, extraId: StadiumExtraId): Club {
  const current = extraLevel(club.stadium, extraId)
  if (current >= MAX_EXTRA_LEVEL) return club
  const cost = extraUpgradeCost(extraId, current + 1)
  if (cost == null || club.cash < cost) return club
  const extraLevels = { ...extraLevelsOf(club.stadium), [extraId]: current + 1 }
  return {
    ...club,
    cash: club.cash - cost,
    stadium: withExtraLevels({ ...club.stadium, extraLevels }),
  }
}

export function isPitchStyle(value: unknown): value is PitchStyle {
  return value === 'plain' || value === 'stripes' || value === 'check'
}

export function isExtraId(value: unknown): value is StadiumExtraId {
  return typeof value === 'string' && (STADIUM_EXTRA_IDS as readonly string[]).includes(value)
}
