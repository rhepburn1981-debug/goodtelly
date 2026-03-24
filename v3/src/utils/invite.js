// Invite data persisted in localStorage so it survives Google auth page redirects.
// WhatsApp's in-app browser (WKWebView) clears sessionStorage during OAuth redirects.

const KEY = 'reel_invite'
const TTL = 60 * 60 * 1000 // 1 hour

export function writeInvite({ from, slug, title, year, note, rating }) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      from, slug, title, year, note, rating,
      exp: Date.now() + TTL,
    }))
  } catch (_) {}
}

export function readInvite() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data.exp && Date.now() > data.exp) {
      localStorage.removeItem(KEY)
      return null
    }
    return data
  } catch (_) {
    return null
  }
}

export function clearInvite() {
  try { localStorage.removeItem(KEY) } catch (_) {}
}

// Pull invite fields from URL params as a fallback (belt-and-suspenders)
export function readInviteFromUrl() {
  const p = new URLSearchParams(window.location.search)
  const from = p.get('invite_from') || p.get('from_user') || ''
  if (!from) return null
  return {
    from,
    slug:   p.get('invite_slug')  || '',
    title:  p.get('invite_title') || p.get('title') || '',
    year:   p.get('invite_year')  || p.get('year')  || '',
    note:   p.get('invite_note')  || p.get('note')  || '',
    rating: p.get('invite_rating')|| p.get('rating')|| '',
  }
}

// Returns the best available invite, preferring localStorage over URL params
export function consumeInvite() {
  const ls = readInvite()
  clearInvite()
  if (ls) return ls
  return readInviteFromUrl()
}

// Build the fields to send to /api/auth/register or /api/auth/google
export function inviteToApiFields(invite) {
  if (!invite || !invite.from) return {}
  const fields = { invite_from_user: invite.from }
  if (invite.title) {
    fields.invite_film_title = invite.title
    if (invite.year)   fields.invite_film_year = parseInt(invite.year)
    if (invite.note)   fields.invite_note = invite.note
    if (invite.rating) fields.invite_rating = parseFloat(invite.rating)
  }
  return fields
}
