import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { getToken, setToken, clearToken } from './api/client'
import { getMe } from './api/auth'
import { getFilms, getFilm, getFilmBySlug, getProviders, searchTmdb, addFilm, logTab } from './api/films'
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
import WatchlistDashboard from './screens/WatchlistDashboard'
import HomeDashboard from './screens/HomeDashboard'
import DiscoverDashboard from './screens/DiscoverDashboard'
import FriendsDashboard from './screens/FriendsDashboard'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authToken, setAuthToken] = useState(() => getToken())
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [shareInvite, setShareInvite] = useState(null)

  const [allFilms, setAllFilms] = useState([])
  const [providers, setProviders] = useState([])
  const [myList, setMyList] = useState([])
  // addedIds / watchedIds are plain arrays (matching original)
  const [addedIds, setAddedIds] = useState([])
  const [watchedIds, setWatchedIds] = useState([])
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [friendsHasUnread, setFriendsHasUnread] = useState(false)
  const [recommendations, setRecommendations] = useState([])

  const [selectedFilm, setSelectedFilm] = useState(null)
  const [recommendFilm, setRecommendFilm] = useState(null)
  const [trailerUrl, setTrailerUrl] = useState('')
  const [toast, setToast] = useState('')
  const [userRatings, setUserRatings] = useState({})

  // Search
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimer = useRef(null)

  // --- Startup ---
  useEffect(() => {
    getFilms().then(setAllFilms).catch(() => { })
    getProviders().then(setProviders).catch(() => { })

    const invite = readInviteFromUrl()
    if (invite) setShareInvite(invite)

    const params = new URLSearchParams(window.location.search)
    if (params.get('register') === '1') {
      setAuthMode('register')
      setShowAuth(true)
      window.history.replaceState({}, '', '/')
    }
    // ?open=SLUG from share link for existing users
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

  // Log tab change lifecycle or route changes could be added here if needed

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
  }, [])

  const onLogout = useCallback(() => {
    clearToken()
    setCurrentUser(null)
    setAuthToken(null)
    setMyList([])
    setAddedIds([])
    setWatchedIds([])
    setFriends([])
    setRecommendations([])
  }, [])

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
      // If it's a TMDB result, create in DB first
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
    // Also add to list if not already there
    if (!addedIds.includes(id)) handleAddToList(film)
    showToast('Logged as watched!')
    try { await markWatched(id) } catch (_) { }
    // Prompt for rating
    setUserRatings((prev) => prev[id] ? prev : prev) // placeholder — rating prompt can be added later
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
    // Enrich: fetch full DB record to get trailer, stills etc.
    if (film.id > 0 && !film._isExternal) {
      getFilm(film.id).then((full) => {
        if (full) setSelectedFilm((prev) => prev?.id === film.id ? { ...prev, ...full } : prev)
      }).catch(() => { })
    }
  }

  // --- Search results handling ---
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
  }

  // --- If not logged in ---
  return (
    <>
      {/* Search Overlay injected globally if actively searching */}
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
        <Route path="/" element={
          !currentUser ? (
            <LandingPage
              onShowLogin={() => { setAuthMode('login'); setShowAuth(true) }}
              onShowRegister={() => { setAuthMode('register'); setShowAuth(true) }}
            />
          ) : (
            <Navigate to="/dashboard/home" replace />
          )
        } />

        <Route path="/dashboard/home" element={<HomeDashboard searchQuery={search} onSearchChange={setSearch} />} />
        <Route path="/dashboard/watchlist" element={<WatchlistDashboard searchQuery={search} onSearchChange={setSearch} />} />
        <Route path="/dashboard/discover" element={<DiscoverDashboard searchQuery={search} onSearchChange={setSearch} />} />
        <Route path="/dashboard/friends" element={<FriendsDashboard searchQuery={search} onSearchChange={setSearch} />} />

        <Route path="/dashboard" element={<Navigate to="/dashboard/home" replace />} />

        <Route path="*" element={<Navigate to="/" />} />
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
