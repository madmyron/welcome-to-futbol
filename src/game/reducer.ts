/**
 * Turns button presses into the next save.
 * Owns the list of actions; each helper file does one job.
 */
import type { GameAction, GameState } from '../types/game.ts'
import { applyRecharge, spendCharge } from './charges.ts'
import { HUMAN_CLUB_ID, MAX_CHARGES } from './constants.ts'
import { createNewGame } from './generateWorld.ts'
import { applyFormation, lineupError, toggleLineup } from './lineup.ts'
import { playWeek } from './playWeek.ts'
import { buyStadiumExtra, upgradeStadium, withExtraLevels } from './stadium.ts'
import { buyPlayer, sellPlayer } from './transfers.ts'

function mapHuman(state: GameState, fn: (club: GameState['clubs'][number]) => GameState['clubs'][number]): GameState {
  return {
    ...state,
    clubs: state.clubs.map((c) => (c.id === HUMAN_CLUB_ID ? fn(c) : c)),
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAME_CLUB': {
      const name = action.name.trim() || state.clubs.find((c) => c.id === HUMAN_CLUB_ID)?.name || 'Harbor Lights FC'
      return { ...mapHuman(state, (c) => ({ ...c, name })), needsName: false }
    }
    case 'RENAME_CLUB': {
      const name = action.name.trim()
      if (!name) return state
      return mapHuman(state, (c) => ({ ...c, name }))
    }
    case 'TOGGLE_LINEUP':
      return mapHuman(state, (c) => toggleLineup(c, action.playerId))
    case 'SET_FORMATION':
      return mapHuman(state, (c) => applyFormation(c, action.formationId))
    case 'PLAY_WEEK': {
      const charged = applyRecharge(state, action.now)
      const human = charged.clubs.find((c) => c.id === HUMAN_CLUB_ID)
      if (!human || charged.charges < 1 || lineupError(human)) return charged
      const next = playWeek(charged)
      const played =
        next.week !== charged.week || next.season !== charged.season || next.seasonReport != null
      if (!played) return charged
      return { ...spendCharge(next, action.now), watchingMatch: true }
    }
    case 'BUY_PLAYER':
      return buyPlayer(state, action.playerId)
    case 'SELL_PLAYER':
      return sellPlayer(state, action.playerId)
    case 'UPGRADE_STADIUM':
      return mapHuman(state, upgradeStadium)
    case 'BUY_STADIUM_EXTRA':
      return mapHuman(state, (c) => buyStadiumExtra(c, action.extraId))
    case 'SET_STADIUM':
      return mapHuman(state, (c) => ({ ...c, stadium: withExtraLevels(action.stadium) }))
    case 'SET_KIT':
      return mapHuman(state, (c) =>
        action.which === 'home' ? { ...c, homeKit: action.kit } : { ...c, awayKit: action.kit },
      )
    case 'SET_CREST':
      return mapHuman(state, (c) => ({ ...c, crest: action.crest }))
    case 'FILL_CHARGES':
      return { ...state, charges: MAX_CHARGES, nextChargeAt: 0 }
    case 'WATCH_MATCH':
      return state.lastMatch ? { ...state, watchingMatch: true } : state
    case 'DISMISS_MATCH_WATCH':
      return { ...state, watchingMatch: false }
    case 'DISMISS_SEASON_REPORT':
      return { ...state, seasonReport: null }
    case 'NEW_GAME':
      return createNewGame()
    case 'ADD_INVITE': {
      const to = action.to.trim()
      if (!to) return state
      const list = state.invites ?? []
      if (list.some((row) => row.via === action.via && row.to.toLowerCase() === to.toLowerCase())) {
        return state
      }
      return {
        ...state,
        invites: [{ id: `inv-${Date.now()}`, via: action.via, to, sentAt: Date.now() }, ...list].slice(0, 24),
      }
    }
    default:
      return state
  }
}
