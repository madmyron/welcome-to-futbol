/**
 * Three footballs showing stored match charges.
 * Owns charge dots and the countdown label.
 */
import { formatCountdown, msUntilNextCharge } from '../../game/charges.ts'
import { MAX_CHARGES } from '../../game/constants.ts'
import type { GameState } from '../../types/game.ts'

export function ChargeMeter({ state, now }: { state: GameState; now: number }) {
  const wait = msUntilNextCharge(state, now)
  return (
    <div className="charge-meter">
      <div className="charge-dots" aria-label={`${state.charges} of ${MAX_CHARGES} matches ready`}>
        {Array.from({ length: MAX_CHARGES }, (_, i) => (
          <span key={i} className={i < state.charges ? 'ball on' : 'ball'} />
        ))}
      </div>
      <p className="charge-label">
        {state.charges >= MAX_CHARGES
          ? 'Matches ready'
          : state.charges === 0
            ? `Next match in ${formatCountdown(wait)}`
            : `${state.charges} ready · next in ${formatCountdown(wait)}`}
      </p>
    </div>
  )
}
