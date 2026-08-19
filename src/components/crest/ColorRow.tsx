/**
 * One labeled row of color dots for crest background, picture, or frame.
 * Owns the swatch taps; parent updates the crest.
 */
import { CREST_PALETTE } from '../../data/colors.ts'

export function ColorRow({
  label,
  value,
  onPick,
}: {
  label: string
  value: string
  onPick: (color: string) => void
}) {
  return (
    <div className="color-row">
      <p className="muted">{label}</p>
      <div className="swatches">
        {CREST_PALETTE.map((color) => (
          <button
            key={`${label}-${color}`}
            type="button"
            className={value.toLowerCase() === color.toLowerCase() ? 'swatch on' : 'swatch'}
            style={{ background: color }}
            aria-label={`${label} ${color}`}
            onClick={() => onPick(color)}
          />
        ))}
      </div>
    </div>
  )
}
