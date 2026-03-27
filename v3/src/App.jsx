import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { getToken, setToken, clearToken } from './api/client'
import { getMe } from './api/auth'
import { getFilms, getFilm, getFilmBySlug, getProviders, searchTmdb, addFilm, logTab, getTrending, getUpcomingTv } from './api/films'
import { getFriends, getFriendRequests } from './api/friends'
import { getWatchlist, getRecommendations, addToWatchlist, removeFromWatchlist, markWatched, unmarkWatched } from './api/watchlist'
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

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()

  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState(() => getToken())
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
    if (invite) setShareInvite(invite)

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
    if (!token) return
    getMe()
      .then((user) => { setCurrentUser(user); setAuthToken(token) })
      .catch(() => { clearToken(); setAuthToken(null) })
  }, [])

  // --- Fetch user data when logged in ---
  useEffect(() => {
    if (!authToken) return
    getWatchlist().then((list) => {
      setMyList(list)
      setAddedIds(list.map((f) => f.id))
      setWatchedIds(list.filter((f) => f.watched).map((f) => f.id))
    }).catch(() => { })
    getFriends().then(setFriends).catch(() => { })
    getFriendRequests().then((reqs) => {
      setFriendRequests(reqs || [])
      if ((reqs || []).length > 0) setFriendsHasUnread(true)
    }).catch(() => { })
    getRecommendations().then(setRecommendations).catch(() => { })
  }, [authToken])

  // --- Poll for friend requests every 30s ---
  useEffect(() => {
    if (!authToken) return
    const poll = () => {
      getFriendRequests().then((reqs) => {
        setFriendRequests(reqs || [])
        if ((reqs || []).length > 0) setFriendsHasUnread(true)
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
        setSearchResults(results || [])
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
    const id = film.id
    if (addedIds.includes(id)) {
      showToast('"' + film.title + '" is already in your list')
      return
    }
    setAddedIds((prev) => [...prev, id])
    setMyList((prev) => prev.find((f) => f.id === id) ? prev : [...prev, film])
    showToast('"' + film.title + '" added to list')
    try {
      if (film._fromTmdb && !allFilms.find((f) => f.id === id)) {
        const saved = await addFilm({ title: film.title, year: film.year ? parseInt(film.year) : null, tmdbId: film.tmdb_id, autoEnrich: true })
        setAllFilms((prev) => [...prev, saved])
        setAddedIds((prev) => prev.filter((x) => x !== id).concat(saved.id))
        setMyList((prev) => prev.map((f) => f.id === id ? saved : f))
        await addToWatchlist(saved.id)
        return
      }
      await addToWatchlist(id)
    } catch (_) {
      setAddedIds((prev) => prev.filter((x) => x !== id))
      setMyList((prev) => prev.filter((f) => f.id !== id))
      showToast('Could not add to list')
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
    const id = film.id
    setWatchedIds((prev) => prev.includes(id) ? prev : [...prev, id])
    if (!addedIds.includes(id)) handleAddToList(film)
    showToast('Logged as watched!')
    try { await markWatched(id) } catch (_) { }
  }

  async function handleUnmarkWatched(film) {
    const id = film.id
    setWatchedIds((prev) => prev.filter((x) => x !== id))
    try { await unmarkWatched(id) } catch (_) { }
  }

  function showToast(msg) { setToast(msg) }

  function openFilm(film) {
    const normalized = normalizeFilm(film)
    setSelectedFilm(normalized)
    if (film.id > 0 && !film._isExternal) {
      getFilm(film.id).then((full) => {
        if (full) setSelectedFilm((prev) => prev?.id === film.id ? { ...prev, ...full } : prev)
      }).catch(() => { })
    }
  }

  const localFiltered = search.trim()
    ? allFilms.filter((f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.genre || '').toLowerCase().includes(search.toLowerCase())
    )
    : []

  const combinedSearch = [
    ...localFiltered,
    ...searchResults.filter((r) => !localFiltered.find((f) => f.title.toLowerCase() === (r.title || '').toLowerCase())),
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
    trendingAll,
    upcomingTv,
  }

  const dashboardNavProps = {
    searchQuery: search,
    onSearchChange: setSearch,
    activeTab,
    onTabChange,
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
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 28 24" width="35" height="29" fill="none" style={{ flexShrink: 0, marginBottom: '1px' }}>
                        <path d="M13.9 19.2a2.25 2.25 0 1 1 0 4.5a2.25 2.25 0 0 1 0-4.5z" fill="#4a9eff"></path>
                        <path d="M8.7 14.1a7.6 7.6 0 0 1 10.4 0" stroke="#4a9eff" strokeWidth="2.4" strokeLinecap="round" fill="none"></path>
                        <path d="M4.6 9.1a13.1 13.1 0 0 1 18.7 0" stroke="#4a9eff" strokeWidth="2.55" strokeLinecap="round" strokeOpacity="0.8" fill="none"></path>
                        <path d="M1.6 4.5a17.8 17.8 0 0 1 24.8 0" stroke="#4a9eff" strokeWidth="2.7" strokeLinecap="round" strokeOpacity="0.5" fill="none"></path>
                      </svg>
                      <div style={{ fontFamily: 'var(--ff-body)', fontSize: '31px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-1.2px', lineHeight: 1 }}>Reel</div>
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>TV recommended by friends</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '1px 14px 10px', background: 'linear-gradient(rgba(8, 8, 12, 0.98), rgba(8, 8, 12, 0.78))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '13px', padding: '8px 12px', gap: '8px', border: '1px solid rgba(255, 255, 255, 0.11)', boxShadow: 'rgba(0, 0, 0, 0.14) 0px 4px 10px, rgba(255, 255, 255, 0.02) 0px 1px 0px inset' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" style={{ flexShrink: 0, color: 'rgba(255, 255, 255, 0.42)' }}>
                      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search films, TV, directors…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ flex: '1 1 0%', background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '9.75px', fontFamily: 'var(--ff-body)' }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
                  </div>
                </div>
              </header>
              <main style={{ paddingBottom: 80 }}>
                <HomeTab {...sharedProps} onTabChange={onTabChange} recommendations={recommendations} onRecommend={(film) => setRecommendFilm(film)} onDismissRec={(id) => { const d = JSON.parse(localStorage.getItem('dismissed_recs') || '[]'); localStorage.setItem('dismissed_recs', JSON.stringify([...d, id])); setRecommendations((prev) => prev.filter((r) => r.id !== id)) }} />
              </main>
              <BottomNav activeTab={activeTab} onTabChange={onTabChange} username={currentUser?.username} friendsHasUnread={friendsHasUnread} />
            </>
          ) : (
            <HomeDashboard {...sharedProps} {...dashboardNavProps} recommendations={recommendations} />
          )
        } />

        <Route path="/dashboard/watchlist" element={
          isMobile ? (
            <>
              <header style={{
                background: 'radial-gradient(circle at 28% 18%, rgba(63, 118, 255, 0.08), transparent 18%), radial-gradient(circle at 72% 44%, rgba(146, 101, 39, 0.18), transparent 26%), radial-gradient(circle at 86% 20%, rgba(198, 154, 82, 0.09), transparent 17%), linear-gradient(rgb(12, 11, 16) 0%, rgb(9, 9, 13) 100%)',
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 28 24" width="35" height="29" fill="none" style={{ flexShrink: 0, marginBottom: '1px' }}>
                        <path d="M13.9 19.2a2.25 2.25 0 1 1 0 4.5a2.25 2.25 0 0 1 0-4.5z" fill="#4a9eff"></path>
                        <path d="M8.7 14.1a7.6 7.6 0 0 1 10.4 0" stroke="#4a9eff" strokeWidth="2.4" strokeLinecap="round" fill="none"></path>
                        <path d="M4.6 9.1a13.1 13.1 0 0 1 18.7 0" stroke="#4a9eff" strokeWidth="2.55" strokeLinecap="round" strokeOpacity="0.8" fill="none"></path>
                        <path d="M1.6 4.5a17.8 17.8 0 0 1 24.8 0" stroke="#4a9eff" strokeWidth="2.7" strokeLinecap="round" strokeOpacity="0.5" fill="none"></path>
                      </svg>
                      <div style={{ fontFamily: 'var(--ff-body)', fontSize: '31px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-1.2px', lineHeight: 1 }}>Reel</div>
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>TV recommended by friends</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '1px 14px 10px', background: 'linear-gradient(rgba(8, 8, 12, 0.98), rgba(8, 8, 12, 0.78))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '13px', padding: '8px 12px', gap: '8px', border: '1px solid rgba(255, 255, 255, 0.11)', boxShadow: 'rgba(0, 0, 0, 0.14) 0px 4px 10px, rgba(255, 255, 255, 0.02) 0px 1px 0px inset' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" style={{ flexShrink: 0, color: 'rgba(255, 255, 255, 0.42)' }}>
                      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search films, TV, directors…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ flex: '1 1 0%', background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '9.75px', fontFamily: 'var(--ff-body)' }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
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
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 28 24" width="35" height="29" fill="none" style={{ flexShrink: 0, marginBottom: '1px' }}>
                        <path d="M13.9 19.2a2.25 2.25 0 1 1 0 4.5a2.25 2.25 0 0 1 0-4.5z" fill="#4a9eff"></path>
                        <path d="M8.7 14.1a7.6 7.6 0 0 1 10.4 0" stroke="#4a9eff" strokeWidth="2.4" strokeLinecap="round" fill="none"></path>
                        <path d="M4.6 9.1a13.1 13.1 0 0 1 18.7 0" stroke="#4a9eff" strokeWidth="2.55" strokeLinecap="round" strokeOpacity="0.8" fill="none"></path>
                        <path d="M1.6 4.5a17.8 17.8 0 0 1 24.8 0" stroke="#4a9eff" strokeWidth="2.7" strokeLinecap="round" strokeOpacity="0.5" fill="none"></path>
                      </svg>
                      <div style={{ fontFamily: 'var(--ff-body)', fontSize: '31px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-1.2px', lineHeight: 1 }}>Reel</div>
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>TV recommended by friends</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '1px 14px 10px', background: 'linear-gradient(rgba(8, 8, 12, 0.98), rgba(8, 8, 12, 0.78))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '13px', padding: '8px 12px', gap: '8px', border: '1px solid rgba(255, 255, 255, 0.11)', boxShadow: 'rgba(0, 0, 0, 0.14) 0px 4px 10px, rgba(255, 255, 255, 0.02) 0px 1px 0px inset' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" style={{ flexShrink: 0, color: 'rgba(255, 255, 255, 0.42)' }}>
                      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search films, TV, directors…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ flex: '1 1 0%', background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '9.75px', fontFamily: 'var(--ff-body)' }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
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
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 28 24" width="35" height="29" fill="none" style={{ flexShrink: 0, marginBottom: '1px' }}>
                        <path d="M13.9 19.2a2.25 2.25 0 1 1 0 4.5a2.25 2.25 0 0 1 0-4.5z" fill="#4a9eff"></path>
                        <path d="M8.7 14.1a7.6 7.6 0 0 1 10.4 0" stroke="#4a9eff" strokeWidth="2.4" strokeLinecap="round" fill="none"></path>
                        <path d="M4.6 9.1a13.1 13.1 0 0 1 18.7 0" stroke="#4a9eff" strokeWidth="2.55" strokeLinecap="round" strokeOpacity="0.8" fill="none"></path>
                        <path d="M1.6 4.5a17.8 17.8 0 0 1 24.8 0" stroke="#4a9eff" strokeWidth="2.7" strokeLinecap="round" strokeOpacity="0.5" fill="none"></path>
                      </svg>
                      <div style={{ fontFamily: 'var(--ff-body)', fontSize: '31px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-1.2px', lineHeight: 1 }}>Reel</div>
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>TV recommended by friends</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '1px 14px 10px', background: 'linear-gradient(rgba(8, 8, 12, 0.98), rgba(8, 8, 12, 0.78))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '13px', padding: '8px 12px', gap: '8px', border: '1px solid rgba(255, 255, 255, 0.11)', boxShadow: 'rgba(0, 0, 0, 0.14) 0px 4px 10px, rgba(255, 255, 255, 0.02) 0px 1px 0px inset' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" style={{ flexShrink: 0, color: 'rgba(255, 255, 255, 0.42)' }}>
                      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search films, TV, directors…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ flex: '1 1 0%', background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '9.75px', fontFamily: 'var(--ff-body)' }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
                  </div>
                </div>
              </header>
              <main>
                <FriendsTab {...sharedProps} friends={friends} friendRequests={friendRequests} onFriendsUpdated={() => getFriends().then(setFriends).catch(() => { })} />
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
                flexShrink: 0, position: 'sticky', top: 0, zIndex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px 4px', boxShadow: 'rgba(255, 255, 255, 0.02) 0px -1px 0px inset' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg viewBox="0 0 28 24" width="35" height="29" fill="none" style={{ flexShrink: 0, marginBottom: '1px' }}>
                        <path d="M13.9 19.2a2.25 2.25 0 1 1 0 4.5a2.25 2.25 0 0 1 0-4.5z" fill="#4a9eff"></path>
                        <path d="M8.7 14.1a7.6 7.6 0 0 1 10.4 0" stroke="#4a9eff" strokeWidth="2.4" strokeLinecap="round" fill="none"></path>
                        <path d="M4.6 9.1a13.1 13.1 0 0 1 18.7 0" stroke="#4a9eff" strokeWidth="2.55" strokeLinecap="round" strokeOpacity="0.8" fill="none"></path>
                        <path d="M1.6 4.5a17.8 17.8 0 0 1 24.8 0" stroke="#4a9eff" strokeWidth="2.7" strokeLinecap="round" strokeOpacity="0.5" fill="none"></path>
                      </svg>
                      <div style={{ fontFamily: 'var(--ff-body)', fontSize: '31px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-1.2px', lineHeight: 1 }}>Reel</div>
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>Your profile & activity</div>
                  </div>
                  <div style={{ width: '138px', height: '64px', overflow: 'hidden', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <img src="/branding/popcorn.png" alt="" style={{ height: '78px', width: 'auto', marginTop: '0px', marginRight: '-10px', filter: 'drop-shadow(rgba(0, 0, 0, 0.36) 0px 3px 10px)', userSelect: 'none', flexShrink: 0 }} />
                  </div>
                </div>
                <div style={{ padding: '1px 14px 10px', background: 'linear-gradient(rgba(8, 8, 12, 0.98), rgba(8, 8, 12, 0.78))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '13px', padding: '8px 12px', gap: '8px', border: '1px solid rgba(255, 255, 255, 0.11)', boxShadow: 'rgba(0, 0, 0, 0.14) 0px 4px 10px, rgba(255, 255, 255, 0.02) 0px 1px 0px inset' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" style={{ flexShrink: 0, color: 'rgba(255, 255, 255, 0.42)' }}>
                      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"></circle>
                      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search films, TV, directors…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ flex: '1 1 0%', background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '9.75px', fontFamily: 'var(--ff-body)' }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', padding: '0 0 0 8px' }}>✕</button>}
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
          isAdded={addedIds.includes(selectedFilm.id)}
          isWatched={watchedIds.includes(selectedFilm.id)}
          onAddToList={handleAddToList}
          onRemoveFromList={handleRemoveFromList}
          onMarkWatched={handleMarkWatched}
          onUnmarkWatched={handleUnmarkWatched}
          onWatchTrailer={(url) => setTrailerUrl(url)}
          onRecommend={(film) => setRecommendFilm(film)}
          currentUser={currentUser}
        />
      )}

      {recommendFilm && (
        <RecommendModal
          film={recommendFilm}
          currentUser={currentUser}
          onClose={() => setRecommendFilm(null)}
          onToast={showToast}
        />
      )}

      <TrailerModal url={trailerUrl} onClose={() => setTrailerUrl('')} />
      <Toast message={toast} onDone={() => setToast('')} />
    </>
  )
}
