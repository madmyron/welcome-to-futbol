/**
 * Classic SVG pictures for club crests (lion, crown, star, and the rest).
 * Owns the drawings; ClubCrest passes the fill color.
 */
import type { CrestEmblem } from '../../types/game.ts'

function isLight(hex: string): boolean {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  if (Number.isNaN(n)) return false
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

export function CrestEmblem({ emblem, color }: { emblem: CrestEmblem; color: string }) {
  const ink = isLight(color) ? '#0b1220' : '#f8fafc'
  const picture =
    emblem === 'lion' ? (
      <Lion color={color} ink={ink} />
    ) : emblem === 'dragon' ? (
      <Dragon color={color} ink={ink} />
    ) : emblem === 'wolf' ? (
      <Wolf color={color} ink={ink} />
    ) : emblem === 'crown' ? (
      <Crown color={color} ink={ink} />
    ) : emblem === 'eagle' ? (
      <Eagle color={color} ink={ink} />
    ) : emblem === 'horse' ? (
      <Horse color={color} ink={ink} />
    ) : emblem === 'castle' ? (
      <Castle color={color} ink={ink} />
    ) : emblem === 'anchor' ? (
      <Anchor color={color} />
    ) : emblem === 'sun' ? (
      <Sun color={color} />
    ) : (
      <Star color={color} />
    )
  return <g transform="translate(32 33) scale(0.84) translate(-32 -32)">{picture}</g>
}

function Lion({ color, ink }: { color: string; ink: string }) {
  return (
    <g fill={color} stroke={color} strokeLinejoin="round" strokeLinecap="round" strokeWidth="0.8">
      <path d="M42 36 C56 40 60 22 50 8 C48 14 44 18 40 16 C52 26 50 38 42 38 Z" />
      <ellipse cx="50" cy="7" rx="6" ry="5" />
      <path d="M28 46 L22 62 H31 L34 50 Z" />
      <path d="M38 46 L42 62 H51 L44 48 Z" />
      <polygon points="22,62 17,64 24,64 28,62" />
      <polygon points="42,62 38,64 46,64 51,62" />
      <path d="M26 24 C40 18 48 30 42 50 L27 52 C22 40 20 28 26 24 Z" />
      <path d="M24 26 L8 12 L3 16 L6 20 L20 32 Z" />
      <polygon points="3,16 0,10 10,14" />
      <polygon points="0,10 2,6 8,12" />
      <path d="M24 34 L9 40 L7 48 L22 40 Z" />
      <polygon points="7,48 3,52 14,50" />
      <path d="M20 6 C30 0 40 8 36 20 C32 14 26 12 22 14 C24 8 20 6 20 6 Z" />
      <polygon points="24,4 22,-2 30,8" />
      <polygon points="32,6 38,0 38,12" />
      <polygon points="16,8 12,0 22,10" />
      <path d="M20 12 C12 10 6 14 2 20 L8 30 C12 24 18 20 24 18 C26 14 24 12 20 12 Z" />
      <polygon points="2,20 -4,16 6,26" />
      <polygon points="8,28 0,36 14,30" />
      <polygon points="18,6 14,-1 24,10" />
      <path d="M4 22 L-2 24 L8 27 Z" fill={ink} stroke="none" />
      <circle cx="12" cy="16" r="1.8" fill={ink} stroke="none" />
    </g>
  )
}

function Dragon({ color, ink }: { color: string; ink: string }) {
  return (
    <g>
      <path fill={color} d="M30 32 L42 6 L46 26 L56 4 L52 28 L62 18 L48 36 L34 34 Z" />
      <path fill={color} d="M46 40 C60 34 64 50 54 56 L48 48 C58 50 56 40 46 42 Z" />
      <polygon fill={color} points="54,56 64,52 60,62" />
      <ellipse cx="36" cy="40" rx="13" ry="11" fill={color} />
      <path fill={color} d="M26 38 C18 32 16 24 14 18 L24 22 C26 28 28 36 32 40 Z" />
      <ellipse cx="13" cy="18" rx="8" ry="7" fill={color} />
      <polygon fill={color} points="8,16 0,10 8,20" />
      <polygon fill={color} points="8,20 0,30 12,24" />
      <polygon fill={color} points="12,12 8,2 20,14" />
      <polygon fill={color} points="28,30 32,16 36,30" />
      <polygon fill={color} points="36,28 40,14 44,30" />
      <rect x="28" y="48" width="6" height="12" rx="1" fill={color} />
      <rect x="40" y="48" width="6" height="12" rx="1" fill={color} />
      <polygon fill={color} points="28,60 24,64 38,60" />
      <polygon fill={color} points="40,60 36,64 50,60" />
      <circle cx="12" cy="16" r="2.3" fill={ink} />
    </g>
  )
}

function Wolf({ color, ink }: { color: string; ink: string }) {
  return (
    <g fill={color}>
      <polygon points="30,28 24,6 40,26" />
      <polygon points="40,26 48,8 46,28" />
      <path d="M16 56 C18 40 24 32 36 30 C50 26 60 14 62 8 L54 22 C50 34 42 40 36 44 C26 52 18 56 16 56 Z" />
      <polygon points="36,44 32,54 18,56 34,48" />
      <circle cx="42" cy="28" r="2.1" fill={ink} />
    </g>
  )
}

function Crown({ color, ink }: { color: string; ink: string }) {
  return (
    <g>
      <polygon points="8,38 14,16 24,34" fill={color} />
      <polygon points="24,34 32,8 40,34" fill={color} />
      <polygon points="40,34 50,16 56,38" fill={color} />
      <rect x="8" y="36" width="48" height="12" rx="2" fill={color} />
      <rect x="6" y="46" width="52" height="7" rx="2" fill={color} />
      <circle cx="14" cy="16" r="4" fill={color} />
      <circle cx="32" cy="8" r="5" fill={color} />
      <circle cx="50" cy="16" r="4" fill={color} />
      <circle cx="20" cy="42" r="2.3" fill={ink} />
      <circle cx="32" cy="42" r="2.3" fill={ink} />
      <circle cx="44" cy="42" r="2.3" fill={ink} />
    </g>
  )
}

function Eagle({ color, ink }: { color: string; ink: string }) {
  return (
    <g fill={color}>
      <path d="M30 28 L6 12 L14 26 L4 34 L18 32 L8 50 L28 36 Z" />
      <path d="M34 28 L58 12 L50 26 L60 34 L46 32 L56 50 L36 36 Z" />
      <path d="M28 20 H36 L37 42 L32 50 L27 42 Z" />
      <path d="M36 8 L32 22 H40 L48 10 L40 15 Z" />
      <path d="M24 44 L32 60 L40 44 Z" />
      <polygon points="44,10 52,12 46,16" fill={ink} />
    </g>
  )
}

function Horse({ color, ink }: { color: string; ink: string }) {
  return (
    <g fill={color}>
      <path d="M22 56 C18 40 22 28 30 22 L26 8 L36 16 L40 6 L46 18 C56 22 58 32 54 40 L48 40 L50 44 L42 44 C40 50 36 56 28 58 Z" />
      <polygon points="30,22 18,12 24,24 12,18 24,28 10,28 26,32" />
      <circle cx="46" cy="28" r="2.1" fill={ink} />
    </g>
  )
}

function Castle({ color, ink }: { color: string; ink: string }) {
  return (
    <g>
      <path
        fill={color}
        d="M8 56 V32 H12 V24 H20 V32 H24 V18 H28 V10 H36 V18 H40 V10 H48 V18 H52 V32 H56 V24 H64 V32 H56 V56 Z"
        transform="translate(-4 0)"
      />
      <path fill={ink} d="M28 56 V40 Q28 34 32 34 Q36 34 36 40 V56 Z" />
      <rect x="16" y="36" width="6" height="7" fill={ink} />
      <rect x="42" y="36" width="6" height="7" fill={ink} />
    </g>
  )
}

function Anchor({ color }: { color: string }) {
  return (
    <g fill={color}>
      <circle cx="32" cy="13" r="6.5" fill="none" stroke={color} strokeWidth="4" />
      <rect x="29.5" y="18" width="5" height="28" rx="1" />
      <rect x="17" y="24" width="30" height="5" rx="2" />
      <path d="M11 42 C11 55 21 61 32 61 C43 61 53 55 53 42 H45 C45 51 39 55 32 55 C25 55 19 51 19 42 Z" />
      <polygon points="11,42 4,33 17,46" />
      <polygon points="53,42 60,33 47,46" />
    </g>
  )
}

function Sun({ color }: { color: string }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <g fill={color}>
      {rays.map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180
        const tipX = 32 + Math.cos(a) * 26
        const tipY = 32 + Math.sin(a) * 26
        const left = ((deg - 102) * Math.PI) / 180
        const right = ((deg - 78) * Math.PI) / 180
        return (
          <polygon
            key={deg}
            points={`${tipX},${tipY} ${32 + Math.cos(left) * 11},${32 + Math.sin(left) * 11} ${32 + Math.cos(right) * 11},${32 + Math.sin(right) * 11}`}
          />
        )
      })}
      <circle cx="32" cy="32" r="13" />
    </g>
  )
}

function Star({ color }: { color: string }) {
  const pts: string[] = []
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? 24 : 10
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${32 + Math.cos(a) * r},${32 + Math.sin(a) * r}`)
  }
  return <polygon fill={color} points={pts.join(' ')} />
}
