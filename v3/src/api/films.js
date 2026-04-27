import { api } from "./client";
import { normalizeFilm, normalizeExternal } from "../utils/normalize";

export function getFilms() {
  return api
    .get("/api/films")
    .then((films) => (films || []).map(normalizeFilm));
}

export function getFilm(id) {
  return api.get("/api/films/" + id).then(normalizeFilm);
}

export function getFilmBySlug(slug) {
  return api.get("/api/films/slug/" + slug).then(normalizeFilm);
}

export function addFilm(body) {
  // POST /api/films — auto-enriches from TMDB
  // body: { title, year, tmdbId?, tvmazeId?, autoEnrich? }
  return api.post("/api/films", body).then(normalizeFilm);
}

export function searchTmdb(query) {
  return api
    .get("/api/tmdb/search?q=" + encodeURIComponent(query))
    .then((results) => (results || []).map((r) => ({ ...r, _fromTmdb: true })));
}

export function getTmdbDetails(tmdbId) {
  return api.get("/api/tmdb/details/" + tmdbId);
}

export function getTrending() {
  return api
    .get("/api/trending/all")
    .then((items) => (items || []).map(normalizeExternal));
}

export function getWatchlistRecent() {
  return api
    .get("/api/trending/watchlist-recent")
    .then((items) => (items || []).map(normalizeFilm));
}

export function getUpcomingTv() {
  return api
    .get("/api/trending/upcoming-tv")
    .then((items) => (items || []).map(normalizeExternal));
}

export function getTvSchedule() {
  return api
    .get("/api/trending/tv-schedule")
    .then((items) => (items || []).map(normalizeExternal));
}

export function getDiscoverTv() {
  return api
    .get("/api/trending/discover-tv")
    .then((items) => (items || []).map(normalizeExternal));
}

export function getProviders() {
  return api
    .get("/api/providers")
    .then((res) => (Array.isArray(res) ? res : []))
    .catch(() => []);
}

export function logTrailer(filmId) {
  return api.post("/api/log/trailer", { film_id: filmId }).catch(() => {});
}

export function logSearch(query) {
  return api.post("/api/log/search", { query }).catch(() => {});
}

export function logTab(tabName) {
  return api.post("/api/log/tab", { tab: tabName }).catch(() => {});
}
