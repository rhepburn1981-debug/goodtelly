import { useState } from 'react'

export default function ListTab({ myList, watchedIds, onOpenFilm, onRemoveFromList, onMarkWatched, onUnmarkWatched, onToast }) {
  const [filter, setFilter] = useState('unwatched') // 'unwatched' | 'watched' | 'all'
  const [sort, setSort] = useState('added')     // 'added' | 'rating' | 'title'
  const [genreFilter, setGenreFilter] = useState('All')

  const unwatchedCount = myList.filter((f) => !watchedIds?.includes(f.film_id || f.id)).length
  const watchedCount = myList.filter((f) => watchedIds?.includes(f.film_id || f.id)).length
  const allCount = myList.length

  const getFilteredFilms = () => {
    let films = []
    if (filter === 'unwatched') films = myList.filter((f) => !watchedIds?.includes(f.film_id || f.id))
    else if (filter === 'watched') films = myList.filter((f) => watchedIds?.includes(f.film_id || f.id))
    else films = myList

    return films
      .filter((f) => genreFilter === 'All' || f.genre === genreFilter)
      .sort((a, b) => {
        if (sort === 'rating') return (b.my_rating || 0) - (a.my_rating || 0)
        if (sort === 'title') return (a.title || '').localeCompare(b.title || '')
        return 0 // default: added order
      })
  }

  const filtered = getFilteredFilms()

  // Ensure we show common genres even if empty for UI parity, while including all dynamic genres
  const baseGenres = ['All', 'Horror', 'Thriller', 'Comedy']
  const dynamicGenres = new Set(myList.flatMap((f) => f.genre ? [f.genre] : []))
  const genres = [...new Set([...baseGenres, ...dynamicGenres])]

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
        <div style={{ margin: '0 16px 14px', background: 'rgba(201, 168, 76, 0.06)', border: '1px solid rgba(201, 168, 76, 0.2)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-bright)', marginBottom: '2px' }}>✦ List visible to friends</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Friends can see your picks</div>
          </div>
          <button style={{ width: '44px', height: '26px', borderRadius: '13px', background: 'var(--gold)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', right: '3px', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 4px' }}></div>
          </button>
        </div>

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
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', padding: '0 16px 14px', overflowX: 'auto' }}>
          {genres.map(g => (
            <button key={g} onClick={() => setGenreFilter(g)} className={`pill-btn ${genreFilter === g ? 'pill-active' : 'pill-inactive'}`} style={{ fontWeight: genreFilter === g ? 700 : 400 }}>{g}</button>
          ))}
        </div>

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
                  <div style={{ flexShrink: 0, width: '54px', height: '76px', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface3)', position: 'relative' }}>
                    <img src={film.poster_url} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0, 0, 0, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '9px solid rgba(255, 255, 255, 0.8)', marginLeft: '2px' }}></div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{film.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{[film.genre, film.year].filter(Boolean).join(' · ')}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ opacity: 0.5 }}>·</span><span>Visible</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    {!isWatched && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onMarkWatched(film) }}
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
