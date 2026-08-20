/**
 * Club-to-club trades: cash and/or players for one of theirs.
 * Owns fair-value math and squad swaps; Market only builds the offer.
 */
import type { Club, GameState, Player } from '../types/game.ts'
import { HUMAN_CLUB_ID, MAX_SQUAD, MIN_SQUAD } from './constants.ts'
import { getFormation } from './formations.ts'
import { autoLineup, slotsFor } from './lineup.ts'
import { transferFee } from './money.ts'

export type TradeOffer = {
  clubId: string
  targetPlayerId: string
  offerPlayerIds: string[]
  cash: number
}

export type TradeVerdict = {
  ok: boolean
  reason: string
  askValue: number
  offerValue: number
}

function clubOf(state: GameState, id: string): Club | undefined {
  return state.clubs.find((c) => c.id === id)
}

function valueOf(player: Player): number {
  return transferFee(player)
}

export function tradeAskValue(player: Player): number {
  return Math.round(valueOf(player) * 1.08)
}

export function tradeOfferValue(cash: number, players: Player[]): number {
  const playerPart = players.reduce((sum, p) => sum + Math.round(valueOf(p) * 0.92), 0)
  return Math.max(0, Math.round(cash)) + playerPart
}

export function tradeableClubs(state: GameState): Club[] {
  const human = clubOf(state, HUMAN_CLUB_ID)
  if (!human) return []
  return state.clubs
    .filter((c) => !c.isHuman)
    .slice()
    .sort((a, b) => {
      const sameA = a.division === human.division ? 0 : 1
      const sameB = b.division === human.division ? 0 : 1
      return sameA - sameB || a.division - b.division || a.name.localeCompare(b.name)
    })
}

export function evaluateTrade(state: GameState, offer: TradeOffer): TradeVerdict {
  const human = clubOf(state, HUMAN_CLUB_ID)
  const them = clubOf(state, offer.clubId)
  if (!human || !them || them.isHuman) {
    return { ok: false, reason: 'Pick a club to trade with.', askValue: 0, offerValue: 0 }
  }

  const target = them.players.find((p) => p.id === offer.targetPlayerId)
  if (!target) {
    return { ok: false, reason: 'That player is not at this club.', askValue: 0, offerValue: 0 }
  }

  const cash = Math.max(0, Math.round(offer.cash))
  if (cash > human.cash) {
    return {
      ok: false,
      reason: `You only have $${human.cash.toLocaleString()}.`,
      askValue: tradeAskValue(target),
      offerValue: 0,
    }
  }

  const uniqueOfferIds = [...new Set(offer.offerPlayerIds)]
  const offered: Player[] = []
  for (const id of uniqueOfferIds) {
    const p = human.players.find((row) => row.id === id)
    if (!p) {
      return { ok: false, reason: 'One of your offered players is gone.', askValue: tradeAskValue(target), offerValue: 0 }
    }
    if (human.lineupIds.includes(id)) {
      return {
        ok: false,
        reason: `Sit ${p.name} first — you can only trade bench players.`,
        askValue: tradeAskValue(target),
        offerValue: 0,
      }
    }
    offered.push(p)
  }

  const askValue = tradeAskValue(target)
  const offerValue = tradeOfferValue(cash, offered)

  if (uniqueOfferIds.length === 0 && cash <= 0) {
    return { ok: false, reason: 'Offer cash and/or bench players.', askValue, offerValue }
  }

  const humanSize = human.players.length - offered.length + 1
  if (humanSize > MAX_SQUAD) {
    return { ok: false, reason: 'Squad would be too big. Offer more players, or sell someone first.', askValue, offerValue }
  }
  if (humanSize < MIN_SQUAD) {
    return { ok: false, reason: 'You need to keep at least 11 players.', askValue, offerValue }
  }

  const themSize = them.players.length - 1 + offered.length
  if (themSize < MIN_SQUAD) {
    return { ok: false, reason: `${them.name} would drop below 11 players.`, askValue, offerValue }
  }

  // Human must still be able to fill formation spots after the swap.
  const humanAfterPlayers = [...human.players.filter((p) => !uniqueOfferIds.includes(p.id)), target]
  const need = slotsFor(human)
  for (const pos of ['GK', 'DEF', 'MID', 'FWD'] as const) {
    const count = humanAfterPlayers.filter((p) => p.position === pos).length
    if (count < need[pos]) {
      return {
        ok: false,
        reason: `You’d be short of ${pos} for ${getFormation(human.formationId).name}.`,
        askValue,
        offerValue,
      }
    }
  }

  // Target must keep at least one GK if they need one — crude but fair.
  const themAfter = [...them.players.filter((p) => p.id !== target.id), ...offered]
  const themNeed = slotsFor(them)
  for (const pos of ['GK', 'DEF', 'MID', 'FWD'] as const) {
    if (themNeed[pos] > 0 && themAfter.filter((p) => p.position === pos).length < 1) {
      return {
        ok: false,
        reason: `${them.name} won’t deal — they’d have no ${pos} left.`,
        askValue,
        offerValue,
      }
    }
  }

  if (offerValue + 1 < askValue * 0.9) {
    return {
      ok: false,
      reason: `Too low. They want about $${askValue.toLocaleString()} in value.`,
      askValue,
      offerValue,
    }
  }
  if (offerValue < askValue) {
    return {
      ok: false,
      reason: `Close, but short. Add about $${(askValue - offerValue).toLocaleString()}.`,
      askValue,
      offerValue,
    }
  }

  return { ok: true, reason: 'They’ll take this deal.', askValue, offerValue }
}

export function executeTrade(state: GameState, offer: TradeOffer): GameState {
  const verdict = evaluateTrade(state, offer)
  if (!verdict.ok) return state

  const human = clubOf(state, HUMAN_CLUB_ID)!
  const them = clubOf(state, offer.clubId)!
  const target = them.players.find((p) => p.id === offer.targetPlayerId)!
  const cash = Math.max(0, Math.round(offer.cash))
  const offerIds = new Set(offer.offerPlayerIds)
  const offered = human.players.filter((p) => offerIds.has(p.id))

  const nextHuman: Club = {
    ...human,
    cash: human.cash - cash,
    players: [...human.players.filter((p) => !offerIds.has(p.id)), target],
    lineupIds: human.lineupIds.filter((id) => !offerIds.has(id)),
  }
  // Fresh signing starts out of the XI; Squad can put them in.
  const humanLined = {
    ...nextHuman,
    lineupIds: autoLineup(nextHuman.players, slotsFor(nextHuman)),
  }

  const nextThem: Club = {
    ...them,
    cash: them.cash + cash,
    players: [...them.players.filter((p) => p.id !== target.id), ...offered],
    lineupIds: them.lineupIds.filter((id) => id !== target.id),
  }
  const themLined = {
    ...nextThem,
    lineupIds: autoLineup(nextThem.players, slotsFor(nextThem)),
  }

  return {
    ...state,
    clubs: state.clubs.map((c) => {
      if (c.id === HUMAN_CLUB_ID) return humanLined
      if (c.id === them.id) return themLined
      return c
    }),
  }
}
