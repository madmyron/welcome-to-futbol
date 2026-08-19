/**
 * Crest designer: picture, shape, fill style, and three color rows.
 * Owns the editor UI; dispatching SET_CREST happens in the Club screen.
 */
import {
  CREST_EMBLEMS,
  CREST_FILLS,
  CREST_SHAPES,
  type Crest,
  type CrestEmblem as EmblemId,
  type CrestFill,
  type CrestShape,
} from '../../types/game.ts'
import { ClubCrest } from './ClubCrest.tsx'
import { ColorRow } from './ColorRow.tsx'
import { CrestEmblem } from './CrestEmblem.tsx'

export function CrestEditor({
  crest,
  onChange,
}: {
  crest: Crest
  onChange: (crest: Crest) => void
}) {
  return (
    <article className="card">
      <h2>Crest</h2>
      <div className="crest-preview">
        <ClubCrest crest={crest} size={112} />
      </div>

      <p className="muted">Picture</p>
      <div className="crest-picks">
        {CREST_EMBLEMS.map((emblem: EmblemId) => (
          <button
            key={emblem}
            type="button"
            className={crest.emblem === emblem ? 'crest-pick on' : 'crest-pick'}
            aria-label={emblem}
            onClick={() => onChange({ ...crest, emblem })}
          >
            <svg viewBox="0 0 64 64" width="52" height="52" aria-hidden="true">
              <rect width="64" height="64" rx="10" fill="#efe6c9" />
              <CrestEmblem emblem={emblem} color="#1a2744" />
            </svg>
            <span>{emblem}</span>
          </button>
        ))}
      </div>

      <p className="muted">Badge shape</p>
      <div className="chip-row">
        {CREST_SHAPES.map((shape: CrestShape) => (
          <button
            key={shape}
            type="button"
            className={crest.shape === shape ? 'chip on' : 'chip'}
            onClick={() => onChange({ ...crest, shape })}
          >
            {shape}
          </button>
        ))}
      </div>

      <p className="muted">Background style</p>
      <div className="chip-row">
        {CREST_FILLS.map((fill: CrestFill) => (
          <button
            key={fill}
            type="button"
            className={(crest.fill ?? 'linear') === fill ? 'chip on' : 'chip'}
            onClick={() => onChange({ ...crest, fill })}
          >
            {fill === 'linear' ? 'gradient' : fill === 'split' ? 'halves' : fill}
          </button>
        ))}
      </div>

      <ColorRow
        label="Background"
        value={crest.background}
        onPick={(background) => onChange({ ...crest, background })}
      />
      {(crest.fill ?? 'linear') !== 'solid' ? (
        <ColorRow
          label="Background 2"
          value={crest.background2}
          onPick={(background2) => onChange({ ...crest, background2 })}
        />
      ) : null}
      <ColorRow
        label="Picture"
        value={crest.emblemColor}
        onPick={(emblemColor) => onChange({ ...crest, emblemColor })}
      />
      <ColorRow label="Frame" value={crest.frame} onPick={(frame) => onChange({ ...crest, frame })} />
    </article>
  )
}
