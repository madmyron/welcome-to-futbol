/**
 * Phone thumb bar + desktop top links.
 * Owns which screen is active; App tells it the current id.
 */
import type { ScreenId } from '../../types/game.ts'

const ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'squad', label: 'Squad' },
  { id: 'table', label: 'Table' },
  { id: 'market', label: 'Market' },
  { id: 'club', label: 'Club' },
]

export function BottomNav({
  screen,
  onChange,
}: {
  screen: ScreenId
  onChange: (id: ScreenId) => void
}) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={screen === item.id ? 'nav-btn on' : 'nav-btn'}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
