/**
 * One player row for squad and transfer lists.
 * Owns the row layout; parent supplies the action button.
 */
import type { ReactNode } from 'react'
import { statsSummary } from '../../game/playerStats.ts'
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
        <span className="energy" title="Energy">
          <i style={{ width: `${player.energy}%` }} />
        </span>
      </div>
      <span className="ovr">{player.overall}</span>
      {action}
    </div>
  )
}
