/**
 * Club identity: name, crest, kits, stadium, new save.
 * Owns the editors; upgrades and kit data live in the game folder.
 */
import { useEffect, useRef, useState } from 'react'
import { InviteFriends } from '../components/club/InviteFriends.tsx'
import { TrophyCase } from '../components/club/TrophyCase.tsx'
import { ClubCrest } from '../components/crest/ClubCrest.tsx'
import { CrestEditor } from '../components/crest/CrestEditor.tsx'
import { KitPreview } from '../components/kit/KitPreview.tsx'
import { StadiumStudio } from '../components/stadium/StadiumStudio.tsx'
import { useGame } from '../context/useGame.ts'
import { COLOR_PAIRS } from '../data/colors.ts'
import { humanClub } from '../game/selectors.ts'
import { KIT_PATTERNS, type KitPattern } from '../types/game.ts'

export function ClubScreen() {
  const { state, dispatch } = useGame()
  const club = humanClub(state)
  const [name, setName] = useState(club.name)
  const [which, setWhich] = useState<'home' | 'away'>('home')
  const kit = which === 'home' ? club.homeKit : club.awayKit
  const nameRef = useRef(name)
  nameRef.current = name

  useEffect(() => {
    setName(club.name)
  }, [club.name])

  useEffect(() => {
    const saveName = () => {
      const next = nameRef.current.trim()
      if (next) dispatch({ type: 'RENAME_CLUB', name: next })
    }
    const onHide = () => {
      if (document.visibilityState === 'hidden') saveName()
    }
    window.addEventListener('pagehide', saveName)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      saveName()
      window.removeEventListener('pagehide', saveName)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [dispatch])

  return (
    <section className="stack">
      <article className="card">
        <h2>Club</h2>
        <p className="muted">Kits, crest, and stadium save on this device as you tap. Phone and computer are not linked yet.</p>
        <div className="row">
          <ClubCrest crest={club.crest} size={64} titles={club.crownCups ?? 0} />
          <form
            className="grow"
            onSubmit={(e) => {
              e.preventDefault()
              dispatch({ type: 'RENAME_CLUB', name })
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name.trim()) dispatch({ type: 'RENAME_CLUB', name })
                else setName(club.name)
              }}
              maxLength={32}
              aria-label="Club name"
            />
            <button type="submit" className="btn small">
              Save name
            </button>
          </form>
        </div>
      </article>

      <TrophyCase crownCups={club.crownCups ?? 0} crest={club.crest} />

      <StadiumStudio />

      <CrestEditor crest={club.crest} onChange={(crest) => dispatch({ type: 'SET_CREST', crest })} />

      <article className="card">
        <h2>Kits</h2>
        <div className="row kits">
          <KitPreview kit={club.homeKit} label="Home" />
          <KitPreview kit={club.awayKit} label="Away" />
        </div>
        <div className="seg">
          <button type="button" className={which === 'home' ? 'on' : ''} onClick={() => setWhich('home')}>
            Edit home
          </button>
          <button type="button" className={which === 'away' ? 'on' : ''} onClick={() => setWhich('away')}>
            Edit away
          </button>
        </div>
        <div className="chip-row">
          {KIT_PATTERNS.map((pattern: KitPattern) => (
            <button
              key={pattern}
              type="button"
              className={kit.pattern === pattern ? 'chip on' : 'chip'}
              onClick={() => dispatch({ type: 'SET_KIT', which, kit: { ...kit, pattern } })}
            >
              {pattern}
            </button>
          ))}
        </div>
        <div className="swatches">
          {COLOR_PAIRS.map((pair) => (
            <button
              key={`${which}-${pair.primary}`}
              type="button"
              className={kit.primary === pair.primary && kit.secondary === pair.secondary ? 'swatch on' : 'swatch'}
              style={{ background: pair.primary, borderColor: pair.secondary }}
              aria-label="Kit colors"
              onClick={() =>
                dispatch({ type: 'SET_KIT', which, kit: { ...kit, primary: pair.primary, secondary: pair.secondary } })
              }
            />
          ))}
        </div>
      </article>

      <InviteFriends />

      <button
        type="button"
        className="btn ghost danger"
        onClick={() => {
          if (window.confirm('Start a new club? This save on this device will be replaced.')) {
            dispatch({ type: 'NEW_GAME' })
          }
        }}
      >
        New game
      </button>
    </section>
  )
}
