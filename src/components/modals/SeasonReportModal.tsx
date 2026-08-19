/**
 * End-of-season overlay: place, prize, up or down.
 * Owns the copy; dismissing clears seasonReport.
 */
import { useGame } from '../../context/useGame.ts'
import { getLeague } from '../../game/leagues.ts'
import { formatMoney } from '../../game/money.ts'
import type { Division } from '../../types/game.ts'

export function SeasonReportModal() {
  const { state, dispatch } = useGame()
  const report = state.seasonReport
  if (!report || state.watchingMatch) return null

  const from = getLeague(report.division)
  let headline = `You finished ${report.place} in ${from.name}`
  if (report.promoted) {
    const next = getLeague((report.division - 1) as Division)
    headline = `Promoted to ${next.name}! You finished ${report.place} in ${from.name}.`
  }
  if (report.relegated) {
    const next = getLeague((report.division + 1) as Division)
    headline = `Relegated to ${next.name}. You finished ${report.place} in ${from.name}.`
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-labelledby="season-title">
      <div className="modal">
        <h2 id="season-title">Season {report.season} done</h2>
        <p>{headline}</p>
        <p className="gold">Prize: {formatMoney(report.prize)}</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => dispatch({ type: 'DISMISS_SEASON_REPORT' })}
        >
          Start next season
        </button>
      </div>
    </div>
  )
}
