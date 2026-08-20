/**
 * End-of-season overlay: party if you go up, tears if you go down.
 * Owns the copy and mood; dismissing clears seasonReport.
 */
import type { CSSProperties } from 'react'
import { useGame } from '../../context/useGame.ts'
import { getLeague } from '../../game/leagues.ts'
import { formatMoney } from '../../game/money.ts'
import type { Division } from '../../types/game.ts'
import './season-report.css'

function Bits({ kind }: { kind: 'promo' | 'relegated' }) {
  const n = kind === 'promo' ? 18 : 14
  return (
    <div className={`season-bits ${kind}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} style={{ '--i': i } as CSSProperties} />
      ))}
    </div>
  )
}

export function SeasonReportModal() {
  const { state, dispatch } = useGame()
  const report = state.seasonReport
  if (!report || state.watchingMatch) return null

  const from = getLeague(report.division)
  const mood = report.promoted ? 'promo' : report.relegated ? 'relegated' : 'stayed'
  const nextUp = report.promoted ? getLeague((report.division - 1) as Division) : null
  const nextDown = report.relegated ? getLeague((report.division + 1) as Division) : null

  return (
    <div className={`modal-backdrop season-backdrop ${mood}`} role="dialog" aria-labelledby="season-title">
      {mood === 'promo' || mood === 'relegated' ? <Bits kind={mood} /> : null}
      <div className={`modal season-modal ${mood}`}>
        {mood === 'promo' ? (
          <>
            <p className="season-kicker">The town is bouncing</p>
            <h2 id="season-title">WE’RE GOING UP!</h2>
            <p className="season-yell">
              Champagne on the bus. Scarves in the air. {from.name} can kiss it goodbye.
            </p>
            <p>
              You finished <strong>{report.place}</strong> and punched a ticket to{' '}
              <strong>{nextUp?.name}</strong>. Don’t waste it.
            </p>
          </>
        ) : null}
        {mood === 'relegated' ? (
          <>
            <p className="season-kicker">The dressing room is quiet</p>
            <h2 id="season-title">We’re down. Bloody hell.</h2>
            <p className="season-yell">
              Tears in the stands. What a load of rubbish. That was a disgrace of a season.
            </p>
            <p>
              Finished <strong>{report.place}</strong> in {from.name}. Relegated to{' '}
              <strong>{nextDown?.name}</strong>. Fix the squad or it’s another long, sodding year.
            </p>
          </>
        ) : null}
        {mood === 'stayed' ? (
          <>
            <h2 id="season-title">Season {report.season} done</h2>
            <p>
              You finished <strong>{report.place}</strong> in {from.name}. Same league next year — no party, no
              funeral.
            </p>
          </>
        ) : null}
        <p className="gold">Prize: {formatMoney(report.prize)}</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => dispatch({ type: 'DISMISS_SEASON_REPORT' })}
        >
          {mood === 'promo'
            ? 'Pop the cork'
            : mood === 'relegated'
              ? 'Wipe your face. Next season.'
              : 'Start next season'}
        </button>
      </div>
    </div>
  )
}
