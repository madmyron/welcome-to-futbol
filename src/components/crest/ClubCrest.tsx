/**
 * Club badge: shape, fill style, picture, and frame color.
 * Owns the badge drawing; the Club screen picks the parts.
 */
import { useId } from 'react'
import type { Crest } from '../../types/game.ts'
import { CrestEmblem } from './CrestEmblem.tsx'

function shapePath(shape: Crest['shape']): string {
  if (shape === 'circle') return ''
  if (shape === 'diamond') return 'M32 6 L58 32 L32 58 L6 32 Z'
  return 'M32 6 L54 14 V34 C54 48 32 58 32 58 C32 58 10 48 10 34 V14 Z'
}

export function ClubCrest({ crest, size = 48 }: { crest: Crest; size?: number }) {
  const uid = useId().replace(/:/g, '')
  const fill = crest.fill ?? 'linear'
  const background = crest.background ?? '#1e3a8a'
  const background2 = crest.background2 ?? '#e8c547'
  const frame = crest.frame ?? '#e8c547'
  const emblemColor = crest.emblemColor ?? '#e8c547'
  const emblem = crest.emblem ?? 'star'
  const paint = fill === 'solid' ? background : `url(#${uid})`

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
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
    </svg>
  )
}
