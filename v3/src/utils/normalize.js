// Normalize film objects from the API to a consistent internal shape.
// The API mixes snake_case and camelCase — this makes components predictable.

export function normalizeFilm(f) {
  if (!f) return f
  return {
    ...f,
    // Poster / backdrop / trailer — API uses camelCase or shorthand
    poster_url:   f.poster_url   || f.poster    || '',
    backdrop_url: f.backdrop_url || f.backdrop  || '',
    trailer_url:  f.trailer_url  || f.trailerUrl|| '',
    // Description
    overview: f.overview || f.description || '',
    // Normalize runtime — API may return "46m" or just a number
    runtime: f.runtime || '',
  }
}

// Normalize an external TMDB/TVMaze result (from trending endpoints)
export function normalizeExternal(item) {
  return {
    id: item.id,
    title: item.title || item.name || '',
    poster_url: item.poster_large || item.poster || item.image || '',
    backdrop_url: item.backdrop || '',
    trailer_url: item.trailerUrl || item.trailer_url || '',
    overview: item.overview || item.summary || '',
    year: item.year || (item.first_air_date ? item.first_air_date.slice(0, 4) : '') || '',
    genre: Array.isArray(item.genres) ? item.genres.slice(0, 2).join(', ') : (item.genre || ''),
    rating: item.rating,
    streamers: [],
    stills: [],
    _isExternal: true,
    // Keep originals for TV schedule display
    channel: item.channel || item.network || '',
    airdate: item.airdate || '',
    airtime: item.airtime || '',
    name: item.name || item.title || '',
    image: item.image || item.poster || '',
  }
}
