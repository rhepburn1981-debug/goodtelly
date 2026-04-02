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

        <div style={{ position: 'relative', padding: '12px', display: 'flex', gap: '16px', paddingRight: '40px' }}>
          {/* Close Button */}
          <div
            onClick={(e) => { e.stopPropagation(); onDismiss && onDismiss(displayRec.id); }}
            style={{
              position: 'absolute', top: '10px', right: '12px', zIndex: 10,
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '800', lineHeight: 1 }}>✕</span>
          </div>

          <div style={{
            width: '88px', height: '108px', borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
          }}>
            <img
              src={displayRec.poster_url}
              alt={displayRec.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, paddingTop: '6px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '4px', letterSpacing: '-0.3px' }}>
              {displayRec.title}
            </h3>
            <div style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '600', marginBottom: '16px' }}>
              {displayRec.year}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={(e) => { e.stopPropagation(); onWatchTrailer('https://www.youtube.com/watch?v=zSWdZVtXT7E'); }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)', borderRadius: '30px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '8px 12px', border: '1px solid rgba(255, 255, 255, 0.14)', cursor: 'pointer',
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
                  background: 'rgba(255, 255, 255, 0.05)', borderRadius: '30px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '8px 12px', border: '1px solid rgba(255, 255, 255, 0.14)', cursor: 'pointer',
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
    onWatchTrailer,
  } = props

  const [trendingNow, setTrendingNow] = useState([])
  const [recentWatchlist, setRecentWatchlist] = useState([])
  const [upcomingShows, setUpcomingShows] = useState([])

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Fri 15 May';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      return d.toLocaleDateString('en-GB', options);
    } catch {
      return dateStr;
    }
  }

  return (
    <div style={{
      // flex: '1 1 0%',
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
          width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #448aff 0%, #1565c0 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(21, 101, 192, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)'
        }}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
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
        onWatchTrailer={onWatchTrailer}
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
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" style={{ filter: 'drop-shadow(0 0 6px #3b82f6)' }}>
                  <path d="M12 2c-.1.7-.2 1.4-.4 2.1-.2.8-.5 1.5-.9 2.2-.4.6-.9 1.2-1.5 1.7-.6.5-1.2.9-1.9 1.3-.7.3-1.4.6-2.1.8-.7.2-1.4.3-2.1.4 0 0 .1.1.2.2.8.1 1.5.2 2.2.4.7.2 1.4.5 2.1.8.6.4 1.2.8 1.7 1.3.5.6.9 1.2 1.3 1.9.3.7.6 1.4.8 2.1.2.7.3 1.4.4 2.1 0 0 .1-.1.2-.2.1-.7.2-1.4.4-2.1.2-.7.5-1.4.9-2.1.4-.6.9-1.2 1.5-1.7.6-.5 1.2-.9 1.9-1.3.7-.3 1.4-.6 2.1-.8.7-.2 1.4-.3 2.1-.4 0 0-.1-.1-.2-.2-.8-.1-1.5-.2-2.2-.4-.7-.2-1.4-.5-2.1-.8-.6-.4-1.2-.8-1.7-1.3-.5-.6-.9-1.2-1.3-1.9-.3-.7-.6-1.4-.8-2.1-.2-.7-.3-1.4-.4-2.1z" fill="#3b82f6" />
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
                  {item.channel || 'TV Series'} • {formatDate(item.airdate)}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                {formatDate(item.airdate)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trailer logic handled globally by App component */}
    </div>
  )
}
