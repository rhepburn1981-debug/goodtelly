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
  { id: 'f1', title: 'Saipan', year: 2026, poster_url: '/branding/poster3.png' },
  { id: 'f2', title: 'The Teacher', year: 2026, poster_url: '/branding/poster2.png' },
  { id: 'f3', title: 'Beyond Paradise', year: 2026, poster_url: '/branding/poster1.png' },
  { id: 'f4', title: 'The Capture', year: 2026, poster_url: '/branding/trend1.png' },
  { id: 'f5', title: 'GOAT', year: 2026, poster_url: '/branding/poster4.png' },
]

const RecommendationCard = ({ rec, onOpenFilm, onDismiss, onAddToList, onWatchTrailer }) => {
  const displayRec = rec || {
    id: 'mobland-rec',
    title: 'MobLand - 2025',
    year: 2025,
    poster_url: '/branding/mobland_poster.png',
    backdrop_url: '/branding/mobland_bg.png',
    _fromFriend: 'Kate'
  };

  return (
    <div style={{ margin: '15px 16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0px 4px 10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="rgba(255,255,255,0.7)">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <span style={{ fontSize: '14.5px', color: '#c5a36e', fontWeight: '600', letterSpacing: '0.2px' }}>
          {displayRec._fromFriend || 'Kate'} thinks you'll like...
        </span>
      </div>

      <div style={{
        position: 'relative',
        background: '#0a0a0c',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        cursor: 'pointer'
      }} onClick={() => onOpenFilm(displayRec)}>

        {/* Backdrop Background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("${displayRec.backdrop_url}")`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.8
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(10, 10, 12, 1) 0%, rgba(10, 10, 12, 0.85) 30%, rgba(10, 10, 12, 0.4) 100%)'
        }} />

        <div style={{ position: 'relative', padding: '12px', display: 'flex', gap: '16px' }}>
          <div style={{
            width: '88px', height: '128px', borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)', flexShrink: 0,
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
          }}>
            <img
              src={displayRec.poster_url}
              alt={displayRec.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, paddingTop: '6px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '4px', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayRec.title}
            </h3>
            <div style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600', marginBottom: '16px' }}>
              {displayRec.year}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onWatchTrailer('https://www.youtube.com/watch?v=zSWdZVtXT7E'); }}
                style={{
                  flex: 1, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '30px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.14)', cursor: 'pointer',
                  color: '#fff', fontSize: '12px', fontWeight: '700'
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Trailer
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAddToList(displayRec); }}
                style={{
                  flex: 1, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '30px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.14)', cursor: 'pointer',
                  color: '#c5a36e', fontSize: '12px', fontWeight: '700'
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '400' }}>+</span>
                Watchlist
              </button>
            </div>
          </div>
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
      overflowY: 'auto',
      position: 'relative',
      minHeight: '100%',
      color: 'white',
      fontFamily: 'var(--ff-body)',
      background: '#040404',
      paddingTop: '12px'
    }} className="no-scrollbar">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hover-scale { transition: transform 0.2s ease; cursor: pointer; }
        .hover-scale:active { transform: scale(0.96); }
        .section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 10px; }
        .section-title { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.4px; display: flex; align-items: center; gap: 8px; }
      `}</style>

      {/* Watchlist Quick Links */}
      <div
        onClick={() => handleTabChange('list')}
        className="hover-scale"
        style={{
          margin: '0px 16px 8px',
          background: 'linear-gradient(rgba(20, 20, 25, 0.95), rgba(10, 10, 15, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
          background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#3b82f6" style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
        <div style={{ flex: '1 1 0%' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>My Watchlist</div>
          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', marginTop: '2px' }}>Your saved films and shows to watch</div>
        </div>
        <div style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.3)', fontWeight: 300 }}>›</div>
      </div>

      <div
        onClick={() => handleTabChange('friends')}
        className="hover-scale"
        style={{
          margin: '8px 16px 16px',
          background: 'linear-gradient(rgba(20, 20, 25, 0.95), rgba(10, 10, 15, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <div style={{
          width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
          background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="rgba(255,255,255,0.6)">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div style={{ flex: '1 1 0%' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', letterSpacing: '-0.2px' }}>Friends Watchlist</div>
          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)', marginTop: '2px' }}>See what your friends are watching</div>
        </div>
        <div style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.3)', fontWeight: 300 }}>›</div>
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
        <div style={{ paddingBottom: '8px' }}>
          <div className="section-header">
            <div className="section-title" style={{ color: '#c5a36e' }}>
              <div style={{
                position: 'relative', width: '20px', height: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: '8px'
              }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" style={{ filter: 'drop-shadow(0 0 5px #3b82f6)' }}>
                  <path d="M17.66 11.2c-.23-.3-.51-.56-.84-.77-.62-.39-1.32-.53-1.92-.47-.56.05-1.07.26-1.5.59-.1.08-.2.16-.29.25-.32.32-.32.32-.32.32s0 0-.01 0c-.01.01-.02.03-.03.04-.01.02-.03.04-.05.07-.03.05-.08.13-.15.24-.13.21-.31.53-.49.94-.37.82-.72 1.96-.72 3.32 0 .36.03.7.08 1.02.01.07.03.14.04.2.03.13.06.26.1.38.01.04.03.07.04.1.04.12.08.23.12.33l.03.08c.04.1.09.18.13.26l.04.07c.05.08.1.15.15.21l.05.06c.05.06.1.11.16.16l.05.04c.07.05.13.1.2.14l.05.03c.14.07.28.11.43.14l.07.01c.1.02.21.03.32.03h.11c.14-.01.27-.03.41-.06l.08-.02c.11-.03.22-.07.32-.12l.06-.03c.12-.06.23-.13.33-.21l.04-.04c.09-.08.18-.17.26-.26l.03-.04c.07-.09.13-.18.19-.27l.03-.05c.05-.08.09-.17.13-.25l.03-.06c.03-.08.07-.16.1-.25l.02-.05c.03-.09.06-.18.08-.28l.02-.07c.02-.1.04-.2.05-.31l.01-.06c.01-.11.02-.23.02-.35V15c0-1.12-.2-2.12-.59-2.94-.1-.19-.22-.38-.35-.55l-.12-.11c.18.15.34.33.48.53.25.37.44.78.56 1.2.14.48.2 1 .2 1.54 0 .28-.02.55-.05.81-.03.26-.08.51-.15.75-.07.24-.16.47-.27.69-.11.22-.24.42-.4.61-.16.19-.34.36-.55.51-.21.15-.43.27-.68.37-.25.10-.51.17-.79.2-.28.03-.57.03-.86.01-.29-.02-.58-.08-.86-.17s-.55-.21-.8-.36l-.37-.24-.09-.07c-.12-.09-.23-.2-.33-.31l-.1-.12c-.09-.11-.17-.23-.25-.36l-.08-.13c-.07-.14-.13-.29-.18-.45l-.05-.16c-.05-.17-.08-.34-.1-.53l-.02-.19c-.01-.2-.02-.4-.02-.61 0-1.52.28-2.8.8-3.79.23-.42.5-.78.8-1.07.15-.15.31-.27.48-.38.17-.11.35-.19.53-.26.18-.07.38-.11.58-.13.2-.02.42-.01.62.03.21.04.42.11.61.21.2.1.38.22.54.37.16.15.3.32.41.51.11.19.19.4.24.61.05.21.07.44.07.67 0 .21-.02.42-.05.62l-.12-.13z" fill="#3b82f6" />
                </svg>
              </div>
              What’s NEW
            </div>
          </div>
          <div className="no-scrollbar" style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '0px 16px 16px' }}>
            {trendingNow.map(film => (
              <div
                key={film.id}
                onClick={() => onOpenFilm(film)}
                className="hover-scale"
                style={{
                  flexShrink: 0, width: '110px', height: '160px',
                  position: 'relative', borderRadius: '16px', overflow: 'hidden',
                  background: 'rgba(255,255,255,0.05)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <img
                  src={film.poster_url}
                  alt={film.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.95) 100%)',
                  padding: '28px 10px 10px', display: 'flex', flexDirection: 'column', gap: '2px'
                }}>
                  {/* <div style={{
                    fontSize: '11.5px', fontWeight: '800', color: '#fff',
                    letterSpacing: '0.2px', textTransform: film.title.length < 10 ? 'uppercase' : 'none',
                    lineHeight: '1.1', textShadow: '0 1px 3px rgba(0,0,0,1)'
                  }}>
                    {film.title}
                  </div> */}
                  <div style={{ fontSize: '14px', textAlign: 'center', fontWeight: '600', color: 'rgba(255, 255, 255, 1)' }}>
                    {(Math.random() * 20 + 20).toFixed(1)}K
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT / Trending with Reel Users */}
      <div style={{ paddingBottom: '24px' }}>
        <div className="section-header">
          <div className="section-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            Trending with Reel Users
          </div>
        </div>

        <div style={{ margin: '0px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
          {(upcomingShows.length > 0 ? upcomingShows.slice(0, 5) : FALLBACK_RECENT).map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => onOpenFilm(item)}
              className="hover-scale"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                borderBottom: idx === 4 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                <img src={item.poster_url || item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title || item.name}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                  {item.channel || 'TV Series'} • {item.airdate || 'Fri 15 May'}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                {item.airdate || 'Fri 15 May'}
              </div>
            </div>
          ))}
        </div>
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
