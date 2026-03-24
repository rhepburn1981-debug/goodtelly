import { useState } from 'react'

// Full-screen film detail overlay
// Field names: film.poster_url, film.backdrop_url, film.trailer_url, film.overview
// (normalized by normalizeFilm() before reaching here)

export default function FilmDetailPage({
  film,
  onClose,
  isAdded,
  isWatched,
  onAddToList,
  onRemoveFromList,
  onMarkWatched,
  onUnmarkWatched,
  onWatchTrailer,
  onRecommend,
  currentUser,
}) {
  const [showTrailer, setShowTrailer] = useState(false)
  const [activeStill, setActiveStill] = useState(0)

  const backdrop = film.backdrop_url || film.poster_url || ''
  const stills   = film.stills || []
  const hasTrailer = !!film.trailer_url

  function playTrailer() {
    setShowTrailer(true)
  }

  const trailerSrc = film.trailer_url
    ? (film.trailer_url.split('?')[0] + '?rel=0&modestbranding=1&autoplay=1&playsinline=1')
    : ''

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0D0D13',
      zIndex: 300,
      overflowY: 'auto',
      overflowX: 'hidden',
      overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: 64,
    }}>
      {/* Backdrop / Trailer area */}
      {showTrailer && film.trailer_url ? (
        <div style={{ position: 'relative', height: 230, flexShrink: 0, background: '#000' }}>
          <iframe
            src={trailerSrc}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
            allowFullScreen
            title="trailer"
          />
          <button onClick={() => setShowTrailer(false)} style={backBtn()}>
            ← Close
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', height: 230, flexShrink: 0 }}>
          {backdrop && (
            <img
              src={backdrop}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          )}
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, #0D0D13 100%)',
          }} />
          {/* Theme color tint */}
          {film.color && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, ' + film.color + '44, transparent 60%)',
            }} />
          )}

          {/* Play button */}
          {hasTrailer && (
            <button
              onClick={playTrailer}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(255,255,255,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 28px rgba(0,0,0,0.6)',
              }}>
                <div style={{
                  width: 0, height: 0,
                  borderTop: '11px solid transparent',
                  borderBottom: '11px solid transparent',
                  borderLeft: '18px solid #111',
                  marginLeft: 4,
                }} />
              </div>
            </button>
          )}

          {/* Back button */}
          <button onClick={onClose} style={backBtn()}>
            ← Back
          </button>

          {/* Watched badge */}
          {isWatched && (
            <div style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(10,26,18,0.85)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(46,204,138,0.35)', borderRadius: 40,
              padding: '6px 12px', fontSize: 11, fontWeight: 700,
              color: 'var(--green)',
            }}>
              ✓ Watched
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '4px 18px 36px', maxWidth: 680, margin: '0 auto' }}>
        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 22, fontWeight: 900,
          color: 'var(--text)', lineHeight: 1.15, marginBottom: 6,
        }}>
          {film.title}
        </h1>

        {/* Meta */}
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
          {[film.year, film.genre, film.runtime].filter(Boolean).join(' · ')}
          {film.rating && (
            <span style={{ marginLeft: 8, color: 'var(--gold-bright)' }}>
              ★ {Number(film.rating).toFixed(1)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {hasTrailer && (
            <button onClick={playTrailer} style={pillBtn('primary')}>
              ▶ Trailer
            </button>
          )}
          <button
            onClick={() => isAdded ? onRemoveFromList(film) : onAddToList(film)}
            style={pillBtn(isAdded ? 'gold' : 'outline')}
          >
            {isAdded ? '✓ In My List' : '+ My List'}
          </button>
          <button
            onClick={() => isWatched ? onUnmarkWatched(film) : onMarkWatched(film)}
            style={pillBtn(isWatched ? 'green' : 'outline')}
          >
            {isWatched ? '✓ Watched' : 'Mark Watched'}
          </button>
          {currentUser && (
            <button onClick={() => onRecommend(film)} style={pillBtn('outline')}>
              📲 Recommend
            </button>
          )}
        </div>

        {/* Description */}
        {film.overview && (
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 20 }}>
            {film.overview}
          </p>
        )}

        {/* Streamers */}
        {(film.streamers || []).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Where to watch
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {film.streamers.map((s) => (
                <div key={s} style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border2)',
                  borderRadius: 8,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text)',
                }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stills */}
        {stills.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Photos
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {stills.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  onClick={() => setActiveStill(i)}
                  style={{
                    height: 100,
                    borderRadius: 8,
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: activeStill === i ? '2px solid var(--gold)' : '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* Cast */}
        {film.cast && (
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Cast: </span>
            {film.cast}
          </div>
        )}
      </div>
    </div>
  )
}

function backBtn() {
  return {
    position: 'absolute', top: 14, left: 14,
    background: 'rgba(8,8,14,0.72)', backdropFilter: 'blur(12px)',
    border: '1px solid var(--border2)', borderRadius: 40,
    padding: '8px 14px', color: 'var(--text)',
    cursor: 'pointer', fontSize: 12, fontWeight: 700,
    fontFamily: 'var(--ff-body)',
  }
}

function pillBtn(variant) {
  const base = {
    borderRadius: 20,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--ff-body)',
    border: '1px solid',
  }
  if (variant === 'primary')  return { ...base, background: 'var(--text)', borderColor: 'var(--text)', color: '#000' }
  if (variant === 'gold')     return { ...base, background: 'var(--gold-glow)', borderColor: 'var(--gold)', color: 'var(--gold-bright)' }
  if (variant === 'green')    return { ...base, background: 'rgba(46,204,138,0.12)', borderColor: 'var(--green)', color: 'var(--green)' }
  return { ...base, background: 'transparent', borderColor: 'var(--border2)', color: 'var(--text)' }
}
