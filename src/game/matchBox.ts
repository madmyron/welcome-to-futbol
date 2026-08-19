/**
 * Box score from a finished match’s event list.
 * Owns the counts; MatchWatch and Home only display them.
 */
import type { LastMatch, MatchEvent } from '../types/game.ts'

export type GoalLine = {
  minute: number
  side: 'home' | 'away'
  name: string
}

export type MatchBox = {
  homeShots: number
  awayShots: number
  homeSaves: number
  awaySaves: number
  homeYellows: number
  awayYellows: number
  homeReds: number
  awayReds: number
  goals: GoalLine[]
}

function sideOf(event: MatchEvent): 'home' | 'away' | null {
  return event.side === 'home' || event.side === 'away' ? event.side : null
}

function scorerName(event: MatchEvent): string {
  if (event.playerName) return event.playerName
  const fromGoal = event.text.match(/^GOAL!\s+(.+?)\s+\(/)
  return fromGoal?.[1] ?? event.text
}

export function matchBox(match: LastMatch): MatchBox {
  const box: MatchBox = {
    homeShots: 0,
    awayShots: 0,
    homeSaves: 0,
    awaySaves: 0,
    homeYellows: 0,
    awayYellows: 0,
    homeReds: 0,
    awayReds: 0,
    goals: [],
  }
  for (const event of match.events) {
    const side = sideOf(event)
    if (!side) continue
    if (event.kind === 'goal' || event.kind === 'shot' || event.kind === 'save') {
      if (side === 'home') box.homeShots += 1
      else box.awayShots += 1
    }
    if (event.kind === 'save') {
      if (side === 'home') box.awaySaves += 1
      else box.homeSaves += 1
    }
    if (event.kind === 'card') {
      if (side === 'home') box.homeYellows += 1
      else box.awayYellows += 1
    }
    if (event.kind === 'red') {
      if (side === 'home') box.homeReds += 1
      else box.awayReds += 1
    }
    if (event.kind === 'goal') {
      box.goals.push({ minute: event.minute, side, name: scorerName(event) })
    }
  }
  box.goals.sort((a, b) => a.minute - b.minute)
  return box
}
