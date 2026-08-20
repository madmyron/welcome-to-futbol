/**
 * Builds one club: squad, kits, crest, and a starting 11.
 * Owns club assembly; world setup places clubs into divisions.
 */
import { COLOR_PAIRS } from '../data/colors.ts'
import {
  CREST_EMBLEMS,
  CREST_FILLS,
  CREST_SHAPES,
  KIT_PATTERNS,
  type Club,
  type Division,
  type Kit,
  type Player,
} from '../types/game.ts'
import { STARTING_CASH } from './constants.ts'
import { FORMATION_IDS } from '../types/game.ts'
import { DEFAULT_FORMATION, getFormation } from './formations.ts'
import { generatePlayer } from './generatePlayer.ts'
import { newId } from './ids.ts'
import { getLeague } from './leagues.ts'
import { autoLineup } from './lineup.ts'
import { defaultStadium } from './stadium.ts'

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!
}

function randomKit(): Kit {
  const pair = pick(COLOR_PAIRS)
  return { ...pair, pattern: pick(KIT_PATTERNS) }
}

export function generateClub(opts: {
  name: string
  isHuman: boolean
  division: Division
  minOvr: number
  maxOvr: number
  id?: string
}): Club {
  const formationId = opts.isHuman ? DEFAULT_FORMATION : pick(FORMATION_IDS)
  const players: Player[] = [
    generatePlayer('GK', opts.minOvr, opts.maxOvr),
    generatePlayer('GK', opts.minOvr - 4, opts.maxOvr - 2),
    ...Array.from({ length: 6 }, () => generatePlayer('DEF', opts.minOvr, opts.maxOvr)),
    ...Array.from({ length: 6 }, () => generatePlayer('MID', opts.minOvr, opts.maxOvr)),
    ...Array.from({ length: 4 }, () => generatePlayer('FWD', opts.minOvr, opts.maxOvr)),
  ]
  const home = randomKit()
  const awayPair = pick(COLOR_PAIRS.filter((c) => c.primary !== home.primary))
  const away: Kit = { ...awayPair, pattern: pick(KIT_PATTERNS) }

  const league = getLeague(opts.division)
  return {
    id: opts.id ?? newId('club'),
    name: opts.name,
    isHuman: opts.isHuman,
    division: opts.division,
    cash: opts.isHuman ? STARTING_CASH : STARTING_CASH + Math.round(Math.random() * 400_000),
    stadium: defaultStadium(opts.name, league.stadiumTier, home.primary),
    homeKit: home,
    awayKit: away,
    crest: {
      shape: pick(CREST_SHAPES),
      emblem: pick(CREST_EMBLEMS),
      fill: pick(CREST_FILLS),
      background: home.primary,
      background2: home.secondary,
      emblemColor: home.secondary,
      frame: '#e8c547',
    },
    players,
    lineupIds: autoLineup(players, getFormation(formationId).slots),
    formationId,
    crownCups: 0,
  }
}
