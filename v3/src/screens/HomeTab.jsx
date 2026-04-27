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
  if (!rec) return null;
  const displayRec = rec;

  return (
    <div style={{ margin: '2px 16px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0px 2px 6px' }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: 'linear-gradient(rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08))',
          border: '1px solid rgba(255, 255, 255, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <circle cx="12" cy="8.2" r="3.2" fill="rgba(255,255,255,0.78)"></circle>
            <path d="M5.5 18.5C6.7 15.7 9.1 14.2 12 14.2C14.9 14.2 17.3 15.7 18.5 18.5" stroke="rgba(255,255,255,0.78)" strokeWidth="1.8" strokeLinecap="round"></path>
          </svg>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--gold-bright)', fontWeight: '500' }}>
          {displayRec._fromFriend || 'Bhavinsen'} thinks you&rsquo;ll like&hellip;
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(rgba(24, 24, 31, 0.94), rgba(10, 10, 15, 0.94))',
        borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        boxShadow: 'rgba(0, 0, 0, 0.26) 0px 12px 28px, rgba(255, 255, 255, 0.04) 0px 1px 0px inset',
        cursor: 'pointer', position: 'relative'
      }} onClick={() => onOpenFilm(displayRec)}>
        <button
          style={{
            position: 'absolute', top: '8px', right: '8px', zIndex: 1,
            width: '24px', height: '24px', borderRadius: '50%',
            background: '#111', border: '1px solid #2e2e2e',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '900', color: '#fff', lineHeight: 1, padding: 0
          }}
          onClick={(e) => { e.stopPropagation(); onDismiss && onDismiss(displayRec.id); }}
        >
          &times;
        </button>

        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("${displayRec.backdrop_url}")`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.45
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.52))' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 10px 7px' }}>
          <img
            src={displayRec.poster_url}
            alt={displayRec.title}
            style={{ width: '46px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, boxShadow: 'rgba(0, 0, 0, 0.45) 0px 6px 16px' }}
          />
          <div style={{ flex: '1 1 0%', minWidth: 0, paddingTop: '2px', textShadow: 'rgba(0, 0, 0, 0.55) 0px 2px 8px' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text)', lineHeight: 1.1, marginBottom: '1px' }}>
              {displayRec.title}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.86)', marginBottom: '3px' }}>
              {displayRec.year}
            </div>
            <div style={{ position: 'relative', display: 'flex', gap: '8px', marginTop: '10px' }}>
              {displayRec.trailer_url && (
                <button
                  style={{
                    padding: '5px 11px', borderRadius: '16px',
                    border: 'none', background: 'var(--blue)', color: '#fff', fontSize: '11px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: 'rgba(255, 255, 255, 0.06) 0px 1px 0px inset'
                  }}
                  onClick={(e) => { e.stopPropagation(); onWatchTrailer(displayRec.trailer_url); }}
                >
                  <span style={{ fontSize: '9px' }}>▶</span><span> Watch Trailer</span>
                </button>
              )}
              <button
                style={{
                  padding: '5px 11px', borderRadius: '16px',
                  background: 'linear-gradient(rgba(80, 61, 33, 0.52), rgba(39, 28, 14, 0.52))',
                  border: '1px solid rgba(232, 201, 106, 0.3)', color: 'var(--text)',
                  fontSize: '10px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: 'rgba(255, 255, 255, 0.06) 0px 1px 0px inset'
                }}
                onClick={(e) => { e.stopPropagation(); onAddToList(displayRec); }}
              >
                <span style={{ fontSize: '14px', fontWeight: '400' }}>+</span> <span>Watchlist</span>
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
        .section-title { font-size: 15px; font-weight: 800; color: #fff; letter-spacing: -0.4px; display: flex; align-items: center; gap: 8px; }
      `}</style>

      {/* Watchlist Quick Links */}
      <div
        onClick={() => onTabChange('list')}
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
        onClick={() => onTabChange('friends')}
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

      {/* Recommendations Stack */}
      {recommendations && recommendations.length > 0 && recommendations.map(rec => (
        <RecommendationCard
          key={rec.id}
          rec={rec}
          onOpenFilm={onOpenFilm}
          onDismiss={onDismissRec}
          onAddToList={onAddToList}
          onWatchTrailer={onWatchTrailer}
        />
      ))}

      {/* TRENDING / What's NEW */}
      {trendingNow.length > 0 && (
        <div style={{ paddingBottom: '8px' }}>
          <div className="section-header">
            <div className="section-title" style={{ color: '#c5a36e' }}>
              <div style={{
                position: 'relative', width: '20px', height: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" style={{ filter: 'drop-shadow(0 0 6px #3b82f6)' }}>
                  <path d="M12 2c-.1.7-.2 1.4-.4 2.1-.2.8-.5 1.5-.9 2.2-.4.6-.9 1.2-1.5 1.7-.6.5-1.2.9-1.9 1.3-.7.3-1.4.6-2.1.8-.7.2-1.4.3-2.1.4 0 0 .1.1.2.2.8.1 1.5.2 2.2.4.7.2 1.4.5 2.1.8.6.4 1.2.8 1.7 1.3.5.6.9 1.2 1.3 1.9.3.7.6 1.4.8 2.1.2.7.3 1.4.4 2.1 0 0 .1-.1.2-.2.1-.7.2-1.4.4-2.1.2-.7.5-1.4.9-2.1.4-.6.9-1.2 1.5-1.7.6-.5 1.2-.9 1.9-1.3.7-.3 1.4-.6 2.1-.8.7-.2 1.4-.3 2.1-.4 0 0-.1-.1-.2-.2-.8-.1-1.5-.2-2.2-.4-.7-.2-1.4-.5-2.1-.8-.6-.4-1.2-.8-1.7-1.3-.5-.6-.9-1.2-1.3-1.9-.3-.7-.6-1.4-.8-2.1-.2-.7-.3-1.4-.4-2.1z" fill="#3b82f6" />
                </svg>
              </div>
              What’s NEW
            </div>
          </div>
          <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '0px 16px 12px', scrollbarWidth: 'none' }}>
            {trendingNow.map(film => (
              <button
                key={film.id}
                onClick={() => onOpenFilm(film)}
                style={{ flexShrink: 0, width: '82px', background: 'none', border: 'none', cursor: 'pointer', padding: '0px', textAlign: 'left' }}
              >
                <img
                  src={film.poster_url}
                  alt={film.title || film.name}
                  style={{ width: '82px', height: '118px', objectFit: 'cover', borderRadius: '7px', display: 'block', boxShadow: 'rgba(0, 0, 0, 0.28) 0px 10px 20px' }}
                />
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {film.title || film.name}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.58)', marginTop: '1px', fontWeight: '500' }}>
                  {film.year || (film.release_date ? film.release_date.split('-')[0] : film.first_air_date ? film.first_air_date.split('-')[0] : '')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* NEW SECTION: What Reel users are watching right now */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" style={{ flexShrink: 0 }}>
              <path d="M3 17L9 11L13 15L21 7" stroke="url(#arrowG)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M15 7h6v6" stroke="url(#arrowG)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"></path>
              <defs>
                <linearGradient id="arrowG" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#c084fc"></stop>
                  <stop offset="1" stopColor="#818cf8"></stop>
                </linearGradient>
              </defs>
            </svg>
            Trending with WatchMates Users
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '0px 16px 12px', scrollbarWidth: 'none' }} className="no-scrollbar">
          {[
            { img: "https://static.tvmaze.com/uploads/images/original_untouched/615/1537572.jpg", title: "The Lady", year: "2026" },
            { img: "https://image.tmdb.org/t/p/w500/vUwyhNWBKkSwK8ELvEeBRwV724h.jpg", title: "I Swear", year: "2025" },
            { img: "https://image.tmdb.org/t/p/w500/s7IbZFANLHKNglQ9IfjDdrHCVNZ.jpg", title: "Saipan", year: "2025" },
            { img: "https://image.tmdb.org/t/p/w500/lbBWwxBht4JFP5PsuJ5onpMqugW.jpg", title: "One Battle After Another", year: "2025" },
            { img: "https://static.tvmaze.com/uploads/images/original_untouched/579/1449350.jpg", title: "Operation Dark Phone: Murder by Text", year: "2025" },
            { img: "https://image.tmdb.org/t/p/w500/lbBWwxBht4JFP5PsuJ5onpMqugW.jpg", title: "One Battle After Another", year: "2025" },
            { img: "https://image.tmdb.org/t/p/w342/zvkcHCJUPqv7R9ukaiDNkm75jy.jpg", title: "Scarpetta", year: "2026" },
            { img: "https://image.tmdb.org/t/p/w500/pyok1kZJCfyuFapYXzHcy7BLlQa.jpg", title: "Mercy", year: "2026" },
            { img: "https://static.tvmaze.com/uploads/images/original_untouched/613/1533076.jpg", title: "How to Get to Heaven From Belfast", year: "2026" },
            { img: "https://image.tmdb.org/t/p/w500/qvktm0BHcnmDpul4Hz01GIazWPr.jpg", title: "The Terminator", year: "1984" }
          ].map((film, idx) => (
            <button
              key={idx}
              onClick={() => onOpenFilm({ ...film, poster_url: film.img })}
              style={{ flexShrink: 0, width: '82px', background: 'none', border: 'none', cursor: 'pointer', padding: '0px', textAlign: 'left' }}
            >
              <img
                src={film.img}
                alt={film.title}
                style={{ width: '82px', height: '118px', objectFit: 'cover', borderRadius: '7px', display: 'block', boxShadow: 'rgba(0, 0, 0, 0.34) 0px 10px 22px' }}
              />
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {film.title}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.58)', marginTop: '1px', fontWeight: '500' }}>
                {film.year}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* UPCOMING / What's on this week */}
      <div style={{ paddingBottom: '24px' }}>
        <div className="section-header">
          <div className="section-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#e2b644" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
            What’s on this week
          </div>
        </div>

        <div style={{ margin: '0px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
          {(upcomingShows.length > 0 ? upcomingShows.slice(0, 6) : []).map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => onOpenFilm({ ...item, title: item.name, poster_url: item.image, _isExternal: true })}
              className="hover-scale"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                borderBottom: idx === (upcomingShows.length - 1 || 5) ? 'none' : '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                <img src={item.image || '/branding/poster1.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <div style={{
                    fontSize: '9px', fontWeight: '800', padding: '1px 4px', borderRadius: '4px',
                    ...getChannelStyles(item.network?.name || 'TV')
                  }}>
                    {item.network?.name || 'TV'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    • {formatDate(item.airdate)}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
                {item.airtime || '21:00'}
              </div>
            </div>
          ))}
          {upcomingShows.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
              No upcoming shows found for this week.
            </div>
          )}
        </div>
      </div>

      {/* Trailer logic handled globally by App component */}
    </div>
  )
}
