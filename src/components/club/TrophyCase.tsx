/**
 * Trophy case: Crown Cup wins (knockout cups can join later).
 * Owns the shelf UI; Club screen supplies the count.
 */
import { ClubCrest } from '../crest/ClubCrest.tsx'
import type { Crest } from '../../types/game.ts'

export function TrophyCase({
  crownCups,
  crest,
}: {
  crownCups: number
  crest: Crest
}) {
  const n = Math.max(0, crownCups)
  return (
    <article className="card trophy-case">
      <h2>Trophy case</h2>
      <p className="muted">
        Crown Cup is for winning Crown League. A knockout cup can sit here later.
      </p>
      <div className="trophy-shelf">
        <div className={`trophy-slot ${n > 0 ? 'won' : ''}`}>
          <img src="/trophies/crown-cup.png" alt="Crown Cup" width={120} height={120} />
          <strong>Crown Cup</strong>
          <span className={n > 0 ? 'gold' : 'muted'}>
            {n === 0 ? 'Not yet' : n === 1 ? 'Won once' : `Won ${n} times`}
          </span>
        </div>
        <div className="trophy-slot locked" aria-disabled="true">
          <div className="trophy-placeholder">?</div>
          <strong>Knockout cup</strong>
          <span className="muted">Coming later</span>
        </div>
      </div>
      {n > 0 ? (
        <div className="trophy-crest-row">
          <ClubCrest crest={crest} size={56} titles={n} />
          <p className="muted">Stars on the crest show your titles when others see your club.</p>
        </div>
      ) : null}
    </article>
  )
}
