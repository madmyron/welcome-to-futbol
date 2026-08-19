/**
 * Invite copy, mail, and phone share sheet.
 * Owns how the invite is sent; the Club screen stores who was asked.
 */
export function gameUrl(): string {
  return window.location.origin + window.location.pathname
}

export function inviteMessage(clubName: string): string {
  return `Come play Welcome to Futbol with me. I own ${clubName}. ${gameUrl()}`
}

export function inviteSubject(clubName: string): string {
  return `${clubName} wants you in Welcome to Futbol`
}

export function openEmailInvite(email: string, clubName: string): void {
  const subject = encodeURIComponent(inviteSubject(clubName))
  const body = encodeURIComponent(inviteMessage(clubName))
  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`
}

export async function shareInvite(clubName: string): Promise<'shared' | 'copied' | 'failed'> {
  const text = inviteMessage(clubName)
  const url = gameUrl()
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Welcome to Futbol', text, url })
      return 'shared'
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'failed'
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
