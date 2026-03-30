import { useState, useEffect } from 'react'
import { getTrending, getWatchlistRecent, getUpcomingTv } from '../api/films'

const getChannelStyles = (channel) => {
  const norm = (channel || '').toUpperCase()
  if (norm.includes('ITV4')) return { background: 'rgb(229, 184, 0)', color: 'rgb(17, 17, 17)' }
  if (norm.includes('C4') || norm.includes('CHANNEL 4')) return { background: 'rgb(42, 42, 42)', color: 'rgb(255, 255, 255)' }
  if (norm.includes('BBC')) return { background: 'rgb(68, 68, 68)', color: 'rgb(255, 255, 255)' }
  if (norm.includes('NETFLIX')) return { background: '#e50914', color: '#fff' }
  if (norm.includes('DISNEY')) return { background: '#113ccf', color: '#fff' }
  if (norm.includes('AMAZON') || norm.includes('PRIME')) return { background: '#00aae4', color: '#fff' }
  return { background: 'rgba(255, 255, 255, 0.1)', color: 'rgb(255, 255, 255)' }
}

const FALLBACK_RECENT = [
  { id: 'f1', title: 'The Lady', year: 2026, poster_url: '/branding/poster1.png' },
  { id: 'f2', title: 'I Swear', year: 2026, poster_url: '/branding/trend1.png' },
  { id: 'f3', title: 'Saipan', year: 2026, poster_url: '/branding/poster3.png' },
  { id: 'f4', title: 'One Bottle After Another', year: 2026, poster_url: '/branding/poster4.png' },
  { id: 'f5', title: 'One Bottle After Another', year: 2026, poster_url: '/branding/poster2.png' },
]

const RecommendationCard = ({ rec, onOpenFilm, onDismiss, onAddToList, onWatchTrailer }) => {
  if (!rec) return null;
  return (
    <div style={{ margin: '2px 16px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0px 2px 6px' }}>
        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08))', border: '1px solid rgba(255, 255, 255, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <circle cx="12" cy="8.2" r="3.2" fill="rgba(255,255,255,0.78)"></circle>
            <path d="M5.5 18.5C6.7 15.7 9.1 14.2 12 14.2C14.9 14.2 17.3 15.7 18.5 18.5" stroke="rgba(255,255,255,0.78)" strokeWidth="1.8" strokeLinecap="round"></path>
          </svg>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--gold-bright)', fontWeight: 500 }}>{rec._fromFriend || 'A friend'} thinks you’ll like…</div>
        {rec._recRating && (
          <div style={{ fontSize: '12px', color: 'var(--gold-bright)', fontWeight: 700, marginLeft: 'auto', whiteSpace: 'nowrap' }}>⭐ {parseFloat(rec._recRating).toFixed(1)}</div>
        )}
      </div>
      <div style={{ background: 'linear-gradient(rgba(24, 24, 31, 0.94), rgba(10, 10, 15, 0.94))', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.09)', boxShadow: 'rgba(0, 0, 0, 0.26) 0px 12px 28px, rgba(255, 255, 255, 0.04) 0px 1px 0px inset', cursor: 'pointer', position: 'relative' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(rec.id); }}
          style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, width: '24px', height: '24px', borderRadius: '50%', background: 'rgb(255, 255, 255)', border: '2px solid rgb(17, 17, 17)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: 'rgb(17, 17, 17)', lineHeight: 1, padding: '0px' }}
        >×</button>
        <div style={{ position: 'absolute', inset: '0px', backgroundImage: `url("${rec.backdrop_url || rec.poster_url}")`, backgroundSize: 'cover', backgroundPosition: 'center center', opacity: 0.45 }}></div>
        <div style={{ position: 'absolute', inset: '0px', background: 'linear-gradient(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.52))' }}></div>
        <div
          onClick={() => onOpenFilm(rec)}
          style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 10px 7px' }}
        >
          <img src={rec.poster_url} alt={rec.title} style={{ width: '46px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, boxShadow: 'rgba(0, 0, 0, 0.45) 0px 6px 16px' }} />
          <div style={{ flex: '1 1 0%', minWidth: '0px', paddingTop: '2px', textShadow: 'rgba(0, 0, 0, 0.55) 0px 2px 8px' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text)', lineHeight: 1.1, marginBottom: '1px' }}>{rec.title}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.86)', marginBottom: '3px' }}>{rec.year}</div>
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: '8px', padding: '0px 10px 10px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onWatchTrailer(rec.trailer_url); }}
            style={{ flex: '1 1 0%', padding: '7px 11px', borderRadius: '16px', background: 'linear-gradient(rgba(28, 28, 34, 0.84), rgba(14, 14, 19, 0.84))', border: '1px solid rgba(255, 255, 255, 0.16)', color: 'var(--text)', fontSize: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', boxShadow: 'rgba(255, 255, 255, 0.06) 0px 1px 0px inset' }}
          >
            <span style={{ fontSize: '9px' }}>▶</span>Watch Trailer
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToList(rec); }}
            style={{ flex: '1 1 0%', padding: '7px 11px', borderRadius: '16px', background: 'linear-gradient(rgba(80, 61, 33, 0.52), rgba(39, 28, 14, 0.52))', border: '1px solid rgba(232, 201, 106, 0.3)', color: 'var(--text)', fontSize: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', boxShadow: 'rgba(255, 255, 255, 0.06) 0px 1px 0px inset' }}
          >
            + Watchlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HomeTab(props) {
  const {
    onOpenFilm,
    onTabChange,
    recommendations = [],
    onDismissRec,
    onAddToList,
  } = props

  const [trendingNow, setTrendingNow] = useState([])
  const [recentWatchlist, setRecentWatchlist] = useState([])
  const [upcomingShows, setUpcomingShows] = useState([])
  const [localTrailerUrl, setLocalTrailerUrl] = useState('')

  useEffect(() => {
    getTrending().then(setTrendingNow).catch(() => { })
    getWatchlistRecent().then(data => {
      if (data && data.length > 0) setRecentWatchlist(data)
      else setRecentWatchlist(FALLBACK_RECENT)
    }).catch(() => {
      setRecentWatchlist(FALLBACK_RECENT)
    })
    getUpcomingTv().then(setUpcomingShows).catch(() => { })
  }, [])

  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  return (
    <div style={{
      flex: '1 1 0%',
      overflow: 'hidden auto',
      position: 'relative',
      // paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'var(--ff-body)',
    }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hover-scale { transition: transform 0.2s ease; cursor: pointer; }
        .hover-scale:active { transform: scale(0.96); }
        .section-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 8px; }
        .section-title { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.2px; display: flex; align-items: center; gap: 6px; }
      `}</style>

      <div className="no-scrollbar" style={{ height: '100%', overflowY: 'auto' }}>
        {/* Watchlist Quick Links */}
        <div
          onClick={() => handleTabClick('list')}
          className="hover-scale"
          style={{
            margin: '10px 16px 5px',
            background: 'linear-gradient(rgba(24, 24, 31, 0.94), rgba(10, 10, 15, 0.94))',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: 'rgba(0, 0, 0, 0.26) 0px 12px 28px, rgba(255, 255, 255, 0.04) 0px 1px 0px inset',
            borderRadius: '15px',
            padding: '11px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0, background: 'rgba(59, 130, 246, 0.18)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'rgb(96, 165, 250)' }}>★</div>
          <div style={{ flex: '1 1 0%' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>My Watchlist</div>
            <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.48)', marginTop: '2px', letterSpacing: '0.02px' }}>Your saved films and shows to watch</div>
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.3)', fontWeight: 300 }}>›</div>
        </div>

        <div
          onClick={() => handleTabClick('friends')}
          className="hover-scale"
          style={{
            margin: '5px 16px 10px',
            background: 'linear-gradient(rgba(24, 24, 31, 0.94), rgba(10, 10, 15, 0.94))',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: 'rgba(0, 0, 0, 0.26) 0px 12px 28px, rgba(255, 255, 255, 0.04) 0px 1px 0px inset',
            borderRadius: '15px',
            padding: '11px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"><circle cx="9" cy="8" r="3.5" fill="rgba(255,255,255,0.5)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"></circle><path d="M2.5 20.5C2.5 17.5 5.5 15 9 15C12.5 15 15.5 17.5 15.5 20.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"></path><circle cx="17.5" cy="8" r="2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4"></circle><path d="M20.5 19.5C20.5 17.3 19.2 15.5 17.5 15.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round"></path></svg>
          </div>
          <div style={{ flex: '1 1 0%' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>Friends Watchlist</div>
            <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.48)', marginTop: '2px', letterSpacing: '0.02px' }}>See what your friends are watching</div>
          </div>
          <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.3)', fontWeight: 300 }}>›</div>
        </div>

        <RecommendationCard
          rec={recommendations && recommendations[0]}
          onOpenFilm={onOpenFilm}
          onDismiss={onDismissRec}
          onAddToList={onAddToList}
          onWatchTrailer={(url) => setLocalTrailerUrl(url)}
        />

        {/* TRENDING / What's NEW */}
        {trendingNow.length > 0 && (
          <div>
            <div className="section-header">
              <div className="section-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" style={{ flexShrink: 0 }}><path d="M12 2c0 0-1.5 2.5-1.5 5.5 0 .8.2 1.6.6 2.2C10.4 9 9.5 7.8 9.5 6.5c0 0-3.5 2.8-3.5 6.5a6 6 0 0 0 12 0C18 8.5 14.5 4.5 12 2z" fill="url(#flameG)"></path><path d="M12 10.5c0 0-1 1.5-1 3a1 1 0 0 0 2 0c0-1.5-1-3-1-3z" fill="#a8e8ff"></path><defs><linearGradient id="flameG" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse"><stop stopColor="#60c8ff"></stop><stop offset="1" stopColor="#1a6fff"></stop></linearGradient></defs></svg>
                What’s NEW
              </div>
            </div>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '0px 16px 12px' }}>
              {trendingNow.map(film => (
                <button
                  key={film.id}
                  onClick={() => onOpenFilm(film)}
                  className="hover-scale"
                  style={{ flexShrink: 0, width: '82px', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                >
                  <img
                    src={film.poster_url}
                    alt={film.title}
                    style={{ width: '82px', height: '118px', objectFit: 'cover', borderRadius: '7px', display: 'block', boxShadow: 'rgba(0, 0, 0, 0.28) 0px 10px 20px' }}
                  />
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{film.title}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.58)', marginTop: '1px', fontWeight: 500 }}>{film.year}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RECENT / Users are watching - ALWAYS RENDERED */}
        <div>
          <div className="section-header">
            <div className="section-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" style={{ flexShrink: 0 }}><path d="M3 17L9 11L13 15L21 7" stroke="url(#arrowG)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15 7h6v6" stroke="url(#arrowG)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path><defs><linearGradient id="arrowG" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#c084fc"></stop><stop offset="1" stopColor="#818cf8"></stop></linearGradient></defs></svg>
              What Reel users are watching right now
            </div>
          </div>
          <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '0px 16px 12px' }}>
            {(recentWatchlist.length > 0 ? recentWatchlist : FALLBACK_RECENT).map(film => (
              <button
                key={film.id}
                onClick={() => onOpenFilm(film)}
                className="hover-scale"
                style={{ flexShrink: 0, width: '82px', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
              >
                <img
                  src={film.poster_url}
                  alt={film.title}
                  style={{ width: '82px', height: '118px', objectFit: 'cover', borderRadius: '7px', display: 'block', boxShadow: 'rgba(0, 0, 0, 0.34) 0px 10px 22px' }}
                />
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{film.title}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.58)', marginTop: '1px', fontWeight: 500 }}>{film.year}</div>
              </button>
            ))}
          </div>
        </div>

        {/* UPCOMING / This week */}
        {upcomingShows.length > 0 && (
          <div style={{ margin: '25px 0px 0px' }}>
            <div className="section-header">
              <div className="section-title">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" style={{ flexShrink: 0 }}><path d="M4 17.8h16" stroke="#d4d8ff" strokeWidth="1.5" strokeLinecap="round"></path><path d="M6.2 15.3V11M11.2 15.3V8M16.2 15.3V5.5" stroke="#d4d8ff" strokeWidth="1.8" strokeLinecap="round"></path></svg>
                What's on this week
              </div>
              <button style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.11)', borderRadius: '999px', padding: '4px 10px', color: 'rgba(255, 255, 255, 0.64)', fontSize: '9px', fontWeight: '600', cursor: 'pointer' }}>See all</button>
            </div>

            <div style={{ margin: '0px 16px 14px', background: 'linear-gradient(rgba(22, 22, 29, 0.96), rgba(11, 11, 16, 0.98))', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.09)', boxShadow: 'rgba(0, 0, 0, 0.26) 0px 12px 28px, rgba(255, 255, 255, 0.04) 0px 1px 0px inset' }}>
              {upcomingShows.slice(0, 10).map((show, idx) => {
                const styles = getChannelStyles(show.channel)
                return (
                  <div
                    key={show.id || idx}
                    onClick={() => onOpenFilm({ ...show, title: show.name || show.title, poster_url: show.image || show.poster_url, _isExternal: true })}
                    className="hover-scale"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 11px',
                      borderBottom: idx === 9 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                      width: '100%'
                    }}
                  >
                    <img
                      src={show.image || show.poster_url}
                      alt={show.name || show.title}
                      style={{ width: '38px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, boxShadow: 'rgba(0, 0, 0, 0.3) 0px 8px 18px' }}
                    />
                    <div style={{ flex: '1 1 0%', minWidth: '0px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '1px' }}>{show.name || show.title}</div>
                      <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.55)', display: 'flex', alignItems: 'center', gap: '5px', minWidth: '0px' }}>
                        <span style={{
                          background: styles.background,
                          color: styles.color,
                          fontSize: '9px',
                          fontWeight: '800',
                          borderRadius: '4px',
                          padding: '2px 5px',
                          letterSpacing: '0.3px',
                          lineHeight: 1,
                          display: 'inline-block',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                          maxWidth: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{show.channel || 'TV'}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{show.airdate}</span>
                      </div>
                      {show.genre && <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.38)', marginTop: '1px' }}>{show.genre}</div>}
                    </div>
                    {show.rating && (
                      <div style={{ fontSize: '10px', color: 'var(--gold-bright)', fontWeight: '800', flexShrink: 0, alignSelf: 'center', paddingLeft: '4px' }}>
                        ★{show.rating}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {localTrailerUrl && (
        <div
          onClick={() => setLocalTrailerUrl('')}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0, 0, 0, 0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '480px', padding: '0px 12px' }}
          >
            <iframe
              src={(localTrailerUrl.includes('embed') ? localTrailerUrl : `https://www.youtube.com/embed/${localTrailerUrl}`) + (localTrailerUrl.includes('?') ? '&' : '?') + 'rel=0&modestbranding=1&autoplay=1&playsinline=1&iv_load_policy=3&showinfo=0&disablekb=1'}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
              allowFullScreen
              title="trailer"
              style={{ width: '100%', aspectRatio: '16 / 9', border: 'none', borderRadius: '12px' }}
            ></iframe>
            <button
              onClick={() => setLocalTrailerUrl('')}
              style={{ marginTop: '14px', display: 'block', width: '100%', padding: '10px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
