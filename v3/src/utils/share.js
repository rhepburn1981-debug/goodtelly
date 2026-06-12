// Build a WhatsApp share URL for a film recommendation

export function buildShareUrl(film, currentUser, note = '', rating = '') {
  const base = window.location.origin + '/share'
  const params = new URLSearchParams()
  params.set('title',     film.title || '')
  params.set('year',      film.year  || '')
  params.set('runtime',   film.runtime ? film.runtime + 'm' : '')
  params.set('genre',     (film.genres || []).join(', '))
  params.set('rating',    rating || '')
  params.set('from',      currentUser?.display_name || currentUser?.username || '')
  params.set('from_user', currentUser?.username || '')
  params.set('note',      note || '')
  params.set('poster',    film.backdrop_url || film.poster_url || '')
  params.set('trailer',   film.trailer_url || '')
  params.set('color',     film.theme_color || '')
  return base + '?' + params.toString()
}

export function sendViaWhatsApp(shareUrl, film, fromName, note, rating) {
  const stars = rating ? '⭐'.repeat(Math.round(rating)) : ''
  const noteStr = note ? '\n"' + note + '"' : ''
  const ratingStr = stars ? '\n' + fromName + ' gave it ' + stars : ''
  const text = (
    fromName + " thinks you'll Love this!" +
    noteStr +
    ratingStr +
    '\n\nJoin them on Watch Chums - Share and See what your friends are watching\n\n' +
    shareUrl
  )
  window.location.href = 'https://wa.me/?text=' + encodeURIComponent(text)
}
