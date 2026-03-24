// Search results overlay — shown when user types in the search bar
// Merges local DB results with TMDB results (TMDB results have blue badge)

export default function SearchOverlay({ results, loading, addedIds, onOpenFilm, onAddToList }) {
  if (loading && results.length === 0) {
    return (
      <div style={{ padding: '20px 16px', color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
        Searching...
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div style={{ padding: '20px 16px', color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
        No results found.
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 16px', paddingBottom: 100 }}>
      {results.map((film) => {
        const isAdded = addedIds.includes(film.id)
        const isTmdb  = film._fromTmdb || film._fromTvmaze

        return (
          <div
            key={(film.id || '') + (film.title || '')}
            onClick={() => onOpenFilm(film)}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            {film.poster_url ? (
              <img
                src={film.poster_url}
                alt=""
                style={{ width: 42, height: 62, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                loading="lazy"
              />
            ) : (
              <div style={{
                width: 42, height: 62, borderRadius: 6,
                background: 'var(--surface3)', flexShrink: 0,
              }} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
                  {film.title}
                </span>
                {isTmdb && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: '#60a5fa',
                    background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)',
                    borderRadius: 4, padding: '1px 5px', letterSpacing: 0.5,
                  }}>
                    TMDB
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {[film.year, film.genre].filter(Boolean).join(' · ')}
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onAddToList(film) }}
              style={{
                flexShrink: 0,
                background: isAdded ? 'var(--gold-glow)' : 'transparent',
                border: '1px solid ' + (isAdded ? 'var(--gold)' : 'var(--border2)'),
                borderRadius: 20,
                color: isAdded ? 'var(--gold-bright)' : 'var(--text)',
                padding: '5px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--ff-body)',
                whiteSpace: 'nowrap',
              }}
            >
              {isAdded ? '✓ Added' : '+ Add'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
