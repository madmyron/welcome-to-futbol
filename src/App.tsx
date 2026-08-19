/**
 * Picks which screen is showing.
 * Owns tab state only — game data lives in GameProvider.
 */
import { useState } from 'react'
import { AppShell } from './components/layout/AppShell.tsx'
import { GameProvider } from './context/GameProvider.tsx'
import { ClubScreen } from './screens/ClubScreen.tsx'
import { HomeScreen } from './screens/HomeScreen.tsx'
import { MarketScreen } from './screens/MarketScreen.tsx'
import { SquadScreen } from './screens/SquadScreen.tsx'
import { TableScreen } from './screens/TableScreen.tsx'
import type { ScreenId } from './types/game.ts'

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home')

  return (
    <GameProvider>
      <AppShell screen={screen} onScreen={setScreen}>
        {screen === 'home' ? (
          <HomeScreen onSquad={() => setScreen('squad')} onMarket={() => setScreen('market')} />
        ) : null}
        {screen === 'squad' ? <SquadScreen /> : null}
        {screen === 'table' ? <TableScreen /> : null}
        {screen === 'market' ? <MarketScreen /> : null}
        {screen === 'club' ? <ClubScreen /> : null}
      </AppShell>
    </GameProvider>
  )
}
