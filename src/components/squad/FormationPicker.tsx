/**
 * Formation picker: eight shapes plus a mini pitch.
 * Owns the tap list; applying a formation rebuilds the starting 11.
 */
import { FORMATIONS, getFormation, slotsLine } from '../../game/formations.ts'
import type { FormationId } from '../../types/game.ts'
import { MiniPitch } from './MiniPitch.tsx'

export function FormationPicker({
  formationId,
  onPick,
}: {
  formationId: FormationId
  onPick: (id: FormationId) => void
}) {
  const selected = getFormation(formationId)
  return (
    <article className="card">
      <h2>Formation</h2>
      <div className="formation-row">
        <MiniPitch formation={selected} />
        <div>
          <p className="gold">{selected.name}</p>
          <p className="muted">{slotsLine(selected)}</p>
          <p className="muted">{selected.blurb}</p>
        </div>
      </div>
      <div className="chip-row">
        {FORMATIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === formationId ? 'chip on' : 'chip'}
            onClick={() => onPick(item.id)}
          >
            {item.id}
          </button>
        ))}
      </div>
    </article>
  )
}
