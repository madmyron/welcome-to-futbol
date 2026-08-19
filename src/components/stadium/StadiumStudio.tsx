/**
 * Stadium picture plus redesign and paid add-ons.
 * Owns the editor UI; buying extras spends club cash.
 */
import { ColorRow } from '../crest/ColorRow.tsx'
import { useGame } from '../../context/useGame.ts'
import { formatMoney } from '../../game/money.ts'
import {
  extraBonus,
  hasExtra,
  nextStadiumCost,
  stadiumCapacity,
  STADIUM_EXTRAS,
} from '../../game/stadium.ts'
import { humanClub } from '../../game/selectors.ts'
import { PITCH_STYLES } from '../../types/game.ts'
import { StadiumView } from './StadiumView.tsx'

export function StadiumStudio() {
  const { state, dispatch } = useGame()
  const club = humanClub(state)
  const { stadium } = club
  const expandCost = nextStadiumCost(club)
  const seats = stadiumCapacity(club)
  const bonus = extraBonus(stadium)
  const nextSeats = expandCost != null ? stadiumCapacity({ ...club, stadium: { ...stadium, standLevel: stadium.standLevel + 1 } }) : null

  return (
    <article className="card">
      <h2>{stadium.name}</h2>
      <p className="muted">
        {seats.toLocaleString()} seats · extras {Math.round(bonus * 100)}% extra matchday cash
      </p>
      <StadiumView stadium={stadium} crest={club.crest} />

      <p className="muted">Stadium name</p>
      <input
        value={stadium.name}
        maxLength={36}
        aria-label="Stadium name"
        onChange={(e) => dispatch({ type: 'SET_STADIUM', stadium: { ...stadium, name: e.target.value } })}
        onBlur={() => {
          const name = stadium.name.trim()
          if (!name) {
            dispatch({ type: 'SET_STADIUM', stadium: { ...stadium, name: `${club.name} Ground` } })
            return
          }
          if (name !== stadium.name) {
            dispatch({ type: 'SET_STADIUM', stadium: { ...stadium, name } })
          }
        }}
      />

      <p className="muted">Redesign (free)</p>
      <ColorRow
        label="Seat color"
        value={stadium.seatColor}
        onPick={(seatColor) => dispatch({ type: 'SET_STADIUM', stadium: { ...stadium, seatColor } })}
      />
      <div className="chip-row">
        {PITCH_STYLES.map((pitchStyle) => (
          <button
            key={pitchStyle}
            type="button"
            className={stadium.pitchStyle === pitchStyle ? 'chip on' : 'chip'}
            onClick={() => dispatch({ type: 'SET_STADIUM', stadium: { ...stadium, pitchStyle } })}
          >
            {pitchStyle === 'plain' ? 'plain pitch' : pitchStyle === 'stripes' ? 'striped pitch' : 'check pitch'}
          </button>
        ))}
      </div>

      <h3 className="group-title">Add with revenue</h3>
      {expandCost != null && nextSeats != null ? (
        <button
          type="button"
          className="btn primary transfer-btn"
          disabled={club.cash < expandCost}
          onClick={() => dispatch({ type: 'UPGRADE_STADIUM' })}
        >
          Expand stands · {formatMoney(expandCost)} → {nextSeats.toLocaleString()} seats
        </button>
      ) : (
        <p className="ok">Stands are maxed.</p>
      )}
      {club.cash < (expandCost ?? 0) && expandCost != null ? (
        <p className="warn">Need {formatMoney(expandCost)}. You have {formatMoney(club.cash)}.</p>
      ) : null}

      <div className="extra-list">
        {STADIUM_EXTRAS.map((extra) => {
          const owned = hasExtra(stadium, extra.id)
          const tooPoor = club.cash < extra.cost
          return (
            <div key={extra.id} className="extra-row">
              <div>
                <strong>{extra.name}</strong>
                <p className="muted">{extra.blurb}</p>
              </div>
              {owned ? (
                <span className="ok">Built</span>
              ) : (
                <button
                  type="button"
                  className="btn small"
                  disabled={tooPoor}
                  onClick={() => dispatch({ type: 'BUY_STADIUM_EXTRA', extraId: extra.id })}
                >
                  {formatMoney(extra.cost)}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}
