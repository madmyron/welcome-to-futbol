/**
 * Floating jumps to GK / DEF / MID / FWD on the squad list.
 * Owns the buttons; the squad screen owns the section ids.
 */
import type { Position } from '../../types/game.ts'

export function PosJump({ positions }: { positions: readonly Position[] }) {
  return (
    <nav className="pos-jump" aria-label="Jump to position">
      {positions.map((pos) => (
        <button
          key={pos}
          type="button"
          className={`pos-jump-btn pos-${pos}`}
          onClick={() => {
            document.getElementById(`squad-${pos}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          {pos}
        </button>
      ))}
    </nav>
  )
}
