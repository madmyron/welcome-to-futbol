/**
 * Round-robin home-and-away fixture list for a 10-team division.
 * Owns the calendar shape (18 weeks, 5 games a week).
 */
import type { Division, Fixture } from '../types/game.ts'
import { newId } from './ids.ts'

export function generateFixtures(teamIds: string[], division: Division): Fixture[] {
  const n = teamIds.length
  if (n % 2 !== 0) {
    throw new Error('Need an even number of teams')
  }
  const rotation = [...teamIds]
  const firstHalf: Fixture[] = []
  const weeks = n - 1

  for (let week = 1; week <= weeks; week += 1) {
    for (let i = 0; i < n / 2; i += 1) {
      const a = rotation[i]!
      const b = rotation[n - 1 - i]!
      const homeFirst = i % 2 === 0
      firstHalf.push({
        id: newId('fx'),
        week,
        division,
        homeId: homeFirst ? a : b,
        awayId: homeFirst ? b : a,
        played: false,
      })
    }
    const last = rotation.pop()!
    rotation.splice(1, 0, last)
  }

  const secondHalf: Fixture[] = firstHalf.map((f) => ({
    ...f,
    id: newId('fx'),
    week: f.week + weeks,
    homeId: f.awayId,
    awayId: f.homeId,
  }))

  return [...firstHalf, ...secondHalf]
}
