/**
 * Buy and sell generated players.
 * Owns cash, squad size, and lineup cleanup — not how players are generated.
 */
import type { Club, GameState, Player } from '../types/game.ts'
import { HUMAN_CLUB_ID, MAX_SQUAD, MIN_SQUAD } from './constants.ts'
import { getFormation } from './formations.ts'
import { slotsFor } from './lineup.ts'
import { sellFee, transferFee } from './money.ts'

function patchHuman(state: GameState, club: Club, extra?: Partial<GameState>): GameState {
  return {
    ...state,
    ...extra,
    clubs: state.clubs.map((c) => (c.id === HUMAN_CLUB_ID ? club : c)),
  }
}

export function sellBlockedReason(club: Club, playerId: string): string | null {
  const player = club.players.find((p) => p.id === playerId)
  if (!player) return 'Player not found'
  if (club.lineupIds.includes(playerId)) {
    return 'They’re in the starting 11. Sit them first, then sell.'
  }
  if (club.players.length <= MIN_SQUAD) {
    return 'Keep at least 11 players so you can still play.'
  }
  const need = slotsFor(club)
  const left = club.players.filter((p) => p.id !== playerId && p.position === player.position).length
  if (left < need[player.position]) {
    const form = getFormation(club.formationId).name
    return `Keep at least ${need[player.position]} ${player.position} for ${form}.`
  }
  return null
}

export function buyPlayer(state: GameState, playerId: string): GameState {
  const human = state.clubs.find((c) => c.id === HUMAN_CLUB_ID)
  const player = state.freeAgents.find((p) => p.id === playerId)
  if (!human || !player) return state
  if (human.players.length >= MAX_SQUAD) return state
  const fee = transferFee(player)
  if (human.cash < fee) return state
  const next: Club = {
    ...human,
    cash: human.cash - fee,
    players: [...human.players, player],
  }
  return patchHuman(state, next, {
    freeAgents: state.freeAgents.filter((p) => p.id !== playerId),
  })
}

export function sellPlayer(state: GameState, playerId: string): GameState {
  const human = state.clubs.find((c) => c.id === HUMAN_CLUB_ID)
  if (!human) return state
  const player: Player | undefined = human.players.find((p) => p.id === playerId)
  if (!player) return state
  if (sellBlockedReason(human, playerId)) return state
  const next: Club = {
    ...human,
    cash: human.cash + sellFee(player),
    players: human.players.filter((p) => p.id !== playerId),
    lineupIds: human.lineupIds.filter((id) => id !== playerId),
  }
  return patchHuman(state, next)
}
