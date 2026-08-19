/**
 * Fills missing fields on old local saves (country, crest emblem, last match).
 * Owns one-way upgrades so an existing club is not wiped.
 */
import { NATIONS } from '../data/countries.ts'
import {
  CREST_EMBLEMS,
  CREST_FILLS,
  KIT_PATTERNS,
  type Club,
  type Crest,
  type CrestEmblem,
  type CrestFill,
  type FormationId,
  type GameState,
  type KitPattern,
  type Player,
  type Stadium,
} from '../types/game.ts'
import { expandToFiveLeagues } from './generateWorld.ts'
import { generateFreeAgents } from './generatePlayer.ts'
import { DEFAULT_FORMATION, isFormationId } from './formations.ts'
import { hashToIndex } from './ids.ts'
import { withPlayerStats } from './playerStats.ts'
import { defaultStadium, isExtraId, isPitchStyle } from './stadium.ts'

function isPattern(value: string): value is KitPattern {
  return (KIT_PATTERNS as readonly string[]).includes(value)
}

function isEmblem(value: unknown): value is CrestEmblem {
  return typeof value === 'string' && (CREST_EMBLEMS as readonly string[]).includes(value)
}

function isFill(value: unknown): value is CrestFill {
  return typeof value === 'string' && (CREST_FILLS as readonly string[]).includes(value)
}

function migrateCrest(raw: Crest & { primary?: string; secondary?: string }): Crest {
  const emblem = isEmblem(raw.emblem) ? raw.emblem : CREST_EMBLEMS[0]!
  return {
    shape: raw.shape ?? 'shield',
    emblem,
    fill: isFill(raw.fill) ? raw.fill : 'linear',
    background: raw.background ?? raw.primary ?? '#1e3a8a',
    background2: raw.background2 ?? raw.secondary ?? '#e8c547',
    emblemColor: raw.emblemColor ?? '#e8c547',
    frame: raw.frame ?? '#e8c547',
  }
}

function migratePlayer(player: Player): Player {
  let next = player
  if (!player.country || !player.flag) {
    const nation = NATIONS[hashToIndex(player.id, NATIONS.length)]!
    next = { ...player, country: nation.country, flag: nation.flag }
  }
  return withPlayerStats(next)
}

function migrateStadium(club: Club & { stadiumTier?: number; stadium?: Stadium }): Stadium {
  const fallbackLevel = typeof club.stadiumTier === 'number' ? club.stadiumTier : 0
  const base = defaultStadium(club.name, club.stadium?.standLevel ?? fallbackLevel, club.homeKit.primary)
  if (!club.stadium) return base
  return {
    ...base,
    ...club.stadium,
    name: club.stadium.name || base.name,
    standLevel: club.stadium.standLevel ?? fallbackLevel,
    seatColor: club.stadium.seatColor || base.seatColor,
    pitchStyle: isPitchStyle(club.stadium.pitchStyle) ? club.stadium.pitchStyle : 'stripes',
    extras: (club.stadium.extras ?? []).filter(isExtraId),
  }
}

function migrateClub(club: Club): Club {
  const homePattern = isPattern(club.homeKit.pattern) ? club.homeKit.pattern : 'solid'
  const awayPattern = isPattern(club.awayKit.pattern) ? club.awayKit.pattern : 'stripes'
  const formationId: FormationId = isFormationId(club.formationId) ? club.formationId : DEFAULT_FORMATION
  return {
    ...club,
    formationId,
    homeKit: { ...club.homeKit, pattern: homePattern },
    awayKit: { ...club.awayKit, pattern: awayPattern },
    crest: migrateCrest(club.crest),
    stadium: migrateStadium(club),
    players: club.players.map(migratePlayer),
  }
}

export function migrateSave(state: GameState): GameState {
  const agents = state.freeAgents.map(migratePlayer)
  const upgraded = {
    ...state,
    clubs: state.clubs.map(migrateClub),
    freeAgents: agents.length < 20 ? generateFreeAgents() : agents,
    lastMatch: state.lastMatch
      ? {
          ...state.lastMatch,
          homeCrest: migrateCrest(state.lastMatch.homeCrest),
          awayCrest: migrateCrest(state.lastMatch.awayCrest),
        }
      : null,
    watchingMatch: false,
    invites: Array.isArray(state.invites) ? state.invites : [],
  }
  return expandToFiveLeagues(upgraded)
}
