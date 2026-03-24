# Reel — Frontend (Vite + React)

This is the refactored React app. The original single-file prototype is at `../filmshare-app.html` — use it as a reference for any logic not yet ported here.

## Quick start

```bash
cd reel-app
npm install
npm run dev        # http://localhost:5173
```

API calls are proxied to `https://goodtelly-production.up.railway.app` in dev (see `vite.config.js`). No CORS issues.

## Project structure

```
src/
  api/            API client layer — one file per domain
    client.js       Base fetch wrapper, token management
    auth.js         /api/auth/* endpoints
    films.js        /api/films/*, /api/tmdb/*, /api/trending/*
    friends.js      /api/friends/*, /api/users/*
    watchlist.js    /api/me/watchlist, watched, ratings, recommendations
  utils/
    invite.js       localStorage invite flow (WhatsApp → register)
    share.js        WhatsApp share URL builder
    streamers.js    Streaming service display config
  styles/
    variables.css   CSS custom properties (colours, fonts, radii)
    global.css      Reset + animations
  components/       Shared UI components
    AuthModal.jsx   Login + register + Google Sign-In
    BottomNav.jsx   5-tab bottom navigation
    FilmCard.jsx    Film card with backdrop, poster, action buttons
    PosterCard.jsx  Small 90×130 poster card for horizontal scroll rows
    TrailerModal.jsx YouTube embed overlay
    RecommendModal.jsx  WhatsApp recommendation flow
    Toast.jsx       Toast notification
  screens/          One file per tab/screen
    LandingPage.jsx Pre-login splash
    HomeTab.jsx     Recommendations + trending sections
    ListTab.jsx     My watchlist (to watch / watched)
    DiscoverTab.jsx Browse all films with filters
    FriendsTab.jsx  Friends' lists + friend requests
    ProfileTab.jsx  User profile, stats, logout
    FilmDetailPage.jsx  Full-screen film detail (needs completing — see below)
  App.jsx           Root component — state, routing, data fetching
  main.jsx          Entry point
```

## What needs completing (port from original)

### FilmDetailPage (`src/screens/FilmDetailPage.jsx`)
The current version is a basic placeholder. The full version in `filmshare-app.html` (line ~10933) includes:
- Stills carousel (TMDB backdrops)
- Streaming service badges with logos
- Friends' ratings for this film
- TMDB/TVMaze enrichment on open
- Rating input

### TMDB search (in DiscoverTab / HomeTab)
The original has a debounced search bar that searches TMDB and allows adding results directly.
Reference: `filmshare-app.html` line ~13820 and the search useEffect at ~13900.

### Home header
The original header has: WiFi icon + "Reel" (82px) + subtitle + golden popcorn image (base64 PNG).
The base64 popcorn image is embedded in `filmshare-app.html` around line 9900.

## Key architectural decisions

### Why localStorage for invite data
WhatsApp's in-app browser (WKWebView on iOS) clears `sessionStorage` during Google OAuth redirects.
`reel_invite` key in `localStorage` with 1-hour expiry survives the redirect.
See `src/utils/invite.js` for the full implementation.

### Auth token
Stored in `localStorage` under key `filmshare_token`. Read on every API call via `getToken()` in `src/api/client.js`.

### Google Sign-In
The callback must be defined with `useCallback([], [])` (stable reference) so it doesn't re-register on every render.
Invite data is read from `localStorage` *inside* the callback, not from React props/state.
Client ID: `709452989437-vooq081nkmhb03n12h8p0tee0e327ui1.apps.googleusercontent.com`

### WhatsApp invite → friend + recommendation
When a new user registers via a WhatsApp link:
1. `reel-share-landing.html` writes invite data to `localStorage.reel_invite`
2. User is redirected to `/?register=1&...`
3. Auth modal reads invite from localStorage, passes `invite_from_user` + `invite_film_title` etc. to backend
4. Backend atomically creates friendship + recommendation in the same DB transaction

## Backend
FastAPI + SQLite. No changes needed. All endpoints documented in `../CLAUDE.md`.
Live: `https://goodtelly-production.up.railway.app`
Admin token: `reel-admin-2024` (for `GET /api/admin/users` and `POST /api/admin/create-recommendation`)

## Deployment
Currently the backend serves `filmshare-app.html` directly via `GET /`.
To deploy this Vite app: `npm run build`, then serve `dist/` from the FastAPI app.
In `main.py`, replace the `FileResponse` for `/` with a `StaticFiles` mount on `dist/`.
