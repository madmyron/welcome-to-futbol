/**
 * Mini pitch dots for the selected formation.
 * Owns the drawing; formation data supplies x/y spots.
 */
import type { Formation } from '../../game/formations.ts'

const COLORS: Record<string, string> = {
  GK: '#fbbf24',
  DEF: '#7dd3fc',
  MID: '#86efac',
  FWD: '#fda4af',
}

export function MiniPitch({ formation }: { formation: Formation }) {
  return (
    <svg className="mini-pitch" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="2" y="2" width="96" height="96" rx="4" fill="#166534" stroke="#bbf7d0" strokeWidth="1.5" />
      <line x1="2" y1="50" x2="98" y2="50" stroke="#bbf7d066" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#bbf7d066" />
      <rect x="30" y="2" width="40" height="14" fill="none" stroke="#bbf7d066" />
      <rect x="30" y="84" width="40" height="14" fill="none" stroke="#bbf7d066" />
      {formation.dots.map((dot, i) => (
        <circle key={`${dot.position}-${i}`} cx={dot.x} cy={dot.y} r="4.2" fill={COLORS[dot.position]} />
      ))}
    </svg>
  )
}
