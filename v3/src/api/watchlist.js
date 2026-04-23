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
