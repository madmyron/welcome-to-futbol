/**
 * Two or three lines after a match: what went well, what slipped, what to fix.
 * Owns the wording; the box score only displays it.
 */
import type { Club, MatchEvent, Position } from '../types/game.ts'
import { lineupPlayers } from './lineup.ts'

const POS_WORD: Record<Position, string> = {
  GK: 'goalkeeper',
  DEF: 'defense',
  MID: 'midfield',
  FWD: 'attack',
}

function avgOvr(club: Club, pos: Position): number {
  const pool = lineupPlayers(club).filter((p) => p.position === pos)
  if (!pool.length) return 0
  return pool.reduce((sum, p) => sum + p.overall, 0) / pool.length
}

function xiEnergy(club: Club): number {
  const xi = lineupPlayers(club)
  if (!xi.length) return 100
  return xi.reduce((sum, p) => sum + p.energy, 0) / xi.length
}

function weakestPos(club: Club): Position {
  const ranked = (['GK', 'DEF', 'MID', 'FWD'] as const)
    .map((pos) => ({ pos, avg: avgOvr(club, pos) }))
    .filter((row) => row.avg > 0)
    .sort((a, b) => a.avg - b.avg)
  return ranked[0]?.pos ?? 'MID'
}

function counts(events: MatchEvent[], side: 'home' | 'away') {
  const other = side === 'home' ? 'away' : 'home'
  let shots = 0
  let saves = 0
  let yellows = 0
  let reds = 0
  for (const event of events) {
    if (event.kind === 'goal' || event.kind === 'shot') {
      if (event.side === side) shots += 1
    }
    if (event.kind === 'save') {
      if (event.side === side) shots += 1
      if (event.side === other) saves += 1
    }
    if (event.side !== side) continue
    if (event.kind === 'card') yellows += 1
    if (event.kind === 'red') reds += 1
  }
  return { shots, saves, yellows, reds }
}

export function matchDebrief(opts: {
  us: Club
  them: Club
  home: boolean
  ourGoals: number
  theirGoals: number
  events: MatchEvent[]
}): string[] {
  const usSide = opts.home ? 'home' : 'away'
  const themSide = opts.home ? 'away' : 'home'
  const ours = counts(opts.events, usSide)
  const theirs = counts(opts.events, themSide)
  const scored = opts.ourGoals
  const conceded = opts.theirGoals
  const won = scored > conceded
  const lost = scored < conceded
  const weak = weakestPos(opts.us)
  const gap = avgOvr(opts.them, weak) - avgOvr(opts.us, weak)
  const tired = xiEnergy(opts.us) < 62

  let well: string
  if (won && conceded === 0) {
    well = 'Clean sheet. The back line did its job.'
  } else if (won && scored >= 3) {
    well = `Attack clicked. We put ${scored} on the board.`
  } else if (won && ours.shots > theirs.shots) {
    well = 'We took the extra chances and made them count.'
  } else if (won) {
    well = 'We found a way to win, even when it got messy.'
  } else if (scored >= 2) {
    well = `We still scored ${scored}. The finishers showed up.`
  } else if (theirs.saves >= 2 && scored === 0) {
    well = 'We asked questions. Their keeper had answers.'
  } else if (ours.saves >= 2) {
    well = 'The keeper kept us in it.'
  } else {
    well = 'We stayed in the fight to the end.'
  }

  let slipped: string
  if (ours.reds > 0) {
    slipped = 'A red card wrecked the shape. Ten men is a long night.'
  } else if (lost && conceded >= 3) {
    slipped = `We leaked ${conceded}. The defense got stretched.`
  } else if (lost && scored === 0) {
    slipped = 'No goals. The final ball went missing.'
  } else if (ours.shots > theirs.shots && scored <= conceded) {
    slipped = 'Plenty of shots, not enough finish.'
  } else if (ours.yellows >= 2) {
    slipped = 'Too many yellows. Discipline slipped.'
  } else if (tired) {
    slipped = 'Tired legs showed. The bench needed a look.'
  } else if (lost) {
    slipped = 'They were sharper in the big moments.'
  } else if (conceded >= 2) {
    slipped = 'We were open at the back more than we should be.'
  } else {
    slipped = 'We never quite grabbed the game by the throat.'
  }

  let next: string
  if (scored === 0 && (weak === 'FWD' || weak === 'MID')) {
    next = `Strengthen ${POS_WORD[weak]}. We needed a better final pass and a finisher.`
  } else if (conceded >= 2 && (weak === 'DEF' || weak === 'GK')) {
    next = `Strengthen ${POS_WORD[weak]}. Too easy to play through us.`
  } else if (gap >= 6) {
    next = `They had us at ${POS_WORD[weak]}. Look for that on the market.`
  } else if (tired) {
    next = 'Rest the tired starters next week, or the drop-off gets worse.'
  } else {
    next = `A stronger ${POS_WORD[weak]} would raise the floor.`
  }

  return [well, slipped, next]
}
