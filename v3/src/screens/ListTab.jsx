import { useState } from 'react'
import { saveRating } from '../api/watchlist'

export default function ListTab({ myList, watchedIds, onOpenFilm, onRemoveFromList, onMarkWatched, onUnmarkWatched, onToast }) {
  const [filter, setFilter]   = useState('unwatched') // 'unwatched' | 'watched'
  const [sort, setSort]       = useState('added')     // 'added' | 'rating' | 'title'
  const [genreFilter, setGenreFilter] = useState('All')

  const unwatched = myList.filter((f) => !watchedIds.has(f.film_id || f.id))
  const watched   = myList.filter((f) =>  watchedIds.has(f.film_id || f.id))
  const films     = filter === 'unwatched' ? unwatched : watched

  const genres = ['All', ...new Set(myList.flatMap((f) => f.genre ? [f.genre] : []))]

  const filtered = films
    .filter((f) => genreFilter === 'All' || f.genre === genreFilter)
    .sort((a, b) => {
      if (sort === 'rating') return (b.my_rating || 0) - (a.my_rating || 0)
      if (sort === 'title')  return (a.title || '').localeCompare(b.title || '')
      return 0 // default: added order (API order)
    })

  return (
    <div style={{ padding: '0 16px', paddingBottom: 100 }}>
      {/* Toggle watched/unwatched */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['unwatched', 'watched'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 'var(--radius-md)',
              border: filter === f ? '1px solid var(--gold)' : '1px solid var(--border)',
              background: filter === f ? 'var(--gold-glow)' : 'transparent',
              color: filter === f ? 'var(--gold-bright)' : 'var(--muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--ff-body)',
            }}
          >
            {f === 'unwatched' ? `To Watch (${unwatched.length})` : `Watched (${watched.length})`}
          </button>
        ))}
      </div>

      {/* Sort + genre */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={selectStyle()}
        >
          <option value="added">Recently added</option>
          <option value="rating">My rating</option>
          <option value="title">Title A–Z</option>
        </select>
        {genres.length > 2 && (
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            style={selectStyle()}
          >
            {genres.map((g) => <option key={g}>{g}</option>)}
          </select>
        )}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 14 }}>
          {filter === 'unwatched' ? 'No films to watch yet — add some!' : 'Nothing marked as watched yet.'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((item) => {
          const film = item.film || item
          const filmId = film.id || item.film_id
          const isWatched = watchedIds.has(filmId)

          return (
            <div
              key={filmId}
              style={{
                display: 'flex',
                gap: 12,
                background: 'var(--surface2)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
              onClick={() => onOpenFilm(film)}
            >
              {film.poster_url && (
                <img
                  src={film.poster_url}
                  alt={film.title}
                  style={{ width: 60, height: 88, objectFit: 'cover', flexShrink: 0 }}
                  loading="lazy"
                />
              )}
              <div style={{ flex: 1, padding: '10px 10px 10px 0', minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>
                  {film.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                  {[film.year, film.genre].filter(Boolean).join(' · ')}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      isWatched ? onUnmarkWatched(film) : onMarkWatched(film)
                    }}
                    style={smallBtn(isWatched)}
                  >
                    {isWatched ? '✓ Watched' : 'Mark watched'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveFromList(film) }}
                    style={smallBtn(false, true)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function selectStyle() {
  return {
    flex: 1,
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: 'var(--ff-body)',
  }
}

function smallBtn(active, muted = false) {
  return {
    background: active ? 'var(--gold-glow)' : 'transparent',
    border: '1px solid ' + (active ? 'var(--gold)' : 'var(--border)'),
    borderRadius: 20,
    color: active ? 'var(--gold-bright)' : (muted ? 'var(--muted)' : 'var(--text)'),
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--ff-body)',
  }
}
