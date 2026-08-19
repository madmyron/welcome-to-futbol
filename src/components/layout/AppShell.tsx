/**
 * App chrome: header, scroll area, nav, name/season popups.
 * Owns layout; screens render as children.
 */
import type { ReactNode } from 'react'
import { useGame } from '../../context/useGame.ts'
import { formatMoney } from '../../game/money.ts'
import { getLeague } from '../../game/leagues.ts'
import { humanClub } from '../../game/selectors.ts'
import type { ScreenId } from '../../types/game.ts'
import { ClubCrest } from '../crest/ClubCrest.tsx'
import { MatchWatch } from '../match/MatchWatch.tsx'
import { NameClubModal } from '../modals/NameClubModal.tsx'
import { SeasonReportModal } from '../modals/SeasonReportModal.tsx'
import { BottomNav } from './BottomNav.tsx'

export function AppShell({
  screen,
  onScreen,
  children,
}: {
  screen: ScreenId
  onScreen: (id: ScreenId) => void
  children: ReactNode
}) {
  const { state } = useGame()
  const club = humanClub(state)

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <ClubCrest crest={club.crest} size={40} />
          <div>
            <p className="eyebrow">Welcome to Futbol</p>
            <h1>{club.name}</h1>
          </div>
        </div>
        <div className="top-meta">
          <span>S{state.season} · Wk {state.week}</span>
          <span className="gold">{formatMoney(club.cash)}</span>
          <span>
            {getLeague(club.division).short} · {getLeague(club.division).rankLabel}
          </span>
        </div>
      </header>
      <main className="main-scroll">{children}</main>
      <BottomNav screen={screen} onChange={onScreen} />
      <NameClubModal />
      {state.watchingMatch && state.lastMatch ? (
        <MatchWatch key={`${state.lastMatch.week}-${state.lastMatch.homeName}-${state.lastMatch.homeGoals}`} />
      ) : null}
      <SeasonReportModal />
    </div>
  )
}
