# filmshare — Claude Instructions

## Project overview
filmshare is a film/TV tracking and recommendation app. FastAPI backend + SQLite, single-file React frontend (no build step).

## Key files
- `filmshare-api/main.py` — FastAPI backend (main API)
- `filmshare-api/tmdb.py` — TMDB API helper
- `filmshare-api/tvmaze.py` — TVMaze API helper
- `filmshare-api/filmshare.db` — SQLite database
- `filmshare-api/.env` — contains `TMDB_API_KEY` (keep private, never commit)
- `filmshare-api/seed.py` — seed data script
- `filmshare-app.html` — React frontend (~15k lines, single file)

## Running the server
```
cd filmshare-api && python -m uvicorn main:app --port 8002 --reload
```
Ports 8000 and 8001 have phantom Windows sockets. Use 8002+. If 8002 is occupied, try 8003.

The `.env` file is auto-loaded by `main.py` on startup — no need to export env vars.

## Architecture
- FastAPI + SQLite, no ORM — raw SQL queries
- JWT auth (7-day tokens), bcrypt passwords
  - Use `import bcrypt as _bcrypt` directly — NOT passlib (Python 3.13 bug)
  - JWT `sub` must be string — store `str(user_id)`, convert back with `int(sub)`
- TMDB API key read at call-time via `os.environ.get()`
- Frontend uses relative `API_BASE=''` — always hits the serving origin
- React via CDN, no JSX, uses `createElement` and hooks

## DB tables
`films`, `film_streamers`, `film_stills`, `users`, `user_friends`, `user_watchlist`, `user_watched`, `user_ratings`, `watchlist`, `watched`, `friends`, `friend_watched`

## Key API endpoints
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/auth/me`, `PUT /api/auth/me`
- `GET/POST/DELETE /api/friends/{username}`, `PUT /api/friends/{username}/accept`
- `GET /api/me/watchlist`, `POST/DELETE /api/me/watchlist/{id}`
- `POST/DELETE /api/me/watched/{id}`, `POST /api/me/ratings/{id}`
- `GET /api/films`, `GET /api/films/{id}`, `POST /api/films` (auto-enriches from TMDB)
- `GET /api/tmdb/search?q=` — search TMDB
- `GET /api/users/{username}` — public profile
- `GET /share?title=&from=&rating=&note=&poster=` — OG meta tag page for WhatsApp preview

## TMDB integration
- `trailer_url` stored as `youtube.com/embed/KEY` (not `watch?v=`)
- Stills stored as TMDB backdrop URLs (w780 size)
- `enrich_film()` called automatically on `POST /api/films`
- To re-enrich: run a script using `tmdb.get_film_details(tmdb_id)`

## Frontend patterns
- `ALL_FILMS` and `FRIENDS_DATA` are mutable `let`s, populated by async `bootstrap()` before React mounts
- Auth token stored in `localStorage` key `'filmshare_token'`
- `window.__AUTH_USER` and `window.__AUTH_TOKEN` set after token validation
- TMDB search: debounced 500ms, results show with blue TMDB badge
- Adding TMDB result: `POST /api/films` first, then adds to watchlist

## WhatsApp sharing
- Recommend button → RecommendModal → `sendViaWhatsApp()` → `wa.me/?text=` deeplink
- Share URL: `window.location.origin + /share?title=...&from=...&poster=...&trailer=...`

## Windows gotchas
- Edit/Write tools throw EEXIST error on existing dirs — use `Bash` with Python scripts instead
- Heredoc with single-quoted EOF fails in `bash -c` — use `python3 -c` with escaped strings
- Windows netstat shows phantom PIDs that don't exist — can't kill them

## Backups
Backend: `main.backup5.py`, `main.backup6.py`
Frontend: `filmshare-app.backup5.html`, `filmshare-app.backup6.html`
