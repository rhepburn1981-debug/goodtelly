// Normalize film objects from the API to a consistent internal shape.
// The API mixes snake_case and camelCase — this makes components predictable.

export function normalizeFilm(f) {
  if (!f) return f;
  return {
    ...f,
    // Poster / backdrop / trailer — API uses camelCase or shorthand
    poster_url: f.poster_url || f.poster || "",
    backdrop_url: f.backdrop_url || f.backdrop || "",
    trailer_url: f.trailer_url || f.trailerUrl || "",
    // Description
    overview: f.overview || f.description || "",
    // Normalize runtime — API may return "46m" or just a number
    runtime: f.runtime || "",
  };
}

// Normalize an external TMDB/TVMaze result (from trending endpoints)
export function normalizeExternal(item) {
  return {
    ...item,
    id: item.id,
    tmdb_id: item.tmdb_id || item.id, // Ensure we have a TMDB ID reference
    title: item.title || item.name || "",
    poster_url: item.poster_large || item.poster || item.image || "",
    backdrop_url: item.backdrop || item.backdrop_path || "",
    trailer_url: item.trailerUrl || item.trailer_url || "",
    overview: item.overview || item.summary || "",
    year:
      item.year ||
      (item.release_date ? item.release_date.slice(0, 4) : "") ||
      (item.first_air_date ? item.first_air_date.slice(0, 4) : "") ||
      "",
    genre: Array.isArray(item.genres)
      ? item.genres.slice(0, 2).map(g => g.name || g).join(", ")
      : item.genre || "",
    rating: item.rating || item.vote_average,
    director: item.director || "",
    cast: item.cast || "",
    stills: item.stills || [],
    streamers: item.streamers || [],
    _fromTmdb: true, // Crucial for handleAddToList logic
    _isExternal: true,
    // Keep originals for TV schedule display
    channel: item.channel || item.network || "",
    airdate: item.airdate || "",
    airtime: item.airtime || "",
    name: item.name || item.title || "",
    image: item.image || item.poster || "",
  };
}
