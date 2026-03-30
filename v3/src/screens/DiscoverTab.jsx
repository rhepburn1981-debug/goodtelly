import { useState, useMemo } from 'react'
import { FaPlus, FaCheck } from 'react-icons/fa'

export default function DiscoverTab({ allFilms, addedIds, onOpenFilm, onAddToList, providers }) {
  const [genreFilter, setGenreFilter] = useState('All')
  const [providerFilter, setProviderFilter] = useState('All')
  const [timeRange, setTimeRange] = useState('Week')

  const timeRanges = ['Week', 'Month', 'Year', 'All Time']

  const genres = [
    { name: 'All', icon: '+' },
    { name: 'Drama', icon: '♡' },
    { name: 'Crime', icon: '◆' },
    { name: 'History', icon: '◆' },
    { name: 'Thriller', icon: '↑' },
    { name: 'Action', icon: '⚡' },
    { name: 'Comedy', icon: '☺' },
    { name: 'Science Fiction', icon: '◆' }
  ]

  const featuredProviders = [
    { name: 'Netflix', logo: 'https://image.tmdb.org/t/p/w45/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' },
    { name: 'Paramount+', logo: 'https://image.tmdb.org/t/p/w45/h5DcR0J2EESLitnhR8xLG1QymTE.jpg' },
    { name: 'Apple TV+', logo: 'https://image.tmdb.org/t/p/w45/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg' },
    { name: 'Amazon Prime Video', logo: 'https://image.tmdb.org/t/p/w45/pvske1MyAoymrs5bguRfVqYiM9a.jpg', displayName: 'Prime' },
    { name: 'Disney Plus', logo: 'https://image.tmdb.org/t/p/w45/97yvRBw1GzX7fXprcF80er19ot.jpg', displayName: 'Disney+' }
  ]

  const filtered = useMemo(() => {
    return (allFilms || []).filter((f) => {
      const gMatch = genreFilter === 'All' || (f.genre || '').includes(genreFilter === 'Science Fiction' ? 'Sci-Fi' : genreFilter)
      const pMatch = providerFilter === 'All' || (f.streamers || []).includes(providerFilter)
      return gMatch && pMatch
    })
  }, [allFilms, genreFilter, providerFilter])

  const heroFilm = filtered[0]
  const listFilms = filtered.slice(1, 21)

  return (
    <div style={{
      flex: '1 1 0%',
      overflow: 'hidden auto',
      position: 'relative',
      paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
      color: 'white',
      fontFamily: 'var(--ff-body)',
    }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hero-btn { width: 56px; height: 56px; border-radius: 50%; background: rgba(255, 255, 255, 0.18); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255, 255, 255, 0.3); transition: all 0.2s; }
        .hero-btn:active { transform: scale(0.92); background: rgba(255, 255, 255, 0.3); }
      `}</style>

      <div className="no-scrollbar" style={{ height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 2px', fontSize: '13px', fontWeight: '800', color: 'rgb(255, 255, 255)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>🔥 What's trending with Reel users</div>

        {/* Genre Pills */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px 10px' }}>
          {genres.map(g => (
            <button key={g.name} onClick={() => setGenreFilter(g.name)} style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: '20px',
              border: genreFilter === g.name ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: genreFilter === g.name ? 'rgba(201, 168, 76, 0.14)' : 'transparent',
              color: genreFilter === g.name ? 'var(--gold-bright)' : 'var(--text2)',
              fontSize: '12px', fontWeight: genreFilter === g.name ? '700' : '500',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
            }}>
              <span style={{ fontSize: '13px', opacity: 0.7 }}>{g.icon}</span>{g.name}
            </button>
          ))}
        </div>

        {/* Provider Pills */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0px 16px 10px', alignItems: 'center' }}>
          <button onClick={() => setProviderFilter('All')} style={{
            flexShrink: 0, padding: '5px 12px', borderRadius: '20px',
            border: providerFilter === 'All' ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.1)',
            background: providerFilter === 'All' ? 'rgba(201, 168, 76, 0.12)' : 'transparent',
            color: providerFilter === 'All' ? 'var(--gold-bright)' : 'var(--text2)',
            fontSize: '11px', fontWeight: '700', cursor: 'pointer'
          }}>All Services</button>
          {featuredProviders.map(p => (
            <button key={p.name} onClick={() => setProviderFilter(p.name)} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px',
              borderRadius: '20px', border: providerFilter === p.name ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: 'transparent', cursor: 'pointer'
            }}>
              <img src={p.logo} style={{ width: '14px', height: '14px', borderRadius: '3px', objectFit: 'cover' }} alt={p.name} />
              <span style={{ fontSize: '11px', fontWeight: '400', color: providerFilter === p.name ? 'var(--gold-bright)' : 'var(--text2)' }}>
                {p.displayName || p.name}
              </span>
            </button>
          ))}
        </div>

        {/* Time Tabs */}
        <div style={{ display: 'flex', gap: '0px', padding: '0px 16px 14px' }}>
          {timeRanges.map(tr => (
            <button key={tr} onClick={() => setTimeRange(tr)} style={{
              flex: '1 1 0%', padding: '7px 4px', border: 'none', borderBottom: timeRange === tr ? '2px solid var(--gold-bright)' : '2px solid transparent',
              background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: timeRange === tr ? '700' : '500',
              color: timeRange === tr ? 'var(--text)' : 'var(--muted)', transition: 'all 0.15s'
            }}>{tr === 'All Time' ? tr : `This ${tr}`}</button>
          ))}
        </div>

        {/* Hero Card */}
        {heroFilm ? (
          <div onClick={() => onOpenFilm(heroFilm)} style={{ margin: '0px 16px 20px', borderRadius: '16px', overflow: 'hidden', position: 'relative', height: '220px', cursor: 'pointer' }}>
            <img src={heroFilm.poster_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.75) 100%)' }}></div>
            <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'var(--gold)', color: 'rgb(26,26,26)', fontSize: '11px', fontWeight: '900', borderRadius: '20px', padding: '4px 10px' }}>#1 This {timeRange}</div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="hero-btn">
                <div style={{ width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid rgba(255,255,255,0.9)', marginLeft: '4px' }}></div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '0px', left: '0px', right: '0px', padding: '0px 14px 14px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: 'rgb(255, 255, 255)', marginBottom: '4px', lineHeight: '1.2' }}>{heroFilm.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <RatingStars rating={heroFilm.rating} />
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>{(heroFilm.rating / 2).toFixed(1)}</span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.15)', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>{heroFilm.genre} · {heroFilm.year}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <button onClick={(e) => { e.stopPropagation(); onAddToList(heroFilm) }} style={{ width: '32px', height: '32px', borderRadius: '50%', background: addedIds?.includes(heroFilm.id) ? 'var(--green)' : 'var(--gold)', border: 'none', cursor: 'pointer', color: 'rgb(26, 26, 26)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {addedIds?.includes(heroFilm.id) ? <FaCheck size={16} /> : <FaPlus size={16} />}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Ranked Trending List */}
        <div style={{ padding: '0px 16px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '9px', opacity: 0.5 }}>🔥</span>
          <span style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>This {timeRange} Trending</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {listFilms.map((film, idx) => (
            <div key={film.id} onClick={() => onOpenFilm(film)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer' }}>
              <div style={{ width: '22px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: 'var(--muted)', flexShrink: 0 }}>{idx + 2}</div>
              <img src={film.poster_url} alt={film.title} style={{ width: '54px', height: '76px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{film.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{film.genre} · {film.year}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <RatingStars rating={film.rating} size={10} />
                  <span style={{ fontSize: '10px', color: 'var(--gold-bright)', fontWeight: '700' }}>{(film.rating / 2).toFixed(1)}/5</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onAddToList(film) }}
                style={{
                  flexShrink: 0, padding: '7px 12px', borderRadius: '20px',
                  border: addedIds?.includes(film.id) ? '1px solid rgba(46, 204, 138, 0.3)' : '1px solid rgba(201, 168, 76, 0.4)',
                  background: addedIds?.includes(film.id) ? 'rgba(46, 204, 138, 0.08)' : 'rgba(201, 168, 76, 0.08)',
                  color: addedIds?.includes(film.id) ? 'var(--green)' : 'var(--gold-bright)',
                  fontSize: '12px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {addedIds?.includes(film.id) ? (
                  <>
                    <FaCheck size={11} />
                  </>
                ) : (
                  <>
                    <FaPlus size={11} />
                    <span>Watchlist</span>
                  </>
                )}
              </button>
            </div>
          ))}
          {!heroFilm && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 14 }}>
              No films match your search.
            </div>
          )}
          <div style={{ height: '20px' }}></div>
        </div>
      </div>
    </div>
  )
}

function RatingStars({ rating, size = 12 }) {
  const stars = Math.round(rating / 2)
  return (
    <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} viewBox="0 0 24 24" width={size} height={size}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={s <= stars ? "#C9A84C" : "rgba(255,255,255,0.1)"}
            stroke={s <= stars ? "#C9A84C" : "rgba(255,255,255,0.15)"}
            strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  )
}
