/**
 * Market card with a big Buy or Sell button.
 * Owns the tap target; fees come from the parent.
 */
import { StatStrip } from '../player/StatStrip.tsx'
import type { Player } from '../../types/game.ts'

export function TransferCard({
  player,
  priceLabel,
  actionLabel,
  disabled,
  disabledReason,
  onAction,
}: {
  player: Player
  priceLabel: string
  actionLabel: string
  disabled: boolean
  disabledReason?: string
  onAction: () => void
}) {
  return (
    <article className="transfer-card">
      <div className="transfer-top">
        <span className={`pos pos-${player.position}`}>{player.position}</span>
        <div className="player-main">
          <strong>{player.name}</strong>
          <span className="muted">
            {player.flag} {player.country} · {player.age} yrs
          </span>
        </div>
        <span className="ovr">{player.overall}</span>
      </div>
      <StatStrip player={player} />
      <button type="button" className="btn primary transfer-btn" disabled={disabled} onClick={onAction}>
        {actionLabel} · {priceLabel}
      </button>
      {disabled && disabledReason ? <p className="warn">{disabledReason}</p> : null}
    </article>
  )
}
