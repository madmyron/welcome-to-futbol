/**
 * Five labeled stat bars plus form and a one-line scouting note.
 * Owns the layout; labels come from playerStats.
 */
import { formWord, playerTag, statRows } from '../../game/playerStats.ts'
import type { Player } from '../../types/game.ts'

export function StatStrip({ player }: { player: Player }) {
  return (
    <div className="stat-strip">
      {statRows(player).map((row) => (
        <div key={row.key} className="stat-row">
          <span>{row.label}</span>
          <span className="stat-bar" title={`${row.label} ${row.value}`}>
            <i style={{ width: `${row.value}%` }} />
          </span>
          <span className="stat-n">{row.value}</span>
        </div>
      ))}
      <p className="muted">
        Form {player.form} · {formWord(player.form)}
      </p>
      <p className="gold">{playerTag(player)}</p>
    </div>
  )
}
