/**
 * After-match money: attendance, merch, prize, wages, net.
 * Owns the list layout; amounts come from the match report.
 */
import { formatMoney } from '../../game/money.ts'
import type { MatchMoney } from '../../types/game.ts'

function Row({
  label,
  amount,
  note,
  strong,
}: {
  label: string
  amount: number
  note?: string
  strong?: boolean
}) {
  if (!amount && !strong && !note) return null
  return (
    <li className={strong ? 'payout-row net' : 'payout-row'}>
      <span>
        {label}
        {note ? <span className="muted"> · {note}</span> : null}
      </span>
      <span className={amount < 0 ? 'warn' : ''}>{formatMoney(amount)}</span>
    </li>
  )
}

export function MatchPayout({ money }: { money: MatchMoney }) {
  const resultWord = money.result === 'win' ? 'Win' : money.result === 'draw' ? 'Draw' : 'Loss'
  return (
    <div className="match-payout">
      <h3 className="group-title">Matchday money · {resultWord}</h3>
      <ul>
        {money.home ? (
          <Row
            label="Attendance / tickets"
            amount={money.tickets}
            note={`${money.attendance.toLocaleString()} fans`}
          />
        ) : (
          <Row label="Away appearance" amount={money.appearance} note="Share of their gate" />
        )}
        <Row label="Merch" amount={money.merch} note={money.merch ? 'Club shop' : undefined} />
        <Row label="Hospitality" amount={money.hospitality} />
        <Row label="Concessions" amount={money.concessions} note={money.home ? 'Food and drink' : undefined} />
        <Row label="Tours / museum" amount={money.tours} />
        <Row label="Match prize" amount={money.winnings} />
        <Row label="Wages" amount={-money.wages} />
        <Row label="Net" amount={money.net} strong />
      </ul>
    </div>
  )
}
