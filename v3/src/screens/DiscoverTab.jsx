import { useState, useMemo } from 'react'
import PosterCard from '../components/PosterCard'

export default function DiscoverTab({ allFilms, addedIds, onOpenFilm, onAddToList, providers }) {
  const [genreFilter, setGenreFilter]       = useState('All')
  const [providerFilter, setProviderFilter] = useState('All')

  const genres = useMemo(() => {
    const gs = new Set(allFilms.flatMap((f) => f.genre ? f.genre.split(',').map((g) => g.trim()) : []))
    return ['All', ...Array.from(gs).sort()]
  }, [allFilms])

  const filtered = useMemo(() => {
    return allFilms.filter((f) => {
      const genreMatch = genreFilter === 'All' || (f.genre || '').includes(genreFilter)
      const providerMatch = providerFilter === 'All' || (f.streamers || []).includes(providerFilter)
      return genreMatch && providerMatch
    })
  }, [allFilms, genreFilter, providerFilter])

  const providerNames = ['All', ...(providers || []).map((p) => p.name || p).filter(Boolean)]

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Filters */}
      <div style={{ padding: '0 16px', marginBottom: 16, display: 'flex', gap: 8 }}>
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          style={selectStyle()}
        >
          {genres.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          style={selectStyle()}
        >
          {providerNames.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 16,
        padding: '0 16px',
      }}>
        {filtered.map((film) => (
          <PosterCard
            key={film.id}
            film={film}
            onClick={onOpenFilm}
            subtext={addedIds.has(film.id) ? '✓ In list' : undefined}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 0', fontSize: 14 }}>
          No films match these filters.
        </div>
      )}
    </div>
  )
}

function selectStyle() {
  return {
    flex: 1,
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: 'var(--ff-body)',
  }
}
