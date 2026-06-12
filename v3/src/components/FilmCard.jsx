// Film card with backdrop image, poster, title, and action buttons
// Used in HomeTab recommendations and elsewhere

export default function FilmCard({ film, onOpen, onAddToList, onWatchTrailer, isAdded, isWatched }) {
  const backdrop = film.backdrop_url || film.poster_url || ''
  const poster   = film.poster_url || ''

  return (
    <div
      onClick={() => onOpen && onOpen(film)}
      style={{
        background: 'var(--surface2)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid var(--border)',
        animation: 'fadeUp 0.3s ease',
      }}
    >
      {/* Backdrop */}
      {backdrop && (
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          background: 'var(--surface3)',
          overflow: 'hidden',
        }}>
          <img
            src={backdrop}
            alt={film.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        </div>
      )}

      <div style={{ padding: '12px 14px 14px', display: 'flex', gap: 12 }}>
        {/* Poster */}
        {poster && (
          <img
            src={poster}
            alt=""
            style={{
              width: 54,
              height: 80,
              borderRadius: 8,
              objectFit: 'cover',
              flexShrink: 0,
              border: '1px solid var(--border)',
            }}
            loading="lazy"
          />
        )}

        {/* Info + buttons */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--ff-display)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.2,
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {film.title}
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
            {[film.year, film.genre].filter(Boolean).join(' · ')}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {film.trailer_url && onWatchTrailer && (
              <button
                onClick={(e) => { e.stopPropagation(); onWatchTrailer(film.trailer_url) }}
                style={outlineBtn()}
              >
                ▶ Trailer
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onAddToList && onAddToList(film) }}
              style={isAdded ? filledBtn() : outlineBtn()}
            >
              {isAdded ? '✓ In List' : '+ My List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function outlineBtn() {
  return {
    background: 'transparent',
    border: '1px solid var(--border2)',
    color: 'var(--text)',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--ff-body)',
  }
}

function filledBtn() {
  return {
    ...outlineBtn(),
    background: 'var(--gold-glow)',
    borderColor: 'var(--gold)',
    color: 'var(--gold-bright)',
  }
}
