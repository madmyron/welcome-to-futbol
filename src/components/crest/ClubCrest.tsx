/**
 * Club badge: shape, fill, picture, frame, and Crown Cup stars.
 * Owns the badge drawing; stars show how many times they’ve lifted the Crown Cup.
 */
import { useId } from 'react'
import type { Crest } from '../../types/game.ts'
import { CrestEmblem } from './CrestEmblem.tsx'

const MAX_STARS = 5

function shapePath(shape: Crest['shape']): string {
  if (shape === 'circle') return ''
  if (shape === 'diamond') return 'M32 6 L58 32 L32 58 L6 32 Z'
  return 'M32 6 L54 14 V34 C54 48 32 58 32 58 C32 58 10 48 10 34 V14 Z'
}

function Star({ x, y, size }: { x: number; y: number; size: number }) {
  const r = size / 2
  return (
    <path
      d={`M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y - r * 0.2} L${x + r * 0.4} ${y + r * 0.15} L${x + r * 0.55} ${y + r} L${x} ${y + r * 0.45} L${x - r * 0.55} ${y + r} L${x - r * 0.4} ${y + r * 0.15} L${x - r} ${y - r * 0.2} L${x - r * 0.28} ${y - r * 0.28} Z`}
      fill="#e8c547"
      stroke="#0b1220"
      strokeWidth="0.6"
    />
  )
}

export function ClubCrest({
  crest,
  size = 48,
  titles = 0,
}: {
  crest: Crest
  size?: number
  titles?: number
}) {
  const uid = useId().replace(/:/g, '')
  const fill = crest.fill ?? 'linear'
  const background = crest.background ?? '#1e3a8a'
  const background2 = crest.background2 ?? '#e8c547'
  const frame = crest.frame ?? '#e8c547'
  const emblemColor = crest.emblemColor ?? '#e8c547'
  const emblem = crest.emblem ?? 'star'
  const paint = fill === 'solid' ? background : `url(#${uid})`
  const cups = Math.max(0, Math.floor(titles))
  const shown = Math.min(cups, MAX_STARS)
  const extra = cups > MAX_STARS ? cups - MAX_STARS : 0
  const viewH = cups > 0 ? 76 : 64

  return (
    <svg width={size} height={cups > 0 ? size * (viewH / 64) : size} viewBox={`0 0 64 ${viewH}`} aria-hidden="true">
      <defs>
        {fill === 'radial' ? (
          <radialGradient id={uid} cx="40%" cy="30%" r="75%">
            <stop offset="0%" stopColor={background2} />
            <stop offset="100%" stopColor={background} />
          </radialGradient>
        ) : (
          <linearGradient id={uid} x1="0" y1="0" x2={fill === 'split' ? '1' : '1'} y2={fill === 'split' ? '0' : '1'}>
            <stop offset="0%" stopColor={background} />
            <stop offset={fill === 'split' ? '50%' : '100%'} stopColor={fill === 'split' ? background : background2} />
            {fill === 'split' ? <stop offset="50%" stopColor={background2} /> : null}
            {fill === 'split' ? <stop offset="100%" stopColor={background2} /> : null}
          </linearGradient>
        )}
      </defs>
      {crest.shape === 'circle' ? (
        <circle cx="32" cy="32" r="26" fill={paint} stroke={frame} strokeWidth="3.5" />
      ) : (
        <path d={shapePath(crest.shape)} fill={paint} stroke={frame} strokeWidth="3.5" />
      )}
      <CrestEmblem emblem={emblem} color={emblemColor} />
      {shown > 0 ? (
        <g>
          {Array.from({ length: shown }, (_, i) => {
            const gap = 11
            const totalW = (shown - 1) * gap
            const x = 32 - totalW / 2 + i * gap
            return <Star key={i} x={x} y={68} size={9} />
          })}
          {extra > 0 ? (
            <text x="56" y="71" fontSize="7" fontWeight="800" fill="#e8c547" textAnchor="end">
              +{extra}
            </text>
          ) : null}
        </g>
      ) : null}
    </svg>
  )
}
