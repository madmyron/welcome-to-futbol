/**
 * Builds one fake player at a quality band, with stats that differ inside a rating.
 * Owns ratings, wage, and position spread — not squad assembly.
 */
import { NATIONS } from '../data/countries.ts'
import { FIRST_NAMES, LAST_NAMES } from '../data/names.ts'
import type { Player, Position } from '../types/game.ts'
import { newId } from './ids.ts'
import { wageForOverall } from './money.ts'

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function jitter(base: number, spread: number): number {
  return clamp(base + randInt(-spread, spread), 28, 99)
}

export function generatePlayer(position: Position, minOvr: number, maxOvr: number): Player {
  const band = randInt(minOvr, maxOvr)
  let pace = jitter(band, 10)
  let skill = jitter(band, 10)
  let pass = jitter(band, 10)
  let defend = jitter(band, 10)
  let body = jitter(band, 10)

  if (position === 'GK') {
    const tall = Math.random() < 0.5
    body = jitter(band + (tall ? 14 : -10), 6)
    pace = jitter(band + (tall ? -12 : 12), 6)
    skill = jitter(band + randInt(-6, 10), 8)
    pass = jitter(band - 6, 12)
    defend = jitter(band, 8)
  } else if (position === 'DEF') {
    defend = jitter(band + 8, 6)
    pace = jitter(band + (Math.random() < 0.4 ? 10 : -8), 8)
    pass = jitter(band - 4, 12)
    body = jitter(band + 6, 8)
    skill = jitter(band, 10)
  } else if (position === 'MID') {
    pass = jitter(band + 8, 6)
    skill = jitter(band + (Math.random() < 0.4 ? 10 : -6), 8)
    defend = jitter(band, 12)
    pace = jitter(band, 10)
    body = jitter(band, 8)
  } else {
    skill = jitter(band + 8, 6)
    pace = jitter(band + (Math.random() < 0.45 ? 12 : -8), 8)
    body = jitter(band + (Math.random() < 0.4 ? 10 : -6), 8)
    pass = jitter(band - 2, 10)
    defend = jitter(band - 8, 10)
  }

  const overall =
    position === 'GK'
      ? Math.round(pace * 0.24 + skill * 0.22 + defend * 0.22 + body * 0.2 + pass * 0.12)
      : position === 'DEF'
        ? Math.round(defend * 0.32 + body * 0.18 + pace * 0.18 + pass * 0.16 + skill * 0.16)
        : position === 'MID'
          ? Math.round(pass * 0.28 + skill * 0.2 + defend * 0.18 + pace * 0.18 + body * 0.16)
          : Math.round(skill * 0.3 + pace * 0.26 + pass * 0.16 + body * 0.16 + defend * 0.12)

  const ovr = clamp(overall, 40, 99)
  const attack =
    position === 'GK' ? clamp(Math.round(pass * 0.7 + skill * 0.3), 20, 80) : clamp(Math.round(skill * 0.55 + pace * 0.3 + pass * 0.15), 30, 99)
  const defense =
    position === 'GK'
      ? clamp(Math.round(pace * 0.3 + skill * 0.25 + defend * 0.25 + body * 0.2), 30, 99)
      : clamp(Math.round(defend * 0.55 + body * 0.25 + pace * 0.2), 30, 99)

  const nation = pick(NATIONS)
  return {
    id: newId('p'),
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    country: nation.country,
    flag: nation.flag,
    position,
    pace,
    skill,
    pass,
    defend,
    body,
    form: randInt(48, 94),
    attack,
    defense,
    energy: randInt(88, 100),
    age: randInt(18, 34),
    overall: ovr,
    wage: wageForOverall(ovr),
  }
}

export function generateFreeAgents(): Player[] {
  const plan: { pos: Position; n: number }[] = [
    { pos: 'GK', n: 6 },
    { pos: 'DEF', n: 8 },
    { pos: 'MID', n: 8 },
    { pos: 'FWD', n: 8 },
  ]
  const players: Player[] = []
  for (const row of plan) {
    for (let i = 0; i < row.n; i += 1) {
      const bargain = i < 2
      const star = i === row.n - 1
      const min = bargain ? 48 : star ? 74 : 56
      const max = bargain ? 62 : star ? 86 : 76
      players.push(generatePlayer(row.pos, min, max))
    }
  }
  return players
}
