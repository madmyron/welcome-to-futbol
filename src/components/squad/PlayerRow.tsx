/**
 * One player row for squad and transfer lists.
 * Owns the row layout; parent supplies the action button.
 */
import type { ReactNode } from 'react'
import { statsSummary } from '../../game/playerStats.ts'
import { banGamesOf, yellowsOf } from '../../game/cards.ts'
import type { Player } from '../../types/game.ts'

export function PlayerRow({
  player,
  selected,
  action,
}: {
  player: Player
  selected?: boolean
  action?: ReactNode
}) {
  return (
    <div className={`player-row ${selected ? 'selected' : ''}`}>
      <span className={`pos pos-${player.position}`}>{player.position}</span>
      <div className="player-main">
        <strong>{player.name}</strong>
        <span className="muted">
          {player.flag} {player.country} · {player.age} yrs · wage {player.wage.toLocaleString()} / wk
        </span>
        <span className="muted">{statsSummary(player)}</span>
        {yellowsOf(player) > 0 || banGamesOf(player) > 0 ? (
          <span className={`bookings ${banGamesOf(player) > 0 ? 'suspended' : ''}`}>
            {banGamesOf(player) > 0
              ? `Out ${banGamesOf(player)} ${banGamesOf(player) === 1 ? 'match' : 'matches'}`
              : `${yellowsOf(player)} yellow${yellowsOf(player) === 1 ? '' : 's'} this season`}
            {banGamesOf(player) > 0 && yellowsOf(player) > 0
              ? ` · ${yellowsOf(player)} yellow${yellowsOf(player) === 1 ? '' : 's'}`
              : ''}
          </span>
        ) : null}
        <span className="energy" title="Energy">
          <i style={{ width: `${player.energy}%` }} />
        </span>
      </div>
      <span className="ovr">{player.overall}</span>
      {action}
    </div>
  )
}
