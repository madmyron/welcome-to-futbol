/**
 * Top-down picture of the club’s ground.
 * Owns the drawing; extras and seat color come from stadium data.
 */
import { hasExtra } from '../../game/stadium.ts'
import type { Crest, Stadium } from '../../types/game.ts'
import { ClubCrest } from '../crest/ClubCrest.tsx'

export function StadiumView({ stadium, crest }: { stadium: Stadium; crest: Crest }) {
  const t = 14 + stadium.standLevel * 7
  const p = { x: 70, y: 58, w: 100, h: 70 }
  const bowl = { x: p.x - t, y: p.y - t, w: p.w + t * 2, h: p.h + t * 2 }
  const seats = stadium.seatColor
  return (
    <div className="stadium-view">
      <svg viewBox="0 0 240 200" role="img" aria-label={stadium.name}>
        <rect width="240" height="200" rx="12" fill="#152033" />
        <rect x="10" y="10" width="220" height="180" rx="14" fill="#1a3a24" />
        <rect x={bowl.x} y={bowl.y} width={bowl.w} height={bowl.h} rx="8" fill={seats} />
        <Pitch x={p.x} y={p.y} w={p.w} h={p.h} style={stadium.pitchStyle} />
        {hasExtra(stadium, 'roof') ? (
          <rect
            x={bowl.x - 5}
            y={bowl.y - 5}
            width={bowl.w + 10}
            height={bowl.h + 10}
            rx="10"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="7"
            opacity="0.8"
          />
        ) : null}
        {hasExtra(stadium, 'lights') ? (
          <g fill="#e8c547">
            <Light x={bowl.x - 2} y={bowl.y + 8} />
            <Light x={bowl.x + bowl.w - 2} y={bowl.y + 8} />
            <Light x={bowl.x - 2} y={bowl.y + bowl.h - 30} />
            <Light x={bowl.x + bowl.w - 2} y={bowl.y + bowl.h - 30} />
          </g>
        ) : null}
        {hasExtra(stadium, 'screen') ? (
          <rect x={p.x + 28} y={p.y + p.h + 3} width="44" height="9" rx="1" fill="#0b1220" stroke="#e8c547" />
        ) : null}
        {hasExtra(stadium, 'hospitality')
          ? Array.from({ length: 6 }, (_, i) => (
              <rect key={i} x={p.x + 10 + i * 14} y={p.y - t + 4} width="10" height="7" rx="1" fill="#e8c547" />
            ))
          : null}
        {hasExtra(stadium, 'shop') ? (
          <g>
            <rect x="16" y="148" width="40" height="30" rx="3" fill="#b91c1c" />
            <text x="36" y="167" textAnchor="middle" fontSize="8" fill="#fff">
              SHOP
            </text>
          </g>
        ) : null}
        {hasExtra(stadium, 'museum') ? (
          <g>
            <rect x="184" y="148" width="40" height="30" rx="3" fill="#1e3a8a" />
            <text x="204" y="167" textAnchor="middle" fontSize="7" fill="#fff">
              MUSEUM
            </text>
          </g>
        ) : null}
      </svg>
      <div className="stadium-crest">
        <ClubCrest crest={crest} size={36} />
      </div>
    </div>
  )
}

function Light({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="4" height="26" />
      <circle cx={x + 2} cy={y - 3} r="5" opacity="0.75" />
    </g>
  )
}

function Pitch({
  x,
  y,
  w,
  h,
  style,
}: {
  x: number
  y: number
  w: number
  h: number
  style: Stadium['pitchStyle']
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#1a7f4c" />
      {style === 'stripes'
        ? Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={x + i * (w / 8)} y={y} width={w / 16} height={h} fill="#166534" opacity="0.55" />
          ))
        : null}
      {style === 'check'
        ? Array.from({ length: 40 }, (_, i) => {
            const col = i % 8
            const row = Math.floor(i / 8)
            if ((col + row) % 2 !== 0) return null
            return (
              <rect
                key={i}
                x={x + col * (w / 8)}
                y={y + row * (h / 5)}
                width={w / 8}
                height={h / 5}
                fill="#166534"
                opacity="0.45"
              />
            )
          })
        : null}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#ecfdf5" strokeWidth="1.4" />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#ecfdf5" strokeWidth="1" />
      <circle cx={x + w / 2} cy={y + h / 2} r="12" fill="none" stroke="#ecfdf5" />
      <rect x={x + 8} y={y + h / 2 - 16} width="16" height="32" fill="none" stroke="#ecfdf5" />
      <rect x={x + w - 24} y={y + h / 2 - 16} width="16" height="32" fill="none" stroke="#ecfdf5" />
    </g>
  )
}
