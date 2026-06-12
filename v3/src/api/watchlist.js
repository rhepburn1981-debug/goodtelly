import { api } from './client'
import { normalizeFilm } from '../utils/normalize'

export function getWatchlist() {
  // Returns array of film objects — each has `id`, `watched` boolean
  return api.get('/api/me/watchlist').then((list) => (list || []).map(normalizeFilm))
}

export function addToWatchlist(filmId) {
  return api.post('/api/me/watchlist/' + filmId)
}

export function removeFromWatchlist(filmId) {
  return api.delete('/api/me/watchlist/' + filmId)
}

export function markWatched(filmId) {
  return api.post('/api/me/watched/' + filmId)
}

export function unmarkWatched(filmId) {
  return api.delete('/api/me/watched/' + filmId)
}

export function saveRating(filmId, rating) {
  return api.post('/api/me/ratings/' + filmId, { rating })
}

export function getUserRatings() {
  return api.get('/api/me/ratings')
}

export function getRecommendations() {
  return api.get('/api/me/recommendations').then((recs) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_recs') || '[]')
    return (recs || [])
      .filter((r) => !dismissed.includes(r.id))
      .map(normalizeFilm)
  })
}

export function sendRecommendation(toUsername, filmId, note, rating) {
  return api.post('/api/me/send-recommendation', {
    to_username: toUsername,
    film_id: filmId,
    note,
    rating,
  })
}

// Called when a user opens a WhatsApp share link — records it as a received recommendation
export function recordShareRecommendation({ film_title, film_year, from_username, note, rating, poster, trailer, genre, runtime }) {
  return api.post('/api/me/recommendations', {
    film_title,
    film_year: film_year ? parseInt(film_year) : undefined,
    from_username: from_username || '',
    note: note || '',
    rating: rating || null,
    poster,
    trailer,
    genre,
    runtime,
  })
}
