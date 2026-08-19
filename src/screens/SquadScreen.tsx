/**
 * Pick a formation and the starting 11.
 * Owns tap-to-select; lineup rules live in the game folder.
 */
import { FormationPicker } from '../components/squad/FormationPicker.tsx'
import { PlayerRow } from '../components/squad/PlayerRow.tsx'
import { useGame } from '../context/useGame.ts'
import { getFormation } from '../game/formations.ts'
import { countByPosition, lineupError, slotsFor, startBlockedReason } from '../game/lineup.ts'
import { isSuspended } from '../game/cards.ts'
import { formatMoney, sellFee } from '../game/money.ts'
import { humanClub } from '../game/selectors.ts'
import { sellBlockedReason } from '../game/transfers.ts'
import type { Position } from '../types/game.ts'

const ORDER: Position[] = ['GK', 'DEF', 'MID', 'FWD']

export function SquadScreen() {
  const { state, dispatch } = useGame()
  const club = humanClub(state)
  const counts = countByPosition(club)
  const need = slotsFor(club)
  const problem = lineupError(club)

  return (
    <section className="stack">
      <FormationPicker
        formationId={club.formationId}
        onPick={(formationId) => dispatch({ type: 'SET_FORMATION', formationId })}
      />
      <article className="card">
        <h2>Starting 11</h2>
        <p className={problem ? 'warn' : 'muted'}>
          {ORDER.map((pos) => `${counts[pos]}/${need[pos]} ${pos}`).join(' · ')}
        </p>
        {problem ? <p className="warn">{problem}</p> : <p className="ok">Lineup is ready.</p>}
        {club.players.some(isSuspended) ? (
          <p className="warn">A red or too many yellows means they sit. You cannot start a suspended player.</p>
        ) : null}
        {counts.MID < need.MID && counts.FWD >= need.FWD ? (
          <p className="warn">
            Sitting mids opens MID spots, not FWD spots. {getFormation(club.formationId).name} starts{' '}
            {need.FWD} FWD. Want three strikers? Pick 4-3-3.
          </p>
        ) : null}
      </article>
      {ORDER.map((pos) => (
        <div key={pos} className="stack tight">
          <h3 className="group-title">
            {pos} · {counts[pos]}/{need[pos]}
          </h3>
          {counts[pos] < need[pos] ? (
            <p className="warn">Need {need[pos] - counts[pos]} more {pos}.</p>
          ) : club.players.some((p) => p.position === pos && !club.lineupIds.includes(p.id)) ? (
            <p className="muted">This shape only starts {need[pos]} {pos}.</p>
          ) : null}
          {club.players
            .filter((p) => p.position === pos)
            .sort((a, b) => b.overall - a.overall)
            .map((p) => {
              const started = club.lineupIds.includes(p.id)
              const blocked = started ? null : startBlockedReason(club, p.id)
              const sellWhy = started ? null : sellBlockedReason(club, p.id)
              const fee = sellFee(p)
              return (
                <PlayerRow
                  key={p.id}
                  player={p}
                  selected={started}
                  action={
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn small"
                        disabled={Boolean(blocked)}
                        title={blocked ?? undefined}
                        onClick={() => dispatch({ type: 'TOGGLE_LINEUP', playerId: p.id })}
                      >
                        {started ? 'Sit' : 'Start'}
                      </button>
                      {started ? null : (
                        <button
                          type="button"
                          className="btn small ghost"
                          disabled={Boolean(sellWhy)}
                          title={sellWhy ?? `Sell for ${formatMoney(fee)}`}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Sell ${p.name} for ${formatMoney(fee)}? They’re gone from the squad.`,
                              )
                            ) {
                              dispatch({ type: 'SELL_PLAYER', playerId: p.id })
                            }
                          }}
                        >
                          Sell
                        </button>
                      )}
                    </div>
                  }
                />
              )
            })}
        </div>
      ))}
    </section>
  )
}
