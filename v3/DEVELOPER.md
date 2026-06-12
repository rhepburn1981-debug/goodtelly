# WatchChums -- Frontend (Vite + React)

This is the refactored React app (v3). The original single-file prototype is at `filmshare-app.html` — use it as a reference for any logic or edge cases.

## Quick start

```bash
cd v3
npm install
npm run dev        # http://localhost:5173
```

API calls are proxied to `https://www.watchchums.com` in dev (see `vite.config.js`). No backend setup needed.

For Google Sign-In to work locally, add `http://localhost:5173` as an authorised JavaScript origin in Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID.

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
    normalize.js    Field name normalisation (API returns snake_case, UI uses camelCase)
    streamers.js    Streaming service display config
  styles/
    variables.css   CSS custom properties (colours, fonts, radii)
    global.css      Reset + animations
  components/       Shared UI components
    AuthModal.jsx       Login + register + Google Sign-In + invite banner
    BottomNav.jsx       5-tab bottom navigation
    FilmCard.jsx        Film card with backdrop, poster, action buttons
    PosterCard.jsx      Small 90×130 poster card for horizontal scroll rows
    TrailerModal.jsx    YouTube embed overlay
    RecommendModal.jsx  WhatsApp recommendation flow
    SearchOverlay.jsx   TMDB search overlay with results
    Toast.jsx           Toast notification
  screens/          One file per tab/screen
    LandingPage.jsx         Pre-login marketing page (testimonials, features, CTA)
    HomeTab.jsx             Recommendations + trending sections
    HomeDashboard.jsx       Desktop layout for Home
    ListTab.jsx             My watchlist (to watch / watched)
    WatchlistDashboard.jsx  Desktop layout for List
    DiscoverTab.jsx         Browse all films with filters
    DiscoverDashboard.jsx   Desktop layout for Discover
    FriendsTab.jsx          Friends lists + friend requests
    FriendsDashboard.jsx    Desktop layout for Friends
    ProfileTab.jsx          User profile, stats, logout
    ProfileDashboard.jsx    Desktop layout for Profile
    FilmDetailPage.jsx      Full-screen film detail (stills carousel, trailer, rating, streaming badges)
  App.jsx           Root component — state, routing, data fetching, TMDB search
  main.jsx          Entry point
```

## Current status

### Done and working
- All screens implemented and functional
- LandingPage — marketing splash with testimonials and sign-up CTA
- FilmDetailPage — stills carousel, trailer, star rating, streaming badges
- TMDB search — debounced 500ms, implemented in `App.jsx`, results shown via `SearchOverlay`
- WhatsApp invite flow — fully implemented (see below)
- Desktop dashboard layouts for all tabs
- Google Sign-In + email auth

### Still to complete
- Home header — the original has a WiFi icon + "Reel" title + subtitle + golden popcorn image (base64 PNG embedded in `filmshare-app.html` around line 9900)
- Any remaining edge cases — use `filmshare-app.html` as the reference spec

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
When a new user registers via a WhatsApp share link:
1. `reel-share-landing.html` writes invite data to `localStorage` key `reel_invite` (JSON with 1-hour expiry)
2. User is redirected to `/?register=1&...` (URL params as belt-and-suspenders fallback)
3. Auth modal reads invite via `consumeInvite()` in `src/utils/invite.js`
4. Invite fields (`invite_from_user`, `invite_film_title` etc.) passed to `/api/auth/register` or `/api/auth/google`
5. Backend atomically creates friendship + recommendation in one DB transaction

## Backend
FastAPI + SQLite. No changes needed for frontend work. All endpoints documented in `CLAUDE.md`.
Live: `https://goodtelly-production.up.railway.app`

## Deployment
Currently the backend serves the original `filmshare-app.html` directly via `GET /`.
To switch to this Vite app:
1. `npm run build` — outputs to `dist/`
2. In `filmshare-api/main.py`, replace the `FileResponse` for `GET /` with a `StaticFiles` mount on `dist/`
3. Ensure `dist/index.html` is served for all unmatched routes (SPA routing)
