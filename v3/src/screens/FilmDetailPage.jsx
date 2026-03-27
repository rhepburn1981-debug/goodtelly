import React, { useState } from 'react'
import { FaPlay, FaPlus, FaCheck, FaStar, FaArrowLeft, FaPaperPlane } from 'react-icons/fa'

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
  const stills = film.stills && film.stills.length > 0 ? film.stills : (backdrop ? [backdrop] : [])
  const hasTrailer = !!film.trailer_url

  function playTrailer() {
    if (hasTrailer) {
      setShowTrailer(true)
    } else {
      onWatchTrailer && onWatchTrailer(film.trailer_url)
    }
  }

  const trailerSrc = film.trailer_url
    ? (film.trailer_url.split('?')[0] + '?rel=0&modestbranding=1&autoplay=1&playsinline=1')
    : ''

  // Format rating to show stars
  const renderStars = (rating) => {
    const stars = Math.round((rating || 10) / 2)
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        {[...Array(5)].map((_, i) => (
          <svg key={i} viewBox="0 0 10 10" width="10" height="10">
            <path
              d="M5 1l1.1 2.2 2.4.4-1.75 1.7.4 2.45L5 6.65l-2.15 1.1.4-2.45L1.5 3.6l2.4-.4z"
              fill={i < stars ? "var(--gold-bright)" : "rgba(255,255,255,0.1)"}
              stroke={i < stars ? "var(--gold)" : "rgba(255,255,255,0.2)"}
              strokeWidth="0.3"
            />
          </svg>
        ))}
        <span style={{ fontSize: '10px', color: 'var(--text2)', marginLeft: '3px' }}>{rating || 10}</span>
      </span>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0D0D13',
      zIndex: 400,
      paddingBottom: '64px',
      overflow: 'hidden auto',
      overscrollBehavior: 'contain',
      fontFamily: 'var(--ff-body)',
      color: '#fff',
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.8s ease forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Hero Section */}
      <div style={{ position: 'relative', height: '230px', flexShrink: 0 }}>
        <img src={backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0, 0, 0, 0.25) 0%, rgb(13, 13, 19) 100%)' }} />

        {/* Play Button Overlay (Always show if backdrop exists) */}
        {backdrop && (
          <button onClick={playTrailer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', boxShadow: 'rgba(0, 0, 0, 0.6) 0px 4px 28px' }}>
              <div style={{ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid rgb(17, 17, 17)', marginLeft: '4px' }} />
            </div>
          </button>
        )}

        {/* Back Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '14px', left: '14px', background: 'rgba(8, 8, 14, 0.72)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '40px', padding: '8px 14px 8px 10px', color: 'var(--text)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10
        }}>
          <FaArrowLeft size={12} />
          <span style={{ fontSize: '12px', fontWeight: '700' }}>Back</span>
        </button>
      </div>

      {/* Content Body */}
      <div style={{ padding: '4px 18px 36px', maxWidth: '680px', margin: '0px auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: "var(--ff-display, 'Cormorant Garamond', serif)", fontSize: '24px', fontWeight: '900', color: 'var(--text)', lineHeight: '1.15', marginBottom: '6px' }}>
          {film.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{film.year}</span>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{film.runtime || film.duration || 'N/A'}</span>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
          <span style={{ fontSize: '10px', borderRadius: '6px', padding: '2px 8px', background: 'rgba(255,255,255,0.03)', color: 'var(--text2)' }}>{film.genre}</span>
        </div>

        <div style={{ marginBottom: '6px' }}>
          {renderStars(film.rating)}
        </div>

        {/* Action Row 1 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button
            onClick={() => isAdded ? onRemoveFromList(film) : onAddToList(film)}
            style={{
              flex: '1 1 0%', padding: '11px 6px', background: 'rgba(201, 168, 76, 0.12)', border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: '800', color: 'var(--gold-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px'
            }}
          >
            {isAdded ? <FaCheck size={12} /> : <FaPlus size={12} />}
            {isAdded ? 'Watchlisted' : '+ Watchlist'}
          </button>

          <button
            onClick={() => onRecommend(film)}
            style={{
              flex: '1 1 0%', padding: '11px 6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', cursor: 'pointer', fontWeight: '700', color: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '12px'
            }}
          >
            <FaPaperPlane size={12} />
            Recommend
          </button>
        </div>

        {/* Seen It Button */}
        <button
          onClick={() => isWatched ? onUnmarkWatched(film) : onMarkWatched(film)}
          style={{
            width: '100%', padding: '12px', background: 'rgba(46, 204, 138, 0.08)', border: '1px solid rgba(46, 204, 138, 0.25)',
            borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', color: 'rgb(39, 174, 96)',
            marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <FaCheck size={14} />
          {isWatched ? 'Completed' : 'Seen it?'}
        </button>

        {/* About Section */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>About</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.75' }}>
            {film.overview || film.description || "The story details for this film are currently unavailable."}
          </div>
        </div>

        {/* Director & Cast Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Director</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{film.director || "TBA"}</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>Cast</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>{film.cast || "Cast information not available."}</div>
          </div>
        </div>

        {/* Images Selection */}
        {stills.length > 0 && (
          <div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Images</div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', height: '158px', background: 'rgba(255,255,255,0.02)' }}>
              <img
                src={stills[activeStill] || backdrop}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
              {stills.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStill(idx)}
                  style={{
                    flex: '0 0 80px', height: '52px', borderRadius: '8px', overflow: 'hidden',
                    border: activeStill === idx ? '2px solid var(--gold-bright)' : '2px solid transparent',
                    padding: '0px', cursor: 'pointer', background: 'none'
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeStill === idx ? 1 : 0.6 }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Overlay */}
      {showTrailer && trailerSrc && (
        <div className="fade-in" style={{
          position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <button
            onClick={() => setShowTrailer(false)}
            style={{
              position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none',
              color: '#fff', fontSize: '32px', cursor: 'pointer', zIndex: 1001
            }}
          >
            ×
          </button>
          <div style={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
            <iframe
              src={trailerSrc}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
