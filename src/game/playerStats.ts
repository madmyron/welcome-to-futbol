/**
 * Per-player stats, labels, and a one-line “why pick this one”.
 * Owns the meaning of pace/skill/pass/defend/body/form; screens only display them.
 */
import type { Player, Position } from '../types/game.ts'
import { hashToIndex } from './ids.ts'

export type StatKey = 'pace' | 'skill' | 'pass' | 'defend' | 'body'

const LABELS: Record<Position, Record<StatKey, string>> = {
  GK: { pace: 'Dive', skill: 'Hands', pass: 'Kick', defend: 'Read', body: 'Height' },
  DEF: { pace: 'Pace', skill: 'Jump', pass: 'Pass', defend: 'Tackle', body: 'Strength' },
  MID: { pace: 'Pace', skill: 'Shoot', pass: 'Pass', defend: 'Tackle', body: 'Stamina' },
  FWD: { pace: 'Pace', skill: 'Shoot', pass: 'Pass', defend: 'Press', body: 'Strength' },
}

export function statRows(player: Player): { key: StatKey; label: string; value: number }[] {
  const labels = LABELS[player.position]
  return (['pace', 'skill', 'pass', 'defend', 'body'] as const).map((key) => ({
    key,
    label: labels[key],
    value: player[key],
  }))
}

export function formWord(form: number): string {
  if (form >= 88) return 'On fire'
  if (form >= 75) return 'Hot'
  if (form >= 58) return 'Steady'
  if (form >= 45) return 'Cold'
  return 'Ice cold'
}

export function playerTag(player: Player): string {
  const { position: pos, pace, skill, pass, defend, body } = player
  if (pos === 'GK') {
    if (body >= 78 && pace <= body - 10) return 'Tall, slow diving side to side.'
    if (pace >= 78 && body <= pace - 8) return 'Quick across the goal, not a giant.'
    if (skill >= 80) return 'Safe hands.'
    if (pass >= 78) return 'Plays it out with his feet.'
    return 'All-round keeper.'
  }
  if (pos === 'DEF') {
    if (defend >= 78 && pace <= defend - 10) return 'Brick wall. Not a sprinter.'
    if (pace >= 78) return 'Recovers fast when beaten.'
    if (pass >= 76) return 'Comfortable on the ball.'
    return 'Solid at the back.'
  }
  if (pos === 'MID') {
    if (pass >= 80) return 'Picks a pass.'
    if (defend >= 76 && skill <= 68) return 'Breaks up play.'
    if (skill >= 76) return 'Arrives in the box.'
    return 'Box-to-box.'
  }
  if (body >= 78 && pace <= 68) return 'Target man. Not going to run in behind.'
  if (pace >= 80) return 'Stretches the defense.'
  if (skill >= 78) return 'Clinical in front of goal.'
  return 'Looks for space in the box.'
}

export function statsSummary(player: Player): string {
  const top = statRows(player)
    .slice()
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
  const a = top[0]
  const b = top[1]
  if (!a || !b) return formWord(player.form)
  return `${a.label} ${a.value} · ${b.label} ${b.value} · ${formWord(player.form)}`
}

export function withPlayerStats(player: Player): Player {
  if (
    typeof player.pace === 'number' &&
    typeof player.skill === 'number' &&
    typeof player.pass === 'number' &&
    typeof player.defend === 'number' &&
    typeof player.body === 'number' &&
    typeof player.form === 'number'
  ) {
    return player
  }
  const o = player.overall
  const wobble = (span: number, salt: number) => {
    const n = hashToIndex(`${player.id}:${salt}`, span * 2 + 1) - span
    return Math.max(28, Math.min(99, o + n))
  }
  const pace = player.pace ?? wobble(14, 1)
  const skill = player.skill ?? wobble(14, 2)
  const pass = player.pass ?? wobble(12, 3)
  const defend = player.defend ?? (player.position === 'GK' ? player.defense : wobble(12, 4))
  const body = player.body ?? wobble(14, 5)
  const form = player.form ?? 50 + hashToIndex(player.id, 41)
  return { ...player, pace, skill, pass, defend, body, form }
}
