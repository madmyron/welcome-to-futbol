/**
 * Premier League-style bookings: two yellows in one match = red,
 * yellows add up across games, reds mean you sit the next match(es).
 * Owns bans; match events only describe what happened.
 */
import type { Club, MatchEvent, Player } from '../types/game.ts'

export function yellowsOf(player: Player): number {
  return Math.max(0, player.yellows ?? 0)
}

export function banGamesOf(player: Player): number {
  return Math.max(0, player.banGames ?? 0)
}

export function isSuspended(player: Player): boolean {
  return banGamesOf(player) > 0
}

export function banLabel(player: Player): string | null {
  const n = banGamesOf(player)
  if (n <= 0) return null
  return n === 1 ? 'Suspended — misses next match' : `Suspended — misses next ${n} matches`
}

/** Extra matches to sit when the season yellow tally crosses a PL threshold. */
export function yellowThresholdBan(before: number, after: number): number {
  let extra = 0
  if (before < 5 && after >= 5) extra += 1
  if (before < 10 && after >= 10) extra += 2
  if (before < 15 && after >= 15) extra += 3
  return extra
}

function addYellows(player: Player, count: number): Player {
  const before = yellowsOf(player)
  const after = before + count
  return {
    ...player,
    yellows: after,
    banGames: banGamesOf(player) + yellowThresholdBan(before, after),
  }
}

export function sitSuspended(club: Club): Club {
  const keep = club.lineupIds.filter((id) => {
    const player = club.players.find((p) => p.id === id)
    return player ? !isSuspended(player) : false
  })
  if (keep.length === club.lineupIds.length) return club
  return { ...club, lineupIds: keep }
}

export function resetSeasonYellows(player: Player): Player {
  return { ...player, yellows: 0 }
}

/**
 * After a played match: serve existing bans for anyone who sat,
 * then add new yellows/reds from this game.
 */
export function applyMatchDiscipline(club: Club, events: MatchEvent[]): Club {
  const satOut = new Set(club.players.filter(isSuspended).map((p) => p.id))
  const mine = new Set(club.players.map((p) => p.id))

  let players = club.players.map((p) => {
    if (!satOut.has(p.id)) return p
    return { ...p, banGames: Math.max(0, banGamesOf(p) - 1) }
  })

  for (const event of events) {
    const id = event.playerId
    if (!id || !mine.has(id) || satOut.has(id)) continue
    players = players.map((p) => {
      if (p.id !== id) return p
      if (event.kind === 'card') return addYellows(p, 1)
      if (event.kind === 'red' && event.card === 'straight-red') {
        return { ...p, banGames: banGamesOf(p) + 3 }
      }
      if (event.kind === 'red') {
        const booked = addYellows(p, 1)
        return { ...booked, banGames: banGamesOf(booked) + 1 }
      }
      return p
    })
  }

  return sitSuspended({ ...club, players })
}
