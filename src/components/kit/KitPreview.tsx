/**
 * Tiny shirt drawing for home/away kits.
 * Owns pattern painting; Club screen passes colors.
 */
import { useId } from 'react'
import type { Kit } from '../../types/game.ts'

export function KitPreview({ kit, label }: { kit: Kit; label: string }) {
  const clip = useId().replace(/:/g, '')
  const shirt = 'M20 18 L8 28 L16 40 L16 82 L64 82 L64 40 L72 28 L60 18 L50 26 L40 18 L30 26 Z'
  return (
    <div className="kit-preview">
      <svg viewBox="0 0 80 90" width="72" height="80" aria-hidden="true">
        <defs>
          <clipPath id={clip}>
            <path d={shirt} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <rect x="0" y="0" width="80" height="90" fill={kit.primary} />
          {kit.pattern === 'stripes'
            ? [18, 34, 50, 66].map((x) => (
                <rect key={x} x={x} y="0" width="10" height="90" fill={kit.secondary} />
              ))
            : null}
          {kit.pattern === 'hoops'
            ? [28, 48, 68].map((y) => (
                <rect key={y} x="0" y={y} width="80" height="10" fill={kit.secondary} />
              ))
            : null}
          {kit.pattern === 'sash' ? (
            <g transform="rotate(-32 40 50)">
              <rect x="28" y="-10" width="14" height="120" fill={kit.secondary} />
            </g>
          ) : null}
          {kit.pattern === 'halves' ? <rect x="40" y="0" width="40" height="90" fill={kit.secondary} /> : null}
          {kit.pattern === 'chevron' ? (
            <polygon points="8,18 40,48 72,18 72,34 40,62 8,34" fill={kit.secondary} />
          ) : null}
        </g>
        <path d={shirt} fill="none" stroke="#0b1220" strokeWidth="2" />
      </svg>
      <span>{label}</span>
    </div>
  )
}
