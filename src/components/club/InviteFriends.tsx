/**
 * Invite friends by email now, or by FLY member name when the game is in FLY.
 * Owns the form; sending mail/share lives in invite.ts.
 */
import { useState } from 'react'
import { useGame } from '../../context/useGame.ts'
import { inviteMessage, looksLikeEmail, openEmailInvite, shareInvite } from '../../game/invite.ts'
import { humanClub } from '../../game/selectors.ts'

export function InviteFriends() {
  const { state, dispatch } = useGame()
  const club = humanClub(state)
  const [via, setVia] = useState<'email' | 'fly'>('email')
  const [value, setValue] = useState('')
  const [note, setNote] = useState<string | null>(null)

  const send = async () => {
    const to = value.trim()
    if (via === 'email') {
      if (!looksLikeEmail(to)) {
        setNote('Need a real email, like name@mail.com.')
        return
      }
      dispatch({ type: 'ADD_INVITE', via: 'email', to })
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Welcome to Futbol',
            text: inviteMessage(club.name),
            url: window.location.href,
          })
          setNote(`Share sheet opened for ${to}. You can also pick Mail.`)
        } else {
          openEmailInvite(to, club.name)
          setNote(`Opening mail to ${to}.`)
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          openEmailInvite(to, club.name)
          setNote(`Opening mail to ${to}.`)
        }
      }
      setValue('')
      return
    }
    if (to.length < 2) {
      setNote('Type their FLY member name.')
      return
    }
    dispatch({ type: 'ADD_INVITE', via: 'fly', to })
    const shared = await shareInvite(club.name)
    setNote(
      `Saved FLY name “${to}”. When this game is in Fans Like You, we can look them up. ${
        shared === 'copied' ? 'Invite text copied for now.' : 'Share the link with them today.'
      }`,
    )
    setValue('')
  }

  return (
    <article className="card">
      <h2>Invite friends</h2>
      <p className="muted">Email works now. FLY member names wait until the game is inside Fans Like You.</p>
      <div className="seg" role="tablist" aria-label="Invite by">
        <button
          type="button"
          role="tab"
          aria-selected={via === 'email'}
          className={via === 'email' ? 'on' : ''}
          onClick={() => setVia('email')}
        >
          Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={via === 'fly'}
          className={via === 'fly' ? 'on' : ''}
          onClick={() => setVia('fly')}
        >
          FLY name
        </button>
      </div>
      <form
        className="invite-form"
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode={via === 'email' ? 'email' : 'text'}
          autoCapitalize={via === 'email' ? 'none' : 'words'}
          autoCorrect="off"
          placeholder={via === 'email' ? 'friend@email.com' : 'Their FLY member name'}
          aria-label={via === 'email' ? 'Friend email' : 'FLY member name'}
        />
        <button type="submit" className="btn primary">
          {via === 'email' ? 'Send invite' : 'Save FLY invite'}
        </button>
      </form>
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          void shareInvite(club.name).then((result) => {
            setNote(
              result === 'shared'
                ? 'Share sheet opened.'
                : result === 'copied'
                  ? `Copied: ${inviteMessage(club.name)}`
                  : 'Could not share. Copy the page address from your browser.',
            )
          })
        }}
      >
        Share link
      </button>
      {note ? <p className="ok">{note}</p> : null}
      {state.invites?.length ? (
        <ul className="invite-list">
          {state.invites.slice(0, 8).map((row) => (
            <li key={row.id}>
              {row.via === 'fly' ? 'FLY' : 'Email'} · {row.to}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
