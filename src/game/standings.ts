/**
 * League table from played fixtures.
 * Owns standings sort (points, then goal difference, then goals scored).
 */
import type { Club, Division, Fixture } from '../types/game.ts'

export type TableRow = {
  clubId: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
}

export function standings(clubs: Club[], fixtures: Fixture[], division: Division): TableRow[] {
  const rows = new Map<string, TableRow>()
  for (const club of clubs.filter((c) => c.division === division)) {
    rows.set(club.id, {
      clubId: club.id,
      name: club.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    })
  }

  for (const fx of fixtures) {
    if (fx.division !== division || !fx.played || fx.homeGoals == null || fx.awayGoals == null) {
      continue
    }
    const home = rows.get(fx.homeId)
    const away = rows.get(fx.awayId)
    if (!home || !away) continue

    home.played += 1
    away.played += 1
    home.gf += fx.homeGoals
    home.ga += fx.awayGoals
    away.gf += fx.awayGoals
    away.ga += fx.homeGoals

    if (fx.homeGoals > fx.awayGoals) {
      home.won += 1
      away.lost += 1
      home.points += 3
    } else if (fx.homeGoals < fx.awayGoals) {
      away.won += 1
      home.lost += 1
      away.points += 3
    } else {
      home.drawn += 1
      away.drawn += 1
      home.points += 1
      away.points += 1
    }
  }

  const list = [...rows.values()].map((r) => ({ ...r, gd: r.gf - r.ga }))
  list.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name))
  return list
}

export function placeOf(rows: TableRow[], clubId: string): number {
  return rows.findIndex((r) => r.clubId === clubId) + 1
}
