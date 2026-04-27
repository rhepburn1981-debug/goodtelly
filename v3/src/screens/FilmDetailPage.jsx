import React, { useState } from 'react'
import { FaPlay, FaPlus, FaCheck, FaStar, FaArrowLeft, FaPaperPlane, FaFilm } from 'react-icons/fa'

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
  onSaveRating,
  currentUser,
}) {
  const [activeStill, setActiveStill] = useState(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)

  const backdrop = film.backdrop_url || film.poster_url || ''
  const stills = film.stills && film.stills.length > 0 ? film.stills : (backdrop ? [backdrop] : [])
  const hasTrailer = !!film.trailer_url

  function playTrailer() {
    if (film.trailer_url) {
      onWatchTrailer && onWatchTrailer(film.trailer_url)
    }
  }

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

        .desktop-container { display: none; }
        @media (min-width: 1024px) {
          .mobile-view { display: none !important; }
          .desktop-view {
            display: flex !important;
            flex-direction: row;
            gap: 40px;
            padding: 60px 40px;
            max-width: 1200px;
            margin: 0 auto;
            align-items: flex-start;
            position: relative;
            z-index: 2;
            min-height: 100vh;
            box-sizing: border-box;
          }
          .desktop-bg {
            position: fixed;
            inset: 0;
            background-size: cover;
            background-position: center;
            opacity: 0.25;
            filter: blur(60px);
            z-index: 0;
          }
          .glass-card {
            background: rgba(20, 20, 32, 0.6);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 40px;
            box-shadow: 0 50px 100px rgba(0,0,0,0.8);
            padding: 50px;
            display: flex;
            gap: 50px;
            width: 100%;
          }
          .desktop-poster-wrapper {
            width: 320px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .desktop-poster {
            width: 100%;
            aspect-ratio: 2/3;
            border-radius: 24px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.6);
            object-fit: cover;
          }
          .desktop-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          background: rgba(0,0,0,0.88);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
        }
        .modal-box {
          background: rgba(18, 18, 26, 0.97);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px 20px 0px 0px;
          padding: 24px 24px 36px;
          width: 100%;
          max-width: 480px;
          position: relative;
        }
        .modal-handle {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.15);
          margin: 0px auto 20px;
        }

        @media (min-width: 1024px) {
          .modal-overlay {
            align-items: center;
            padding: 20px;
          }
          .modal-box {
            border-radius: 24px;
            margin: 0 20px;
          }
          .modal-handle {
            display: none;
          }
        }
      `}} />

      {/* Desktop Background Blur */}
      <div className="desktop-bg" style={{ backgroundImage: `url(${backdrop})` }} />

      {/* MOBILE VIEW (UNTOCUHED) */}
      <div className="mobile-view" style={{ paddingBottom: '64px' }}>
        {/* Hero Section */}
        <div style={{ position: 'relative', height: '230px', flexShrink: 0 }}>
          <img src={backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0, 0, 0, 0.25) 0%, rgb(13, 13, 19) 100%)' }} />

          {/* Play Button Overlay (Only show if trailer exists) */}
          {film.trailer_url && (
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

          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <button 
              onClick={() => !isAdded && onAddToList(film)} 
              disabled={isAdded}
              style={{ 
                flex: '1 1 0%', 
                padding: '11px 6px', 
                background: isAdded ? 'rgba(255, 255, 255, 0.05)' : 'rgba(201, 168, 76, 0.12)', 
                border: isAdded ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(201, 168, 76, 0.3)', 
                borderRadius: '12px', 
                cursor: isAdded ? 'default' : 'pointer', 
                fontSize: '12px', 
                fontWeight: '800', 
                color: isAdded ? 'rgba(255, 255, 255, 0.4)' : 'var(--gold-bright)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '7px',
                opacity: isAdded ? 0.8 : 1
              }}
            >
              {isAdded ? <FaCheck size={12} /> : <FaPlus size={12} />}
              {isAdded ? 'Added' : 'Watchlist'}
            </button>
            <button onClick={() => onRecommend(film)} style={{ flex: '1 1 0%', padding: '11px 6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '12px' }}>
              <FaPaperPlane size={12} />
              Recommend
            </button>
          </div>

          <button onClick={() => isWatched ? onUnmarkWatched(film) : setShowRatingModal(true)} style={{ width: '100%', padding: '12px', background: isWatched ? 'rgba(255, 255, 255, 0.05)' : 'rgba(46, 204, 138, 0.08)', border: isWatched ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(46, 204, 138, 0.25)', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', color: isWatched ? 'rgba(255, 255, 255, 0.5)' : 'rgb(39, 174, 96)', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {isWatched ? <FaCheck size={14} style={{ color: 'rgb(46, 204, 138)' }} /> : <FaFilm size={14} />}
            {isWatched ? 'Watched · Tap to remove' : 'Seen it?'}
          </button>

          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>About</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.75' }}>{film.overview || film.description || "The story details for this film are currently unavailable."}</div>
          </div>

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

          {stills.length > 0 && (
            <div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Images</div>
              <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', height: '158px', background: 'rgba(255,255,255,0.02)' }}>
                <img src={stills[activeStill] || backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
                {stills.map((url, idx) => (
                  <button key={idx} onClick={() => setActiveStill(idx)} style={{ flex: '0 0 80px', height: '52px', borderRadius: '8px', overflow: 'hidden', border: activeStill === idx ? '2px solid var(--gold-bright)' : '2px solid transparent', padding: '0px', cursor: 'pointer', background: 'none' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeStill === idx ? 1 : 0.6 }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP VIEW (NEW) */}
      <div className="desktop-view" style={{ display: 'none' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', left: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', padding: '10px 20px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
          <FaArrowLeft size={12} /> Back to dashboard
        </button>

        <div className="glass-card" style={{ marginTop: '40px' }}>
          <div className="desktop-poster-wrapper">
            <div style={{ position: 'relative', cursor: film.trailer_url ? 'pointer' : 'default' }} onClick={playTrailer}>
              <img src={film.poster_url} alt={film.title} className="desktop-poster" />
              {film.trailer_url && (
                <button style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', opacity: 0, transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                    <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid #111', marginLeft: '6px' }} />
                  </div>
                </button>
              )}
            </div>

            <div style={{ marginTop: '10px' }}>
              <button onClick={(e) => { e.stopPropagation(); isWatched ? onUnmarkWatched(film) : setShowRatingModal(true); }} style={{ width: '100%', padding: '16px', background: isWatched ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.2))', border: isWatched ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(46, 204, 138, 0.4)', borderRadius: '16px', cursor: 'pointer', fontSize: '15px', fontWeight: '800', color: isWatched ? 'rgba(255, 255, 255, 0.5)' : '#2ecc71', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                {isWatched ? <FaCheck size={16} /> : <FaFilm size={16} />}
                {isWatched ? 'Watched' : 'Seen it?'}
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    if (!isAdded) onAddToList(film);
                  }} 
                  disabled={isAdded}
                  style={{ 
                    flex: 1, 
                    padding: '14px', 
                    background: isAdded ? 'rgba(255, 255, 255, 0.05)' : 'rgba(201, 168, 76, 0.1)', 
                    border: isAdded ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(201, 168, 76, 0.3)', 
                    borderRadius: '16px', 
                    cursor: isAdded ? 'default' : 'pointer', 
                    fontSize: '13px', 
                    fontWeight: '800', 
                    color: isAdded ? 'rgba(255, 255, 255, 0.3)' : 'var(--gold-bright)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    transition: 'all 0.2s',
                    opacity: isAdded ? 0.7 : 1
                  }}
                >
                  {isAdded ? <FaCheck /> : <FaPlus />} {isAdded ? 'Added' : 'Watchlist'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); onRecommend(film); }} style={{ flex: 1, padding: '14px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', cursor: 'pointer', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}>
                  <FaPaperPlane /> Share
                </button>
              </div>
            </div>
          </div>

          <div className="desktop-content">
            <div style={{ fontFamily: "var(--ff-display, 'Cormorant Garamond', serif)", fontSize: '48px', fontWeight: '900', color: '#fff', lineHeight: '1.1', marginBottom: '12px' }}>
              {film.title}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>{film.year}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>{film.runtime || film.duration || 'N/A'}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '12px', fontWeight: '800', background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '8px', color: 'rgba(255,255,255,0.8)' }}>{film.genre}</span>
              <div style={{ marginLeft: 'auto' }}>
                {renderStars(film.rating)}
              </div>
            </div>

            <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', marginBottom: '40px', fontWeight: '400' }}>
              {film.overview || film.description || "The story details for this film are currently unavailable."}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', fontWeight: '700' }}>Director</div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: '500' }}>{film.director || "TBA"}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', fontWeight: '700' }}>Cast</div>
                <div style={{ fontSize: '15px', color: '#fff', lineHeight: '1.6', fontWeight: '500' }}>{film.cast || "Cast information not available."}</div>
              </div>
            </div>

            {stills.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px', fontWeight: '700' }}>Stills</div>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px', flexWrap: 'wrap' }} className="no-scrollbar">
                  {stills.map((url, idx) => (
                    <button key={idx} onClick={() => setActiveStill(idx)} style={{ flex: '0 0 160px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: activeStill === idx ? '3px solid var(--gold-bright)' : '3px solid rgba(255,255,255,0.05)', padding: '0px', cursor: 'pointer', transition: 'all 0.2s', filter: activeStill === idx ? 'none' : 'grayscale(0.5)' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Overlay removed in favor of global onWatchTrailer */}

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          onClick={() => { onMarkWatched(film); setShowRatingModal(false); }}
          className="fade-in modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-box"
          >
            <div className="modal-handle"></div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>You watched</div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{film.title}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '22px' }}>What did you think?</div>

            {/* Star Rating Selection */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoverRating || (selectedRating / 2))
                return (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setSelectedRating(star * 2)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', lineHeight: 1 }}
                  >
                    <svg viewBox="0 0 24 24" width="38" height="38" style={{
                      filter: isActive ? 'drop-shadow(rgba(232, 201, 106, 0.6) 0px 0px 8px)' : 'none',
                      transition: 'filter 0.15s, transform 0.1s',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)'
                    }}>
                      <defs>
                        <linearGradient id={`sp-${star}`} x1="0" x2="1" y1="0" y2="0">
                          <stop offset="0%" stopColor="#E8C96A"></stop>
                          <stop offset="100%" stopColor="#C9A84C"></stop>
                        </linearGradient>
                      </defs>
                      <polygon
                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill={isActive ? `url(#sp-${star})` : "rgba(255,255,255,0.08)"}
                        stroke={isActive ? "#C9A84C" : "rgba(255,255,255,0.15)"}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      ></polygon>
                    </svg>
                  </button>
                )
              })}
            </div>

            {selectedRating === 0 ? (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => {
                    onMarkWatched(film)
                    setShowRatingModal(false)
                  }}
                  style={{
                    background: 'none', border: 'none', color: '#5a566a', fontSize: '11px',
                    fontWeight: '500', cursor: 'pointer', textDecoration: 'none'
                  }}
                >
                  Skip rating
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => {
                    onMarkWatched(film)
                    onSaveRating(film.id, selectedRating)
                    onRecommend(film)
                    setShowRatingModal(false)
                    setSelectedRating(0)
                  }}
                  style={{
                    flex: '1 1 0%', padding: '12px 0px', background: 'rgba(201, 168, 76, 0.12)',
                    border: '1px solid rgba(201, 168, 76, 0.35)', borderRadius: '12px',
                    color: 'var(--gold-bright)', fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '13px', height: '13px', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12H4C3.45 12 3 12.45 3 13V20C3 20.55 3.45 21 4 21H20C20.55 21 21 20.55 21 20V13C21 12.45 20.55 12 20 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="currentColor" fillOpacity="0.08"></path>
                      <path d="M12 3V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                      <path d="M8.5 6.5L12 3L15.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </span>
                  Recommend
                </button>
                <button
                  onClick={() => {
                    onMarkWatched(film)
                    onSaveRating(film.id, selectedRating)
                    setShowRatingModal(false)
                    setSelectedRating(0)
                  }}
                  style={{
                    flex: '1 1 0%', padding: '12px 0px', background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px',
                    color: 'var(--text)', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  Just log it
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
