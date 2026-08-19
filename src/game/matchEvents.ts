/**
 * Turns a final score into minute-by-minute match action.
 * Owns commentary text; the score itself comes from the match sim.
 */
import type { Club, MatchEvent, Player } from '../types/game.ts'
import { isSuspended } from './cards.ts'
import { lineupPlayers } from './lineup.ts'

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function attacker(players: Player[]): Player {
  const pool = players.filter((p) => p.position === 'FWD' || p.position === 'MID')
  const from = pool.length ? pool : players
  if (!from.length) {
    return { id: 'ghost', name: 'A substitute', position: 'MID' } as Player
  }
  return pick(from)
}

function keeper(players: Player[]): Player {
  return players.find((p) => p.position === 'GK') ?? players[0]!
}

function uniqueMinutes(count: number, used: Set<number>): number[] {
  const out: number[] = []
  let guard = 0
  while (out.length < count && guard < 80) {
    guard += 1
    const m = randInt(3, 90)
    if (m === 45 || used.has(m)) continue
    used.add(m)
    out.push(m)
  }
  return out.sort((a, b) => a - b)
}

function eligibleXi(club: Club): Player[] {
  return lineupPlayers(club).filter((p) => !isSuspended(p))
}

function pushBooking(
  events: MatchEvent[],
  minute: number,
  side: 'home' | 'away',
  xi: Player[],
  yellows: Map<string, number>,
  sentOff: Set<string>,
): void {
  const onPitch = xi.filter((p) => !sentOff.has(p.id))
  if (!onPitch.length) return

  const alreadyBooked = onPitch.filter((p) => (yellows.get(p.id) ?? 0) >= 1)
  let booked: Player
  if (alreadyBooked.length && Math.random() < 0.42) {
    booked = pick(alreadyBooked)
  } else {
    const defs = onPitch.filter((p) => p.position === 'DEF')
    booked = defs.length && Math.random() < 0.65 ? pick(defs) : pick(onPitch)
  }

  const prior = yellows.get(booked.id) ?? 0
  if (prior >= 1) {
    yellows.set(booked.id, 2)
    sentOff.add(booked.id)
    events.push({
      minute,
      kind: 'red',
      side,
      playerId: booked.id,
      playerName: booked.name,
      card: 'second-yellow',
      text: `Second yellow — RED. ${booked.name} is sent off and misses the next match`,
    })
    return
  }

  if (Math.random() < 0.08) {
    sentOff.add(booked.id)
    events.push({
      minute,
      kind: 'red',
      side,
      playerId: booked.id,
      playerName: booked.name,
      card: 'straight-red',
      text: `RED CARD — ${booked.name}. Three-match ban`,
    })
    return
  }

  yellows.set(booked.id, 1)
  events.push({
    minute,
    kind: 'card',
    side,
    playerId: booked.id,
    playerName: booked.name,
    card: 'yellow',
    text: `Yellow card — ${booked.name}`,
  })
}

export function buildMatchEvents(
  home: Club,
  away: Club,
  homeGoals: number,
  awayGoals: number,
): MatchEvent[] {
  const homeXi = eligibleXi(home)
  const awayXi = eligibleXi(away)
  const used = new Set<number>([0, 45, 90])
  const events: MatchEvent[] = [
    { minute: 0, kind: 'kickoff', side: 'none', text: 'Kickoff' },
    { minute: 45, kind: 'ht', side: 'none', text: 'Halftime' },
    { minute: 90, kind: 'ft', side: 'none', text: 'Full time' },
  ]

  for (const minute of uniqueMinutes(homeGoals, used)) {
    const scorer = attacker(homeXi)
    events.push({
      minute,
      kind: 'goal',
      side: 'home',
      playerName: scorer.name,
      text: `GOAL! ${scorer.name} (${home.name})`,
    })
  }
  for (const minute of uniqueMinutes(awayGoals, used)) {
    const scorer = attacker(awayXi)
    events.push({
      minute,
      kind: 'goal',
      side: 'away',
      playerName: scorer.name,
      text: `GOAL! ${scorer.name} (${away.name})`,
    })
  }

  const yellows = new Map<string, number>()
  const sentOff = new Set<string>()
  const extras = 6 + randInt(0, 4)
  for (const minute of uniqueMinutes(extras, used)) {
    const homeAttack = Math.random() < 0.5
    const atkXi = homeAttack ? homeXi : awayXi
    const defXi = homeAttack ? awayXi : homeXi
    const side = homeAttack ? 'home' : 'away'
    const roll = Math.random()
    if (roll < 0.36) {
      const shooter = attacker(atkXi)
      events.push({
        minute,
        kind: 'shot',
        side,
        playerName: shooter.name,
        text: `${shooter.name} fires over the bar`,
      })
    } else if (roll < 0.68) {
      const shotBy = attacker(atkXi)
      const gk = keeper(defXi)
      events.push({
        minute,
        kind: 'save',
        side,
        playerName: gk.name,
        text: `${gk.name} saves from ${shotBy.name}`,
      })
    } else {
      const bookedSide = homeAttack ? 'away' : 'home'
      const bookedXi = homeAttack ? awayXi : homeXi
      pushBooking(events, minute, bookedSide, bookedXi, yellows, sentOff)
    }
  }

  events.sort((a, b) => a.minute - b.minute || kindOrder(a.kind) - kindOrder(b.kind))
  return events
}

function kindOrder(kind: MatchEvent['kind']): number {
  if (kind === 'kickoff') return 0
  if (kind === 'ht') return 1
  if (kind === 'ft') return 3
  return 2
}
