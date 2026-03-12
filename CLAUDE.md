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

## Deployment
- Git remote: `https://github.com/rhepburn1981-debug/goodtelly.git` (branch: `main`)
- Railway auto-deploys on push to `main` — live at `https://goodtelly-production.up.railway.app/`
- `GET /` serves `filmshare-app.html` directly (FastAPI `FileResponse`)
- `GET /share` serves OG meta page (`reel-share-landing.html`)
- DB path in production: `/data/filmshare.db` (set via `DB_PATH` env var)
- To screenshot the live site: use `playwright` (installed) — see screenshot scripts in project root

## Frontend UI design (matches mockup at `mockup.png`)
The app is branded **Reel**. The home screen layout (top to bottom):
1. **Header** — blue WiFi SVG icon + "Reel" (82px bold) + "TV recommended by friends" subtitle + golden popcorn bucket image (base64 PNG cropped from `mockup.png`)
2. **Search bar** — dark pill shape (`rgba(255,255,255,0.07)`, borderRadius 22), dark text input (`color: var(--text)`)
3. **My Watchlist** ribbon card — blue star icon, navigates to List tab
4. **Friends Watchlist** ribbon card — grey person SVG, navigates to Friends tab
5. **Recommendation cards** — "[Friend] thinks you'll like…" in gold italic, film card with backdrop + poster, Watch Trailer + Watchlist buttons
6. **"🔥 What's NEW"** — TMDB trending, blue SVG flame icon, horizontally scrolling poster cards (90×130px, text below)
7. **"🎬 What Reel users are watching right now"** — local trending films, same card style
8. **"📈 Trending with Reel Users"** — TVmaze UK shows, list view with channel badge + date
9. **Bottom nav** — Home, My List, Discover, Friends, [Username text only in gold — no icon]

### CSS variables (defined in `<style>`)
- `--ink: #070709` (near-black background)
- `--surface: #0e0e14`, `--surface2: #13131c`, `--surface3: #1a1a26`
- `--gold-bright: #e8c96a`, `--text: #eae6dc`, `--muted: #5a566a`
- `--ff-body: "DM Sans"`, `--ff-display: "Cormorant Garamond"`
- `html { font-size: 112% }` — affects rem but NOT px inline styles

### Key frontend gotchas
- Smart/curly quotes (U+201C/201D) break JS — use Python bulk replace if they appear
- Validate JS syntax with: `python3 -c "extract scripts" && node --check check_temp.js`
- Template literals cause issues in some editors — use string concatenation `"url(" + x + ")"` instead
- `sectionLabel()` helper: fontSize 18, fontWeight 800
- Poster cards: 90×130px, title + count text below image (NOT overlaid)
- Popcorn image in header: base64 PNG embedded inline, cropped from `mockup.png` using Pillow

## Windows gotchas
- Edit/Write tools throw EEXIST error on existing dirs — use `Bash` with Python scripts instead
- Heredoc with single-quoted EOF fails in `bash -c` — use `python3 -c` with escaped strings
- Windows netstat shows phantom PIDs that don't exist — can't kill them

## Backups
Backend: `main.backup5.py`, `main.backup6.py`
Frontend: `filmshare-app.backup5.html`, `filmshare-app.backup6.html`

## Useful scripts / tools in project root
- `mockup.png` — the reference design mockup (1024×1536px)
- `screenshot_*.png` — playwright screenshots of the live site for comparison
- Playwright is installed (`python3 -m playwright`) — use for live site screenshots
