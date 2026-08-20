/**
 * League table for one division.
 * Owns the table markup; parent passes already-sorted rows.
 */
import { HUMAN_CLUB_ID } from '../../game/constants.ts'
import { promotionHint } from '../../game/leagues.ts'
import type { TableRow } from '../../game/standings.ts'
import type { Division } from '../../types/game.ts'

export function LeagueTable({ rows, division }: { rows: TableRow[]; division: Division }) {
  return (
    <div className="table-wrap">
      <table className="league-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Club</th>
            <th>Pwr</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.clubId} className={row.clubId === HUMAN_CLUB_ID ? 'you' : ''}>
              <td>{i + 1}</td>
              <td className="club-cell">
                {row.name}
                {row.crownCups > 0 ? (
                  <span className="cup-stars" title={`${row.crownCups} Crown Cup${row.crownCups === 1 ? '' : 's'}`}>
                    {' '}
                    {'★'.repeat(Math.min(row.crownCups, 5))}
                    {row.crownCups > 5 ? `+${row.crownCups - 5}` : ''}
                  </span>
                ) : null}
              </td>
              <td className="pwr">{row.power}</td>
              <td>{row.played}</td>
              <td>{row.won}</td>
              <td>{row.drawn}</td>
              <td>{row.lost}</td>
              <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
              <td className="pts">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted hint">
        {promotionHint(division)} Pwr is the starting 11 ratings added up. ★ = Crown Cup titles.
      </p>
    </div>
  )
}
