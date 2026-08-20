/**
 * Trade desk: pick a club, pick a player, offer cash and/or bench.
 * Owns the trade UI; fair-value rules live in trades.ts.
 */
import { useMemo, useState } from 'react'
import { TransferCard } from './TransferCard.tsx'
import { useGame } from '../../context/useGame.ts'
import { getLeague } from '../../game/leagues.ts'
import { formatMoney } from '../../game/money.ts'
import { humanClub } from '../../game/selectors.ts'
import {
  evaluateTrade,
  tradeAskValue,
  tradeableClubs,
  tradeOfferValue,
} from '../../game/trades.ts'
import { POSITIONS, type Player, type Position } from '../../types/game.ts'

type PosFilter = 'ALL' | Position

const CASH_CHIPS = [0, 25_000, 50_000, 100_000, 250_000, 500_000]

function byOverall(players: Player[]): Player[] {
  return players.slice().sort((a, b) => b.overall - a.overall)
}

export function TradeDesk({ onDone }: { onDone: (note: string) => void }) {
  const { state, dispatch } = useGame()
  const club = humanClub(state)
  const clubs = tradeableClubs(state)
  const [clubId, setClubId] = useState(clubs.find((c) => c.division === club.division)?.id ?? clubs[0]?.id ?? '')
  const [pos, setPos] = useState<PosFilter>('ALL')
  const [targetId, setTargetId] = useState<string | null>(null)
  const [offerIds, setOfferIds] = useState<string[]>([])
  const [cash, setCash] = useState(0)

  const them = clubs.find((c) => c.id === clubId)
  const theirList = useMemo(() => {
    if (!them) return []
    const list = byOverall(them.players)
    if (pos === 'ALL') return list
    return list.filter((p) => p.position === pos)
  }, [them, pos])

  const target = them?.players.find((p) => p.id === targetId) ?? null
  const bench = byOverall(club.players.filter((p) => !club.lineupIds.includes(p.id)))
  const offered = bench.filter((p) => offerIds.includes(p.id))
  const verdict = target
    ? evaluateTrade(state, {
        clubId,
        targetPlayerId: target.id,
        offerPlayerIds: offerIds,
        cash,
      })
    : null

  const ask = target ? tradeAskValue(target) : 0
  const offerVal = tradeOfferValue(cash, offered)

  function toggleOffer(id: string) {
    setOfferIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function pickTarget(player: Player) {
    setTargetId(player.id)
    setOfferIds([])
    setCash(0)
  }

  function clearOffer() {
    setTargetId(null)
    setOfferIds([])
    setCash(0)
  }

  return (
    <div className="stack">
      <article className="card">
        <h3 className="group-title">Trade with a club</h3>
        <p className="muted">Offer cash and/or bench players. They want about market value.</p>
        <label className="muted" htmlFor="trade-club">
          Club
        </label>
        <select
          id="trade-club"
          value={clubId}
          onChange={(e) => {
            setClubId(e.target.value)
            clearOffer()
          }}
        >
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {getLeague(c.division).short}
              {c.division === club.division ? ' · your league' : ''}
            </option>
          ))}
        </select>
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
      </article>

      {target && them ? (
        <article className="card trade-offer">
          <h3 className="group-title">Your offer for {target.name}</h3>
          <p className="muted">
            {them.name} · OVR {target.overall} · they want about {formatMoney(ask)}
          </p>
          <p className={verdict?.ok ? 'ok' : 'warn'}>
            Your offer {formatMoney(offerVal)}
            {verdict ? ` · ${verdict.reason}` : ''}
          </p>

          <p className="muted">Cash</p>
          <div className="chip-row">
            {CASH_CHIPS.filter((n) => n === 0 || n <= club.cash + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={cash === n ? 'chip on' : 'chip'}
                onClick={() => setCash(n)}
              >
                {n === 0 ? 'No cash' : formatMoney(n)}
              </button>
            ))}
            {ask > 0 && ask <= club.cash ? (
              <button type="button" className={cash === ask ? 'chip on' : 'chip'} onClick={() => setCash(ask)}>
                Full ask {formatMoney(ask)}
              </button>
            ) : null}
          </div>
          <input
            type="number"
            min={0}
            max={club.cash}
            step={5000}
            value={cash}
            aria-label="Cash offer"
            onChange={(e) => setCash(Math.max(0, Math.min(club.cash, Number(e.target.value) || 0)))}
          />

          <p className="muted">Bench players to include</p>
          {bench.length === 0 ? (
            <p className="warn">No bench players. Sit someone on Squad first.</p>
          ) : (
            <div className="trade-offer-list">
              {bench.map((p) => {
                const on = offerIds.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={on ? 'trade-pick on' : 'trade-pick'}
                    onClick={() => toggleOffer(p.id)}
                  >
                    <span className={`pos pos-${p.position}`}>{p.position}</span>
                    <span className="grow">
                      {p.name} · {p.overall}
                    </span>
                    <span className="muted">{formatMoney(Math.round(tradeAskValue(p) * 0.85))}</span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="row-actions trade-actions">
            <button type="button" className="btn ghost" onClick={clearOffer}>
              Back
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={!verdict?.ok}
              onClick={() => {
                if (!target || !verdict?.ok) return
                dispatch({
                  type: 'MAKE_TRADE',
                  clubId,
                  targetPlayerId: target.id,
                  offerPlayerIds: offerIds,
                  cash,
                })
                onDone(
                  `Traded for ${target.name}${cash ? ` (+ ${formatMoney(cash)})` : ''}${
                    offered.length ? ` · sent ${offered.map((p) => p.name).join(', ')}` : ''
                  }.`,
                )
                clearOffer()
              }}
            >
              Make trade
            </button>
          </div>
        </article>
      ) : (
        <>
          <h3 className="group-title">{them ? `${them.name} squad` : 'Pick a club'}</h3>
          {!them ? (
            <p className="muted">No clubs to trade with.</p>
          ) : theirList.length === 0 ? (
            <p className="muted">No {pos} at this club.</p>
          ) : (
            theirList.map((p) => (
              <TransferCard
                key={p.id}
                player={p}
                priceLabel={formatMoney(tradeAskValue(p))}
                actionLabel="Offer for"
                disabled={false}
                onAction={() => pickTarget(p)}
              />
            ))
          )}
        </>
      )}
    </div>
  )
}
