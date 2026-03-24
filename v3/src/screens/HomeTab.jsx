import { useState, useEffect } from 'react'
import FilmCard from '../components/FilmCard'
import PosterCard from '../components/PosterCard'
import { getTrending, getWatchlistRecent, getUpcomingTv } from '../api/films'

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 15, fontWeight: 800, color: 'var(--text)',
      letterSpacing: -0.2, display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {children}
    </div>
  )
}

function HScroll({ children }) {
  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ width: 16, flexShrink: 0 }} />
      {children}
      <div style={{ width: 16, flexShrink: 0 }} />
    </div>
  )
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2c0 0-1.5 2.5-1.5 5.5 0 .8.2 1.6.6 2.2C10.4 9 9.5 7.8 9.5 6.5c0 0-3.5 2.8-3.5 6.5a6 6 0 0 0 12 0C18 8.5 14.5 4.5 12 2z" fill="url(#hFlame)" />
      <path d="M12 10.5c0 0-1 1.5-1 3a1 1 0 0 0 2 0c0-1.5-1-3-1-3z" fill="#a8e8ff" />
      <defs>
        <linearGradient id="hFlame" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60c8ff" /><stop offset="1" stopColor="#1a6fff" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 17L9 11L13 15L21 7" stroke="url(#hArrow)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h6v6" stroke="url(#hArrow)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="hArrow" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" /><stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function HomeTab({
  recommendations, allFilms, addedIds, watchedIds,
  onOpenFilm, onAddToList, onWatchTrailer, onDismissRec,
}) {
  const [trendingNow, setTrendingNow]         = useState([])
  const [recentWatchlist, setRecentWatchlist] = useState([])
  const [upcomingShows, setUpcomingShows]     = useState([])

  useEffect(() => {
    getTrending().then(setTrendingNow).catch(() => {})
    getWatchlistRecent().then(setRecentWatchlist).catch(() => {})
    getUpcomingTv().then(setUpcomingShows).catch(() => {})
  }, [])

  const activeRecs = (recommendations || []).filter((r) => !watchedIds.includes(r.id))

  return (
    <div style={{ paddingBottom: 100 }}>

      {activeRecs.length > 0 && (
        <section style={{ padding: '0 16px', marginBottom: 28 }}>
          {activeRecs.map((rec) => {
            const filmId = rec.id || rec.film_id
            return (
              <div key={filmId} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', color: 'var(--gold-bright)', fontSize: 15 }}>
                    {rec.from_display_name || rec.from_username || 'A friend'} thinks you&rsquo;ll like&hellip;
                  </div>
                  {onDismissRec && (
                    <button onClick={() => onDismissRec(filmId)}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, cursor: 'pointer', padding: '0 0 0 10px' }}>
                      &times;
                    </button>
                  )}
                </div>
                {rec.note && (
                  <div style={{ fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', marginBottom: 8 }}>
                    &ldquo;{rec.note}&rdquo;
                  </div>
                )}
                <FilmCard film={rec} onOpen={onOpenFilm} onAddToList={onAddToList} onWatchTrailer={onWatchTrailer}
                  isAdded={addedIds.includes(filmId)} isWatched={watchedIds.includes(filmId)} />
              </div>
            )
          })}
        </section>
      )}

      {trendingNow.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <div style={{ padding: '0 16px', marginBottom: 12 }}>
            <SectionLabel><FlameIcon /> What&rsquo;s NEW</SectionLabel>
          </div>
          <HScroll>
            {trendingNow.map((film) => <PosterCard key={film.id} film={film} onClick={onOpenFilm} />)}
          </HScroll>
        </section>
      )}

      {recentWatchlist.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <div style={{ padding: '0 16px', marginBottom: 12 }}>
            <SectionLabel><TrendingIcon /> What Reel users are watching right now</SectionLabel>
          </div>
          <HScroll>
            {recentWatchlist.map((film) => (
              <PosterCard key={film.id} film={film} onClick={onOpenFilm}
                subtext={film.watcher_count ? film.watcher_count + ' watching' : undefined} />
            ))}
          </HScroll>
        </section>
      )}

      {upcomingShows.length > 0 && (
        <section style={{ padding: '0 16px', marginBottom: 28 }}>
          <div style={{ marginBottom: 12 }}>
            <SectionLabel>📺 Coming up on UK TV</SectionLabel>
          </div>
          {upcomingShows.slice(0, 8).map((show, i) => (
            <div key={show.id || i} onClick={() => onOpenFilm(show)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
              {show.image && (
                <img src={show.image} alt={show.name || ''} loading="lazy"
                  style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{show.name || show.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{[show.airdate, show.airtime].filter(Boolean).join(' at ')}</div>
              </div>
              {show.channel && (
                <div style={{ fontSize: 11, background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', color: 'var(--text2)', flexShrink: 0 }}>
                  {show.channel}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

    </div>
  )
}
