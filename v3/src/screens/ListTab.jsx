import { useState, useMemo } from 'react'

function RatingStars({ rating, size = 11 }) {
  if (!rating) return null
  const stars = Math.round(rating)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} viewBox="0 0 24 24" width={size} height={size}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={s <= stars ? '#C9A84C' : 'rgba(255,255,255,0.1)'}
            stroke={s <= stars ? '#C9A84C' : 'rgba(255,255,255,0.15)'}
            strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ))}
      <span style={{ fontSize: '10px', color: 'var(--gold-bright)', fontWeight: 700, marginLeft: '3px' }}>{rating.toFixed(1)}</span>
    </span>
  )
}

const ALL_SERVICES = [
  { name: 'Netflix',     logo: '/branding/netflix.png' },
  { name: 'Prime',       logo: '/branding/prime.png' },
  { name: 'Disney+',     logo: '/branding/disney.png' },
  { name: 'NOW',         logo: '/branding/now_logo.png' },
  { name: 'Apple TV+',   logo: '/branding/I-tv.png' },
  { name: 'Paramount+',  logo: '/branding/paramountplus.png' },
  { name: 'Discovery+',  logo: '/branding/discovery.png' },
  { name: 'ITVX',        logo: '/branding/itvx.svg' },
  { name: 'BBC iPlayer', logo: '/branding/bbc.png' },
  { name: 'Channel 4',   logo: '/branding/channel4.png' },
]

export default function ListTab({ myList, watchedIds, onOpenFilm, onRemoveFromList, onMarkWatched, onUnmarkWatched, onToast, onSeenIt }) {
  const [filter, setFilter] = useState('unwatched') // 'unwatched' | 'watched' | 'all'
  const [sort, setSort] = useState('added')     // 'added' | 'rating' | 'title'
  const [genreFilter, setGenreFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')

  const unwatchedCount = myList.filter((f) => !watchedIds?.includes(f.film_id || f.id)).length
  const watchedCount = myList.filter((f) => watchedIds?.includes(f.film_id || f.id)).length
  const allCount = myList.length

  const getFilteredFilms = () => {
    let films = []
    if (filter === 'unwatched') films = myList.filter((f) => !watchedIds?.includes(f.film_id || f.id))
    else if (filter === 'watched') films = myList.filter((f) => watchedIds?.includes(f.film_id || f.id))
    else films = myList

    return films
      .filter((f) => genreFilter === 'All' || (f.genre || '').split(',')[0].trim().toLowerCase() === genreFilter.toLowerCase())
      .filter((f) => serviceFilter === 'All' || (f.streamers || []).includes(serviceFilter))
      .sort((a, b) => {
        if (sort === 'rating') return (b.my_rating || 0) - (a.my_rating || 0)
        if (sort === 'title') return (a.title || '').localeCompare(b.title || '')
        return 0 // default: added order
      })
  }

  const filtered = getFilteredFilms()

  // Ensure we show common genres even if empty for UI parity, while including all dynamic genres
  const baseGenres = ['All', 'Horror', 'Thriller', 'Comedy']
  const dynamicGenres = new Set(myList.flatMap((f) => f.genre ? [f.genre.split(',')[0].trim()] : []))
  const genres = [...new Set([...baseGenres, ...dynamicGenres])]

  // Only show services that appear in the user's list
  const activeServiceNames = useMemo(() => {
    const names = new Set()
    myList.forEach(f => (f.streamers || []).forEach(s => names.add(s)))
    return names
  }, [myList])
  const availableServices = ALL_SERVICES.filter(s => activeServiceNames.has(s.name))

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
        .pill-btn { flex-shrink: 0; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .pill-active { border: 1px solid var(--gold); background: rgba(201, 168, 76, 0.12); color: var(--gold-bright); }
        .pill-inactive { border: 1px solid rgba(255, 255, 255, 0.1); background: transparent; color: var(--text2); }
        .tab-btn { flex: 1; padding: 8px 4px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s; }
        .tab-active { background: var(--surface3); color: var(--text); }
        .tab-inactive { background: transparent; color: var(--muted); }
      `}</style>

      <div className="no-scrollbar" style={{ height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '16px 16px 12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>My Watchlist</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: 'auto' }}>{allCount} {allCount === 1 ? 'film' : 'films'}</div>
        </div>

        {/* Visibility Toggle Card */}
        {/* <div style={{ margin: '0 16px 14px', background: 'rgba(201, 168, 76, 0.06)', border: '1px solid rgba(201, 168, 76, 0.2)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-bright)', marginBottom: '2px' }}>✦ List visible to friends</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Friends can see your picks</div>
          </div>
          <button style={{ width: '44px', height: '26px', borderRadius: '13px', background: 'var(--gold)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', right: '3px', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 4px' }}></div>
          </button>
        </div> */}

        {/* Tab Bar */}
        <div style={{ display: 'flex', margin: '0 16px 12px', background: 'var(--surface2)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
          <button onClick={() => setFilter('unwatched')} className={`tab-btn ${filter === 'unwatched' ? 'tab-active' : 'tab-inactive'}`}>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>{unwatchedCount}</div>
            <span style={{ fontSize: '11px', fontWeight: 700 }}>To Watch</span>
          </button>
          <button onClick={() => setFilter('watched')} className={`tab-btn ${filter === 'watched' ? 'tab-active' : 'tab-inactive'}`}>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>{watchedCount}</div>
            <span style={{ fontSize: '11px', fontWeight: 700 }}>Watched</span>
          </button>
          <button onClick={() => setFilter('all')} className={`tab-btn ${filter === 'all' ? 'tab-active' : 'tab-inactive'}`}>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>{allCount}</div>
            <span style={{ fontSize: '11px', fontWeight: 700 }}>All</span>
          </button>
        </div>

        {/* Sort Pills Row 1 */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', padding: '0 16px 10px', overflowX: 'auto' }}>
          <button onClick={() => setSort('added')} className={`pill-btn ${sort === 'added' ? 'pill-active' : 'pill-inactive'}`}>Recently Added</button>
          <button onClick={() => setSort('rating')} className={`pill-btn ${sort === 'rating' ? 'pill-active' : 'pill-inactive'}`}>🎬 Friends' Rating</button>
          <button onClick={() => setSort('title')} className={`pill-btn ${sort === 'title' ? 'pill-active' : 'pill-inactive'}`}>A–Z</button>
        </div>

        {/* Genre Pills Row 2 */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', padding: '0 16px 10px', overflowX: 'auto' }}>
          {genres.map(g => (
            <button key={g} onClick={() => setGenreFilter(g)} className={`pill-btn ${genreFilter === g ? 'pill-active' : 'pill-inactive'}`} style={{ fontWeight: genreFilter === g ? 700 : 400 }}>{g}</button>
          ))}
        </div>

        {/* Service Pills Row 3 */}
        {availableServices.length > 0 && (
          <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', padding: '0 16px 14px', overflowX: 'auto', alignItems: 'center' }}>
            <button onClick={() => setServiceFilter('All')} className={`pill-btn ${serviceFilter === 'All' ? 'pill-active' : 'pill-inactive'}`}>All Services</button>
            {availableServices.map(s => (
              <button key={s.name} onClick={() => setServiceFilter(s.name)} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
                borderRadius: '20px',
                border: serviceFilter === s.name ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                background: serviceFilter === s.name ? 'rgba(201,168,76,0.12)' : 'transparent',
                cursor: 'pointer'
              }}>
                <img src={s.logo} style={{ width: '16px', height: '12px', objectFit: 'contain' }} alt={s.name} />
                <span style={{ fontSize: '11px', fontWeight: serviceFilter === s.name ? 700 : 400, color: serviceFilter === s.name ? 'var(--gold-bright)' : 'var(--text2)', whiteSpace: 'nowrap' }}>
                  {s.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Film List */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 14 }}>
              {filter === 'unwatched' ? 'No films to watch yet — add some!' : 'Nothing marked as watched yet.'}
            </div>
          ) : (
            filtered.map((item) => {
              const film = item.film || item
              const filmId = film.id || item.film_id
              const isWatched = watchedIds?.includes(filmId)

              return (
                <div
                  key={filmId}
                  onClick={() => onOpenFilm(film)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer' }}
                >
                  <div style={{ flexShrink: 0, width: '54px', height: '76px', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface3)' }}>
                    <img src={film.poster_url} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{film.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{[film.genre ? film.genre.split(',')[0].trim() : null, film.year].filter(Boolean).join(' · ')}</div>
                    <div style={{ marginTop: '4px' }}>
                      <RatingStars rating={film.rating} />
                    </div>
                    {film.streamers && film.streamers[0] && (() => {
                      const svc = ALL_SERVICES.find(s => s.name === film.streamers[0])
                      return svc ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '5px', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>
                          <img src={svc.logo} style={{ width: '14px', height: '10px', objectFit: 'contain' }} alt={svc.name} />
                          <span style={{ fontSize: '10px', color: 'var(--text2)', fontWeight: 400, whiteSpace: 'nowrap' }}>{svc.name}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: '5px', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text2)' }}>{film.streamers[0]}</span>
                        </div>
                      )
                    })()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    {!isWatched && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSeenIt ? onSeenIt(film) : onMarkWatched(film) }}
                        style={{ padding: '7px 10px', borderRadius: '20px', border: 'none', background: 'rgba(46, 204, 138, 0.15)', color: 'var(--green)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        Tap if you've seen it
                      </button>
                    )}
                    {isWatched && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onUnmarkWatched(film) }}
                        style={{ padding: '7px 10px', borderRadius: '20px', border: 'none', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--muted)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        ✓ Watched
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveFromList(film) }}
                      style={{ padding: '6px 10px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'transparent', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })
          )}
          <div style={{ height: '20px' }}></div>
        </div>
      </div>
    </div>
  )
}
