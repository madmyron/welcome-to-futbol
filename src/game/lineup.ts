/**
 * Starting-11 rules for the club’s chosen formation.
 * Owns who is allowed on the pitch; squad screen calls this before Play.
 */
import type { Club, Player, Position } from '../types/game.ts'
import { getFormation, type FormationId, type FormationSlots } from './formations.ts'

export function slotsFor(club: Club): FormationSlots {
  return getFormation(club.formationId).slots
}

export function lineupPlayers(club: Club): Player[] {
  return club.lineupIds
    .map((id) => club.players.find((p) => p.id === id))
    .filter((p): p is Player => Boolean(p))
}

export function countByPosition(club: Club): Record<Position, number> {
  const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  for (const p of lineupPlayers(club)) {
    counts[p.position] += 1
  }
  return counts
}

export function lineupError(club: Club): string | null {
  const need = slotsFor(club)
  if (club.lineupIds.length !== 11) {
    return `Pick 11 players (now ${club.lineupIds.length})`
  }
  const counts = countByPosition(club)
  for (const pos of ['GK', 'DEF', 'MID', 'FWD'] as const) {
    if (counts[pos] !== need[pos]) {
      return `${getFormation(club.formationId).name} needs ${need[pos]} ${pos} (now ${counts[pos]})`
    }
  }
  return null
}

export function teamOverall(club: Club): number {
  const xi = lineupPlayers(club)
  if (!xi.length) return 0
  return Math.round(xi.reduce((sum, p) => sum + p.overall, 0) / xi.length)
}

export function autoLineup(players: Player[], need: FormationSlots): string[] {
  const used = new Set<string>()
  const ids: string[] = []
  const order: Position[] = ['GK', 'DEF', 'MID', 'FWD']
  for (const pos of order) {
    const pool = players
      .filter((p) => p.position === pos && !used.has(p.id))
      .sort((a, b) => b.overall - a.overall)
    for (const p of pool.slice(0, need[pos])) {
      used.add(p.id)
      ids.push(p.id)
    }
  }
  return ids
}

export function applyFormation(club: Club, formationId: FormationId): Club {
  const need = getFormation(formationId).slots
  return {
    ...club,
    formationId,
    lineupIds: autoLineup(club.players, need),
  }
}

export function startBlockedReason(club: Club, playerId: string): string | null {
  const player = club.players.find((p) => p.id === playerId)
  if (!player) return 'Player not found'
  if (club.lineupIds.includes(playerId)) return null
  if (club.lineupIds.length >= 11) return 'Starting 11 is full. Sit someone first.'
  const need = slotsFor(club)
  const counts = countByPosition(club)
  if (counts[player.position] >= need[player.position]) {
    const form = getFormation(club.formationId)
    return `${form.name} only starts ${need[player.position]} ${player.position}. Sit a ${player.position}, or pick a shape with more ${player.position}.`
  }
  return null
}

export function toggleLineup(club: Club, playerId: string): Club {
  const player = club.players.find((p) => p.id === playerId)
  if (!player) return club
  const selected = club.lineupIds.includes(playerId)
  if (selected) {
    return { ...club, lineupIds: club.lineupIds.filter((id) => id !== playerId) }
  }
  if (startBlockedReason(club, playerId)) return club
  return { ...club, lineupIds: [...club.lineupIds, playerId] }
}
