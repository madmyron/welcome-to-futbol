/**
 * After a match, starters’ form and overall can rise or fall.
 * Owns rating swings; playWeek applies them to the human squad.
 */
import type { Club, MatchEvent, Player, Position } from '../types/game.ts'
import { wageForOverall } from './money.ts'

export type RatingMove = {
  playerId: string
  name: string
  position: Position
  delta: number
  from: number
  to: number
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

function scoreForPlayer(
  player: Player,
  events: MatchEvent[],
  ourGoals: number,
  theirGoals: number,
): number {
  let score = 0
  if (ourGoals > theirGoals) score += 2
  else if (ourGoals === theirGoals) score += 0
  else score -= 2

  if (theirGoals === 0 && (player.position === 'GK' || player.position === 'DEF')) score += 2
  if (theirGoals >= 3 && (player.position === 'GK' || player.position === 'DEF')) score -= 2
  if (ourGoals === 0 && (player.position === 'FWD' || player.position === 'MID')) score -= 1
  if (ourGoals >= 3 && (player.position === 'FWD' || player.position === 'MID')) score += 1

  for (const event of events) {
    const mine =
      event.playerId === player.id || (!event.playerId && event.playerName === player.name)
    if (!mine) continue
    if (event.kind === 'goal') score += 3
    if (event.kind === 'shot') score += 0.5
    if (event.kind === 'save') score += 1.5
    if (event.kind === 'card') score -= 1
    if (event.kind === 'red') score -= 4
  }

  return score
}

function bumpStats(player: Player, delta: number): Player {
  if (delta === 0) return player
  const keys =
    player.position === 'GK'
      ? (['skill', 'pace', 'defend', 'body'] as const)
      : player.position === 'DEF'
        ? (['defend', 'body', 'pace'] as const)
        : player.position === 'MID'
          ? (['pass', 'skill', 'defend'] as const)
          : (['skill', 'pace', 'pass'] as const)
  const next = { ...player }
  for (const key of keys) {
    next[key] = clamp(next[key] + delta, 28, 99)
  }
  next.attack = clamp(next.attack + delta, 20, 99)
  next.defense = clamp(next.defense + delta, 20, 99)
  return next
}

function applyDelta(player: Player, score: number): { player: Player; delta: number } {
  const formDelta = clamp(Math.round(score * 2.2), -10, 12)
  const form = clamp(player.form + formDelta, 28, 99)

  let ovrDelta = 0
  if (score >= 5) ovrDelta = 1
  else if (score >= 3 && Math.random() < 0.55) ovrDelta = 1
  else if (score <= -5) ovrDelta = -1
  else if (score <= -3 && Math.random() < 0.55) ovrDelta = -1
  else if (form >= 90 && player.overall < 92 && Math.random() < 0.35) ovrDelta = 1
  else if (form <= 38 && player.overall > 48 && Math.random() < 0.35) ovrDelta = -1

  // Hot form can push a second tick after a goal-heavy night.
  if (score >= 7 && ovrDelta === 1 && Math.random() < 0.2) ovrDelta = 2
  if (score <= -7 && ovrDelta === -1 && Math.random() < 0.2) ovrDelta = -2

  const overall = clamp(player.overall + ovrDelta, 40, 99)
  let next = bumpStats({ ...player, form, overall }, ovrDelta)
  next = { ...next, wage: wageForOverall(overall) }
  return { player: next, delta: overall - player.overall }
}

/**
 * Starters who played for the human club: form/overall drift from the result and actions.
 * Bench cools slightly toward steady form; no overall change.
 */
export function applyMatchRatings(
  club: Club,
  events: MatchEvent[],
  _ourSide: 'home' | 'away',
  ourGoals: number,
  theirGoals: number,
): { club: Club; moves: RatingMove[] } {
  if (!club.isHuman) return { club, moves: [] }
  const starters = new Set(club.lineupIds)
  const moves: RatingMove[] = []

  const players = club.players.map((p) => {
    if (!starters.has(p.id)) {
      const form = clamp(p.form + (p.form < 55 ? 2 : p.form > 75 ? -1 : 0), 28, 99)
      return { ...p, form }
    }
    const score = scoreForPlayer(p, events, ourGoals, theirGoals)
    const { player, delta } = applyDelta(p, score)
    if (delta !== 0) {
      moves.push({
        playerId: p.id,
        name: p.name,
        position: p.position,
        delta,
        from: p.overall,
        to: player.overall,
      })
    }
    return player
  })

  moves.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.delta - a.delta)
  return { club: { ...club, players }, moves }
}
