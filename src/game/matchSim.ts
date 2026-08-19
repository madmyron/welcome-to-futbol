/**
 * Sims one match from two lineups: expected goals, luck, short recap.
 * Owns the score — not cash, not the league table.
 */
import type { Club, Fixture, Player } from '../types/game.ts'
import { lineupPlayers } from './lineup.ts'
import { buildMatchEvents } from './matchEvents.ts'

function poisson(lambda: number): number {
  const L = Math.exp(-Math.max(0.2, lambda))
  let k = 0
  let p = 1
  do {
    k += 1
    p *= Math.random()
  } while (p > L)
  return Math.min(k - 1, 7)
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function teamPower(players: Player[]): { attack: number; defense: number; energy: number } {
  if (players.length === 0) return { attack: 40, defense: 40, energy: 70 }
  let attack = 0
  let defense = 0
  let energy = 0
  for (const p of players) {
    const form = (p.form ?? 70) / 100
    energy += p.energy * (0.72 + form * 0.28)
    if (p.position === 'GK') {
      const stop = (p.pace ?? p.defense) * 0.3 + (p.skill ?? p.defense) * 0.25 + (p.defend ?? p.defense) * 0.25 + (p.body ?? p.defense) * 0.2
      defense += stop * 1.4
      attack += (p.pass ?? p.attack) * 0.15
    } else if (p.position === 'DEF') {
      defense += ((p.defend ?? p.defense) * 0.55 + (p.body ?? p.defense) * 0.25 + (p.pace ?? p.defense) * 0.2) * 1.15
      attack += ((p.pass ?? p.attack) * 0.5 + (p.pace ?? p.attack) * 0.5) * 0.25
    } else if (p.position === 'MID') {
      defense += ((p.defend ?? p.defense) * 0.6 + (p.body ?? p.defense) * 0.4) * 0.55
      attack += ((p.pass ?? p.attack) * 0.4 + (p.skill ?? p.attack) * 0.35 + (p.pace ?? p.attack) * 0.25) * 0.85
    } else {
      defense += ((p.defend ?? p.defense) * 0.5 + (p.body ?? p.defense) * 0.5) * 0.25
      attack += ((p.skill ?? p.attack) * 0.4 + (p.pace ?? p.attack) * 0.35 + (p.pass ?? p.attack) * 0.25) * 1.25
    }
  }
  const n = players.length
  return { attack: attack / n, defense: defense / n, energy: energy / n }
}

function expectedGoals(
  attack: number,
  oppDef: number,
  home: boolean,
  energy: number,
): number {
  const ratio = attack / Math.max(oppDef, 25)
  const homeBoost = home ? 1.12 : 0.96
  const e = 0.68 + (energy / 100) * 0.32
  return clamp(1.2 * ratio * homeBoost * e, 0.3, 3.1)
}

function recapLines(
  home: Club,
  away: Club,
  homeGoals: number,
  awayGoals: number,
  homePower: ReturnType<typeof teamPower>,
  awayPower: ReturnType<typeof teamPower>,
): string[] {
  const score = `${home.name} ${homeGoals}–${awayGoals} ${away.name}`
  const diff = homeGoals - awayGoals
  const tired = homePower.energy < 62 || awayPower.energy < 62
  let why: string
  if (diff === 0) {
    why = 'A tight one. Neither side could land the knockout punch.'
  } else if (Math.abs(diff) >= 3) {
    why = diff > 0 ? `${home.name} ran riot up front.` : `${away.name} tore through the defense.`
  } else if (tired) {
    why = 'Tired legs showed after the break.'
  } else if (diff > 0 && homePower.attack < awayPower.attack) {
    why = `${home.name} stole it against the odds.`
  } else if (diff < 0 && awayPower.attack < homePower.attack) {
    why = `${away.name} snatched it on the break.`
  } else {
    why = diff > 0 ? `${home.name} were sharper in both boxes.` : `${away.name} were sharper in both boxes.`
  }
  return [score, why]
}

export function simulateMatch(
  home: Club,
  away: Club,
): Pick<Fixture, 'homeGoals' | 'awayGoals' | 'recap' | 'events'> {
  const hp = teamPower(lineupPlayers(home))
  const ap = teamPower(lineupPlayers(away))
  const hg = poisson(expectedGoals(hp.attack, ap.defense, true, hp.energy))
  const ag = poisson(expectedGoals(ap.attack, hp.defense, false, ap.energy))
  return {
    homeGoals: hg,
    awayGoals: ag,
    recap: recapLines(home, away, hg, ag, hp, ap),
    events: buildMatchEvents(home, away, hg, ag),
  }
}
