/**
 * Buy free agents, sell bench, or trade with other clubs.
 * Owns the three lists and a “what just happened” line so a tap is obvious.
 */
import { useState } from 'react'
import { TradeDesk } from '../components/market/TradeDesk.tsx'
import { TransferCard } from '../components/market/TransferCard.tsx'
import { useGame } from '../context/useGame.ts'
import { MAX_SQUAD } from '../game/constants.ts'
import { formatMoney, sellFee, transferFee } from '../game/money.ts'
import { humanClub } from '../game/selectors.ts'
import { sellBlockedReason } from '../game/transfers.ts'
import { POSITIONS, type Player, type Position } from '../types/game.ts'

type MarketMode = 'buy' | 'sell' | 'trade'
type PosFilter = 'ALL' | Position

function byOverall(players: Player[]): Player[] {
  return players.slice().sort((a, b) => b.overall - a.overall)
}

function inPos(players: Player[], pos: PosFilter): Player[] {
  if (pos === 'ALL') return byOverall(players)
  return byOverall(players.filter((p) => p.position === pos))
}

export function MarketScreen() {
  const { state, dispatch } = useGame()
  const club = humanClub(state)
  const [note, setNote] = useState<string | null>(null)
  const [mode, setMode] = useState<MarketMode>('buy')
  const [pos, setPos] = useState<PosFilter>('ALL')
  const buyList = inPos(state.freeAgents, pos)
  const bench = inPos(
    club.players.filter((p) => !club.lineupIds.includes(p.id)),
    pos,
  )

  return (
    <section className="stack">
      <article className="card">
        <h2>Transfer market</h2>
        <p className="muted">
          Cash {formatMoney(club.cash)} · squad {club.players.length}/{MAX_SQUAD}
        </p>
        {note ? <p className="ok">{note}</p> : null}
        <div className="seg" role="tablist" aria-label="Buy, sell, or trade">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'buy'}
            className={mode === 'buy' ? 'on' : ''}
            onClick={() => setMode('buy')}
          >
            Buy · {state.freeAgents.length}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sell'}
            className={mode === 'sell' ? 'on' : ''}
            onClick={() => setMode('sell')}
          >
            Sell
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'trade'}
            className={mode === 'trade' ? 'on' : ''}
            onClick={() => setMode('trade')}
          >
            Trade
          </button>
        </div>
        {mode !== 'trade' ? (
          <div className="chip-row" role="tablist" aria-label="Position">
            {(['ALL', ...POSITIONS] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={item === pos}
                className={item === pos ? 'chip on' : 'chip'}
                onClick={() => setPos(item)}
              >
                {item === 'ALL' ? 'All' : item}
              </button>
            ))}
          </div>
        ) : null}
      </article>

      {mode === 'trade' ? (
        <TradeDesk onDone={setNote} />
      ) : mode === 'buy' ? (
        <>
          <h3 className="group-title">Players for sale</h3>
          <p className="muted">List refreshes after each match.</p>
          {buyList.length === 0 ? (
            <p className="muted">
              {state.freeAgents.length === 0
                ? 'Nobody left this week. Play a match for a new list.'
                : `No ${pos} on the market this week. Tap All, or another position.`}
            </p>
          ) : (
            buyList.map((p) => {
              const fee = transferFee(p)
              const tooExpensive = club.cash < fee
              const full = club.players.length >= MAX_SQUAD
              const disabled = tooExpensive || full
              return (
                <TransferCard
                  key={p.id}
                  player={p}
                  priceLabel={formatMoney(fee)}
                  actionLabel="Buy"
                  disabled={disabled}
                  disabledReason={
                    full
                      ? 'Squad is full. Switch to Sell first.'
                      : tooExpensive
                        ? `Need ${formatMoney(fee)}. You have ${formatMoney(club.cash)}.`
                        : undefined
                  }
                  onAction={() => {
                    dispatch({ type: 'BUY_PLAYER', playerId: p.id })
                    setNote(`Signed ${p.name} for ${formatMoney(fee)}. Put them in the XI on Squad.`)
                  }}
                />
              )
            })
          )}
        </>
      ) : (
        <>
          <h3 className="group-title">Your bench</h3>
          <p className="muted">Keep 11 players and enough of each spot for your formation.</p>
          {bench.length === 0 ? (
            <p className="muted">
              {pos === 'ALL'
                ? 'Nobody on the bench. Sit someone on Squad, then sell them here.'
                : `No ${pos} on the bench. Sit someone on Squad, or tap All.`}
            </p>
          ) : (
            bench.map((p) => {
              const fee = sellFee(p)
              const blocked = sellBlockedReason(club, p.id)
              return (
                <TransferCard
                  key={p.id}
                  player={p}
                  priceLabel={formatMoney(fee)}
                  actionLabel="Sell"
                  disabled={Boolean(blocked)}
                  disabledReason={blocked ?? undefined}
                  onAction={() => {
                    dispatch({ type: 'SELL_PLAYER', playerId: p.id })
                    setNote(`Sold ${p.name} for ${formatMoney(fee)}.`)
                  }}
                />
              )
            })
          )}
        </>
      )}
    </section>
  )
}
