import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { getToken, setToken, clearToken } from './api/client'
import { getMe } from './api/auth'
import { getFilms, getFilm, getFilmBySlug, getProviders, searchTmdb, addFilm, logTab, getTrending, getUpcomingTv, getTmdbDetails } from './api/films'
import { getFriends, getFriendRequests } from './api/friends'
import { getWatchlist, getRecommendations, addToWatchlist, removeFromWatchlist, markWatched, unmarkWatched, saveRating, getUserRatings, recordShareRecommendation } from './api/watchlist'
import { normalizeFilm } from './utils/normalize'
import { readInviteFromUrl } from './utils/invite'

import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import AuthModal from './components/AuthModal'
import TrailerModal from './components/TrailerModal'
import RecommendModal from './components/RecommendModal'
import SearchOverlay from './components/SearchOverlay'

import LandingPage from './screens/LandingPage'
import FilmDetailPage from './screens/FilmDetailPage'

// Desktop Dashboard views
import HomeDashboard from './screens/HomeDashboard'
import WatchlistDashboard from './screens/WatchlistDashboard'
import DiscoverDashboard from './screens/DiscoverDashboard'
import FriendsDashboard from './screens/FriendsDashboard'
import ProfileDashboard from './screens/ProfileDashboard'

// Mobile Tab views
import HomeTab from './screens/HomeTab'
import ListTab from './screens/ListTab'
import DiscoverTab from './screens/DiscoverTab'
import FriendsTab from './screens/FriendsTab'
import ProfileTab from './screens/ProfileTab'

import useIsMobile from './hooks/useIsMobile'

// ─── Capture share params IMMEDIATELY on module load ───────────────────────────
// React Router's <Navigate> replaces the URL synchronously during render,
// BEFORE useEffect runs. So we must capture params here, at the module level.
;(function captureShareParamsEarly() {
  try {
    const params = new URLSearchParams(window.location.search)
    const title = params.get('title') || params.get('open_title')
    const poster = params.get('poster')
    
    if (title) {
      // Store rec data for the backend call (after login)
      localStorage.setItem('pending_share_rec', JSON.stringify({
        film_title: title,
        film_year: params.get('year') || params.get('open_year') || '',
        from_username: params.get('from_user') || params.get('rec_from_user') || '',
        note: params.get('note') || params.get('rec_note') || '',
        rating: (params.get('rating') || params.get('rec_rating')) ? parseFloat(params.get('rating') || params.get('rec_rating')) : null,
        poster: poster || '',
        trailer: params.get('trailer') || '',
        genre: params.get('genre') || '',
        runtime: params.get('runtime') || '',
      }))
    }
  } catch (_) {}
})()

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()

  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState(() => getToken())
  const [authLoading, setAuthLoading] = useState(!!getToken())
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [shareInvite, setShareInvite] = useState(null)

  const [allFilms, setAllFilms] = useState([])
  const [providers, setProviders] = useState([])
  const [myList, setMyList] = useState([])
  const [addedIds, setAddedIds] = useState([])
  const [watchedIds, setWatchedIds] = useState([])
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [friendsHasUnread, setFriendsHasUnread] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [trendingAll, setTrendingAll] = useState([])
  const [upcomingTv, setUpcomingTv] = useState([])

  const [selectedFilm, setSelectedFilm] = useState(null)
  const [recommendFilm, setRecommendFilm] = useState(null)
  const [trailerUrl, setTrailerUrl] = useState('')
  const [seenItFilm, setSeenItFilm] = useState(null)
  const [seenItRating, setSeenItRating] = useState(0)
  const [seenItHover, setSeenItHover] = useState(0)
  const [toast, setToast] = useState('')
  const [userRatings, setUserRatings] = useState({})

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimer = useRef(null)

  // Derive active tab from route for BottomNav
  const pathToTab = {
    '/dashboard/home': 'home',
    '/dashboard/watchlist': 'list',
    '/dashboard/discover': 'discover',
    '/dashboard/friends': 'friends',
    '/dashboard/profile': 'profile',
  }
  const activeTab = pathToTab[location.pathname] || 'home'

  function onTabChange(tabId) {
    setSearch('') // Clear search when switching tabs
    const tabToPath = {
      home: '/dashboard/home',
      list: '/dashboard/watchlist',
      discover: '/dashboard/discover',
      friends: '/dashboard/friends',
      profile: '/dashboard/profile',
    }
    navigate(tabToPath[tabId] || '/dashboard/home')
  }

  // --- Startup ---
  useEffect(() => {
    getFilms().then(setAllFilms).catch(() => { })
    getProviders().then(setProviders).catch(() => { })
    getTrending().then(setTrendingAll).catch(() => { })
    getUpcomingTv().then(setUpcomingTv).catch(() => { })

    const invite = readInviteFromUrl()
    if (invite) {
      import('./utils/invite').then(({ writeInvite }) => writeInvite(invite))
      const token = getToken()
      if (token) {
        // Logged-in user: auto-connect
        import('./api/friends').then(({ connectFriend, getFriends }) => {
          connectFriend(invite.from).then(() => {
            getFriends().then(setFriends).catch(() => {})
            showToast(`Connected with ${invite.from}!`)
          }).catch(() => {})
        })
      } else {
        // Guest user: show registration
        setShareInvite(invite)
        setAuthMode('register')
        setShowAuth(true)
      }
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('register') === '1') {
      setAuthMode('register')
      setShowAuth(true)
      window.history.replaceState({}, '', '/')
    }

    const openSlug = params.get('open')
    if (openSlug) {
      getFilmBySlug(openSlug).then(setSelectedFilm).catch(() => { })
      window.history.replaceState({}, '', '/')
    }
  }, [])

  // --- Auth init ---
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setAuthLoading(false)
      return
    }
    getMe()
      .then((user) => { setCurrentUser(user); setAuthToken(token) })
      .catch(() => { clearToken(); setAuthToken(null) })
      .finally(() => setAuthLoading(false))
  }, [])

  // --- Fetch user data when logged in ---
  useEffect(() => {
    if (!authToken) return
    getWatchlist().then((list) => {
      setMyList(list)
      setAddedIds(list.map((f) => f.id))
      setWatchedIds(list.filter((f) => f.watched || f.isWatched).map((f) => f.id))
    }).catch(() => { })
    getFriends().then(setFriends).catch(() => { })
    getFriendRequests().then((reqs) => {
      setFriendRequests(reqs || [])
      if ((reqs || []).length > 0) setFriendsHasUnread(true)
    }).catch(() => { })
    getUserRatings().then(setUserRatings).catch(() => { })

    // Process any pending WhatsApp share recommendation
    const pendingRec = localStorage.getItem('pending_share_rec')
    if (pendingRec) {
      try {
        const recData = JSON.parse(pendingRec)
        recordShareRecommendation(recData)
          .then(() => {
            localStorage.removeItem('pending_share_rec')
            // Reload recommendations so the film appears in the Home tab
            return getRecommendations()
          })
          .then(setRecommendations)
          .catch(() => {
            localStorage.removeItem('pending_share_rec')
          })
      } catch (_) {
        localStorage.removeItem('pending_share_rec')
        getRecommendations().then(setRecommendations).catch(() => { })
      }
    } else {
      getRecommendations().then(setRecommendations).catch(() => { })
    }
  }, [authToken])

  // --- Poll for friend requests, recommendations, and friends' watchlists every 30s ---
  useEffect(() => {
    if (!authToken) return
    const poll = () => {
      getFriends().then(setFriends).catch(() => { })
      getFriendRequests().then((reqs) => {
        setFriendRequests(reqs || [])
        if ((reqs || []).length > 0) setFriendsHasUnread(true)
      }).catch(() => { })
      getRecommendations().then((incoming) => {
        if (!incoming || !incoming.length) return
        setRecommendations((prev) => {
          const prevIds = new Set(prev.map((r) => r.id))
          const hasNew = incoming.some((r) => !prevIds.has(r.id))
          return hasNew ? incoming : prev
        })
      }).catch(() => { })
    }
    const id = setInterval(poll, 30000)
    return () => clearInterval(id)
  }, [authToken])

  // --- TMDB search with 500ms debounce ---
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!search.trim()) { setSearchResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const results = await searchTmdb(search.trim())
        const sorted = (results || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0))
        setSearchResults(sorted)
      } catch (_) {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 500)
    return () => clearTimeout(searchTimer.current)
  }, [search])

  // --- Auth callbacks ---
  const onLogin = useCallback((user, token) => {
    setCurrentUser(user)
    setAuthToken(token)
    setToken(token)
    setShowAuth(false)
    navigate('/dashboard/home')
  }, [navigate])

  const onLogout = useCallback(() => {
    clearToken()
    setCurrentUser(null)
    setAuthToken(null)
    setMyList([])
    setAddedIds([])
    setWatchedIds([])
    setFriends([])
    setRecommendations([])
    navigate('/')
  }, [navigate])

  // --- Watchlist actions ---
  async function handleAddToList(film) {
    const id = film.id;
    const tmdbId = film.tmdb_id || film.tmdbId;

    // For trending films, film.id IS the TMDB ID — match against our DB films
    const existing = allFilms.find(f =>
      f.id === id || (tmdbId && f.tmdb_id === tmdbId) || f.tmdb_id === id
    );
    const internalId = existing ? existing.id : id;

    if (addedIds.includes(internalId) || addedIds.includes(id)) {
      showToast('"' + film.title + '" is already in your list');
      return;
    }

    // Optimistic UI update
    setAddedIds((prev) => [...prev, internalId]);
    setMyList((prev) => prev.find((f) => f.id === internalId) ? prev : [...prev, existing || film]);
    showToast('"' + film.title + '" added to list');
    // If selectedFilm uses TMDB ID as its id, swap to the internal DB id so isAdded shows correctly
    if (existing && existing.id !== id) {
      setSelectedFilm((prev) => prev && prev.id === id ? { ...prev, id: existing.id } : prev);
    }
    try {
      if (!existing) {
        let saved;
        if (film._isExternal) {
          // TVmaze show from "What's on this week" — check by title first, then create with TVmaze ID
          const titleMatch = allFilms.find(f =>
            f.title && f.title.toLowerCase() === (film.title || film.name || '').toLowerCase()
          );
          if (titleMatch) {
            setAddedIds((prev) => [...prev.filter((x) => x !== internalId), titleMatch.id]);
            setMyList((prev) => [...prev.filter((f) => f.id !== internalId), titleMatch]);
            setSelectedFilm((prev) => prev && prev.id === id ? { ...prev, id: titleMatch.id } : prev);
            await addToWatchlist(titleMatch.id);
            return titleMatch.id;
          }
          saved = await addFilm({
            title: film.title || film.name,
            year: film.year ? parseInt(film.year) : null,
            poster: film.poster_url || film.image,
            tvmazeId: typeof film.id === 'number' ? film.id : null,
            autoEnrich: true,
          });
        } else {
          // TMDB film (trending or search) — film.id IS the TMDB ID
          const tmdbIdToUse = film.tmdb_id || film.tmdbId || film.id;
          const isTvShow = film.media_type === 'tv';
          saved = await addFilm({
            title: film.title,
            year: film.year ? parseInt(film.year) : null,
            ...(isTvShow ? { tmdbTvId: tmdbIdToUse } : { tmdbId: tmdbIdToUse }),
            autoEnrich: true,
          });
        }
        setAllFilms((prev) => [...prev, saved]);
        setAddedIds((prev) => prev.filter((x) => x !== internalId && x !== id).concat(saved.id));
        setMyList((prev) => prev.map((f) => f.id === internalId ? saved : f));
        setSelectedFilm((prev) => prev && (prev.id === id || prev.id === internalId) ? { ...prev, id: saved.id } : prev);
        await addToWatchlist(saved.id);
        return saved.id;
      }
      await addToWatchlist(internalId);
      return internalId;
    } catch (_) {
      setAddedIds((prev) => prev.filter((x) => x !== internalId));
      setMyList((prev) => prev.filter((f) => f.id !== internalId));
      showToast('Could not add to list');
    }
  }

  function handleRemoveFromList(film) {
    const id = film.id || film.film_id
    setAddedIds((prev) => prev.filter((x) => x !== id))
    setWatchedIds((prev) => prev.filter((x) => x !== id))
    setMyList((prev) => prev.filter((f) => f.id !== id))
    showToast('Removed from list')
    removeFromWatchlist(id).catch(() => { })
  }

  async function handleMarkWatched(film) {
    let id = film.id
    if (!addedIds.includes(id)) {
      const resolvedId = await handleAddToList(film)
      if (resolvedId) id = resolvedId
    }
    setWatchedIds((prev) => prev.includes(id) ? prev : [...prev, id])
    showToast('Logged as watched!')
    try { await markWatched(id) } catch (_) { }
    return id
  }

  async function handleUnmarkWatched(film) {
    const id = film.id
    setWatchedIds((prev) => prev.filter((x) => x !== id))
    showToast(`"${film.title}" moved back to To Watch`)
    try { await unmarkWatched(id) } catch (_) { }
  }

  async function handleSaveRating(filmId, rating) {
    try {
      await saveRating(filmId, rating)
      setUserRatings(prev => ({ ...prev, [filmId]: rating }))
    } catch (_) {
      showToast('Could not save rating')
    }
  }

  function showToast(msg) { setToast(msg) }

  async function handleWatchTrailer(film) {
    if (!film) return;
    if (film.trailer_url) {
      setTrailerUrl(film.trailer_url);
      return;
    }
    const tmdbId = film.tmdb_id || film.tmdbId;
    if (tmdbId) {
      showToast('Fetching trailer...');
      try {
        const details = await getTmdbDetails(tmdbId);
        if (details && details.trailer_url) {
          setTrailerUrl(details.trailer_url);
          setSelectedFilm(prev => (prev && (prev.id === film.id || prev.tmdb_id === tmdbId)) ? { ...prev, ...details } : prev);
        } else {
          showToast('No trailer found for this film');
        }
      } catch (e) {
        showToast('Error fetching trailer');
      }
    } else {
      showToast('No trailer available for this show');
    }
  }

  function openFilm(film) {
    const normalized = normalizeFilm(film)
    setSelectedFilm(normalized)
    
    if (film.id > 0 && !film._isExternal) {
      getFilm(film.id).then((full) => {
        if (full) setSelectedFilm((prev) => prev?.id === film.id ? { ...prev, ...full } : prev)
      }).catch(() => { })
    } else if (film._fromTmdb || film._isExternal) {
      const tmdbId = film.tmdb_id || film.tmdbId;
      if (tmdbId) {
        getTmdbDetails(tmdbId).then((details) => {
          if (details) {
            setSelectedFilm((prev) => (prev && (prev.id === film.id || prev.tmdb_id === tmdbId))
              ? { ...prev, ...details, trailer_url: prev.trailer_url || details.trailer_url }
              : prev);
          }
        }).catch(() => { });
      }
    }
  }

  const localFiltered = search.trim()
    ? allFilms.filter((f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.genre || '').toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (b.year || 0) - (a.year || 0))
    : []

  // Deduplicate localFiltered itself (in case allFilms has duplicate entries)
  const seenLocal = new Set()
  const uniqueLocal = localFiltered.filter((f) => {
    const key = (f.title || '').toLowerCase() + '_' + (f.year || '')
    if (seenLocal.has(key)) return false
    seenLocal.add(key)
    return true
  })

  // Add TMDB results only if no local film already covers that title+year
  const combinedSearch = [
    ...uniqueLocal,
    ...searchResults.filter((r) => {
      const key = (r.title || '').toLowerCase() + '_' + (r.year || '')
      return !seenLocal.has(key)
    }),
  ]

  const sharedProps = {
    allFilms,
    addedIds,
    watchedIds,
    onOpenFilm: openFilm,
    onAddToList: handleAddToList,
    onRemoveFromList: handleRemoveFromList,
    onMarkWatched: handleMarkWatched,
    onUnmarkWatched: handleUnmarkWatched,
    onWatchTrailer: (url) => setTrailerUrl(url),
    onToast: showToast,
    currentUser,
    userRatings,
    onSaveRating: handleSaveRating,
    onRecommend: (film) => setRecommendFilm(film),
    onSeenIt: (film) => { setSeenItFilm(film); setSeenItRating(0); setSeenItHover(0); },
    trendingAll,
    upcomingTv,
    friends,
  }

  const dashboardNavProps = {
    searchQuery: search,
    onSearchChange: setSearch,
    activeTab,
    onTabChange,
  }

  if (authLoading) {
    return (
      <div style={{
        height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#09090d', color: '#fff'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <img src="/branding/logo.png" style={{ height: '60px', opacity: 0.8 }} alt="Loading..." />
          <div className="loading-spinner" style={{
            width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
          }} />
        </div>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
      </div>
    )
  }

  return (
    <>
      {search.trim() && (
        <SearchOverlay
          results={combinedSearch}
          loading={searchLoading}
          addedIds={addedIds}
          onOpenFilm={openFilm}
          onAddToList={handleAddToList}
          onClose={() => setSearch('')}
        />
      )}

      <Routes>
        {/* Landing / Auth */}
        <Route path="/" element={
          !currentUser ? (
            <>
              <LandingPage
                onShowLogin={() => { setAuthMode('login'); setShowAuth(true) }}
                onShowRegister={() => { setAuthMode('register'); setShowAuth(true) }}
              />
            </>
          ) : (
            <Navigate to="/dashboard/home" replace />
          )
        } />

        {/* Dashboard Routes - Desktop uses Dashboard components, Mobile uses Tab components */}
        <Route path="/dashboard/home" element={
          isMobile ? (
            <>
              <header style={{
                background: 'radial-gradient(circle at 28% 18%, rgba(63, 118, 255, 0.08), transparent 18%), radial-gradient(circle at 72% 44%, rgba(146, 101, 39, 0.18), transparent 26%), radial-gradient(circle at 86% 20%, rgba(198, 154, 82, 0.09), transparent 17%), linear-gradient(rgb(12, 11, 16) 0%, rgb(9, 9, 13) 100%)',
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 100
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/branding/logo.png" alt="Watch Chums Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }} onClick={() => onTabChange('home')} />
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: '1.2' }}>TV recommended by friends</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>

                <div style={{ padding: '0 14px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '10px 14px', gap: '10px',
                    border: '1px solid #d1d1d1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#555" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search for any film or drama in seconds..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        color: '#111', fontSize: '15px', fontWeight: '500',
                        placeholderColor: '#666'
                      }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
                  </div>
                </div>
              </header>
              <main style={{ paddingBottom: 80 }}>
                <HomeTab {...sharedProps} onTabChange={onTabChange} recommendations={recommendations} onRecommend={(film) => setRecommendFilm(film)} onDismissRec={(id) => { const d = JSON.parse(localStorage.getItem('dismissed_recs') || '[]'); localStorage.setItem('dismissed_recs', JSON.stringify([...d, id])); setRecommendations((prev) => prev.filter((r) => r.id !== id)) }} />
              </main>
              <BottomNav activeTab={activeTab} onTabChange={onTabChange} username={currentUser?.username} friendsHasUnread={friendsHasUnread} />
            </>
          ) : (
            <HomeDashboard {...sharedProps} {...dashboardNavProps} friends={friends} recommendations={recommendations} onDismissRec={(id) => { const d = JSON.parse(localStorage.getItem('dismissed_recs') || '[]'); localStorage.setItem('dismissed_recs', JSON.stringify([...d, id])); setRecommendations((prev) => prev.filter((r) => r.id !== id)) }} />
          )
        } />

        <Route path="/dashboard/watchlist" element={
          isMobile ? (
            <>
              <header style={{
                background: 'radial-gradient(circle at 28% 18%, rgba(63, 118, 255, 0.08), transparent 18%), radial-gradient(circle at 72% 44%, rgba(146, 101, 39, 0.18), transparent 26%), radial-gradient(circle at 86% 20%, rgba(198, 154, 82, 0.09), transparent 17%), linear-gradient(rgb(12, 11, 16) 0%, rgb(9, 9, 13) 100%)',
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 100
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/branding/logo.png" alt="Watch Chums Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }} onClick={() => onTabChange('home')} />
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>TV recommended by friends</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '0 14px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '10px 14px', gap: '10px',
                    border: '1px solid #d1d1d1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#555" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search for any film or drama in seconds..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        color: '#111', fontSize: '15px', fontWeight: '500',
                        placeholderColor: '#666'
                      }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
                  </div>
                </div>
              </header>
              <main>
                <ListTab {...sharedProps} myList={myList} />
              </main>
              <BottomNav activeTab={activeTab} onTabChange={onTabChange} username={currentUser?.username} friendsHasUnread={friendsHasUnread} />
            </>
          ) : (
            <WatchlistDashboard {...sharedProps} {...dashboardNavProps} myList={myList} />
          )
        } />

        <Route path="/dashboard/discover" element={
          isMobile ? (
            <>
              <header style={{
                background: 'radial-gradient(circle at 28% 18%, rgba(63, 118, 255, 0.08), transparent 18%), radial-gradient(circle at 72% 44%, rgba(146, 101, 39, 0.18), transparent 26%), radial-gradient(circle at 86% 20%, rgba(198, 154, 82, 0.09), transparent 17%), linear-gradient(rgb(12, 11, 16) 0%, rgb(9, 9, 13) 100%)',
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 100
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/branding/logo.png" alt="Watch Chums Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }} onClick={() => onTabChange('home')} />
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>TV recommended by friends</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '0 14px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '10px 14px', gap: '10px',
                    border: '1px solid #d1d1d1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#555" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search for any film or drama in seconds..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        color: '#111', fontSize: '15px', fontWeight: '500',
                        placeholderColor: '#666'
                      }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
                  </div>
                </div>
              </header>
              <main>
                <DiscoverTab {...sharedProps} providers={providers} />
              </main>
              <BottomNav activeTab={activeTab} onTabChange={onTabChange} username={currentUser?.username} friendsHasUnread={friendsHasUnread} />
            </>
          ) : (
            <DiscoverDashboard {...sharedProps} {...dashboardNavProps} providers={providers} />
          )
        } />

        <Route path="/dashboard/friends" element={
          isMobile ? (
            <>
              <header style={{
                background: 'radial-gradient(circle at 28% 18%, rgba(63, 118, 255, 0.08), transparent 18%), radial-gradient(circle at 72% 44%, rgba(146, 101, 39, 0.18), transparent 26%), radial-gradient(circle at 86% 20%, rgba(198, 154, 82, 0.09), transparent 17%), linear-gradient(rgb(12, 11, 16) 0%, rgb(9, 9, 13) 100%)',
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 100
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/branding/logo.png" alt="Watch Chums Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }} onClick={() => onTabChange('home')} />
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>TV recommended by friends</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '0 14px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '10px 14px', gap: '10px',
                    border: '1px solid #d1d1d1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#555" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search for any film or drama in seconds..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        color: '#111', fontSize: '15px', fontWeight: '500',
                        placeholderColor: '#666'
                      }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
                  </div>
                </div>
              </header>
              <main>
                <FriendsTab {...sharedProps} friends={friends} friendRequests={friendRequests} onFriendsUpdated={() => {
                    getFriends().then(setFriends).catch(() => {})
                    getFriendRequests().then(reqs => setFriendRequests(reqs || [])).catch(() => {})
                  }} />
              </main>
              <BottomNav activeTab={activeTab} onTabChange={onTabChange} username={currentUser?.username} friendsHasUnread={friendsHasUnread} />
            </>
          ) : (
            <FriendsDashboard {...sharedProps} {...dashboardNavProps} friends={friends} friendRequests={friendRequests} />
          )
        } />

        <Route path="/dashboard/profile" element={
          isMobile ? (
            <>
              <header style={{
                background: 'radial-gradient(circle at 28% 18%, rgba(63, 118, 255, 0.08), transparent 18%), radial-gradient(circle at 72% 44%, rgba(146, 101, 39, 0.18), transparent 26%), radial-gradient(circle at 86% 20%, rgba(198, 154, 82, 0.09), transparent 17%), linear-gradient(rgb(12, 11, 16) 0%, rgb(9, 9, 13) 100%)',
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 100
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/branding/logo.png" alt="Watch Chums Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }} onClick={() => onTabChange('home')} />
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>Your profile & activity</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '0 14px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '10px 14px', gap: '10px',
                    border: '1px solid #d1d1d1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)'
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#555" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search for any film or drama in seconds..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        flex: 1, background: 'none', border: 'none', outline: 'none',
                        color: '#111', fontSize: '15px', fontWeight: '500',
                        placeholderColor: '#666'
                      }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
                  </div>
                </div>
              </header>
              <main>
                <ProfileTab currentUser={currentUser} myList={myList} watchedIds={watchedIds} friends={friends} onLogout={onLogout} onToast={showToast} />
              </main>
              <BottomNav activeTab={activeTab} onTabChange={onTabChange} username={currentUser?.username} friendsHasUnread={friendsHasUnread} />
            </>
          ) : (
            <ProfileDashboard {...dashboardNavProps} currentUser={currentUser} myList={myList} watchedIds={watchedIds} friends={friends} onLogout={onLogout} onToast={showToast} />
          )
        } />

        <Route path="/invite" element={
          !currentUser ? (
            <>
              <LandingPage
                onLogin={onLogin}
                onToast={showToast}
                allFilms={allFilms}
              />
            </>
          ) : (
            <Navigate to="/dashboard/home" replace />
          )
        } />

        <Route path="/share" element={
          !currentUser ? (
            <LandingPage
              onLogin={onLogin}
              onToast={showToast}
              allFilms={allFilms}
            />
          ) : (
            <Navigate to="/dashboard/home" replace />
          )
        } />

        {/* Default redirect */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/home" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Overlays */}
      {showAuth && (
        <AuthModal
          mode={authMode}
          onLogin={onLogin}
          onClose={() => setShowAuth(false)}
          shareInvite={shareInvite}
        />
      )}

      {selectedFilm && (
        <FilmDetailPage
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          isAdded={addedIds.includes(selectedFilm.id) || allFilms.some(f => (f.id === selectedFilm.id || f.tmdb_id === selectedFilm.id) && addedIds.includes(f.id))}
          isWatched={watchedIds.includes(selectedFilm.id)}
          onAddToList={handleAddToList}
          onRemoveFromList={handleRemoveFromList}
          onMarkWatched={handleMarkWatched}
          onUnmarkWatched={handleUnmarkWatched}
          onWatchTrailer={(url) => setTrailerUrl(url)}
          onRecommend={(film) => setRecommendFilm(film)}
          onSaveRating={handleSaveRating}
          currentUser={currentUser}
          userRatings={userRatings}
        />
      )}

      {recommendFilm && (
        <RecommendModal
          film={recommendFilm}
          currentUser={currentUser}
          friends={friends}
          onClose={() => setRecommendFilm(null)}
          onToast={showToast}
        />
      )}

      {seenItFilm && (
        <div onClick={() => setSeenItFilm(null)} style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#13131c', borderRadius: '24px 24px 0 0',
            padding: '12px 24px 48px', width: '100%', maxWidth: 480,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
            animation: 'seenItIn 0.25s cubic-bezier(0.32,0.72,0,1)'
          }}>
            <style>{`@keyframes seenItIn { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', margin: '0 auto 20px' }} />
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>You watched</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{seenItFilm.title}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>What did you think?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {[1,2,3,4,5].map(star => {
                const active = star <= (seenItHover || seenItRating / 2)
                return (
                  <button key={star}
                    onMouseEnter={() => setSeenItHover(star)}
                    onMouseLeave={() => setSeenItHover(0)}
                    onClick={() => setSeenItRating(star * 2)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}
                  >
                    <svg viewBox="0 0 24 24" width="40" height="40" style={{ filter: active ? 'drop-shadow(rgba(232,201,106,0.6) 0px 0px 8px)' : 'none', transition: 'filter 0.15s, transform 0.1s', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill={active ? '#E8C96A' : 'rgba(255,255,255,0.08)'}
                        stroke={active ? '#C9A84C' : 'rgba(255,255,255,0.15)'}
                        strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </button>
                )
              })}
            </div>
            {seenItRating === 0 ? (
              <div style={{ textAlign: 'center' }}>
                <button onClick={async () => { await handleMarkWatched(seenItFilm); setSeenItFilm(null); }}
                  style={{ background: 'none', border: 'none', color: '#5a566a', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                  Skip rating
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={async () => {
                  const id = await handleMarkWatched(seenItFilm)
                  handleSaveRating(id || seenItFilm.id, seenItRating)
                  setRecommendFilm(seenItFilm)
                  setSeenItFilm(null); setSeenItRating(0)
                }} style={{ flex: 1, padding: '13px 0', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '12px', color: '#E8C96A', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  Recommend
                </button>
                <button onClick={async () => {
                  const id = await handleMarkWatched(seenItFilm)
                  handleSaveRating(id || seenItFilm.id, seenItRating)
                  setSeenItFilm(null); setSeenItRating(0)
                }} style={{ flex: 1, padding: '13px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  Just log it
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <TrailerModal url={trailerUrl} onClose={() => setTrailerUrl('')} />
      <Toast message={toast} onDone={() => setToast('')} />
    </>
  )
}
