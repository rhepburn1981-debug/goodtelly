import { useState } from 'react'
import { sendFriendRequest, acceptFriendRequest, getFriendFilms, findUsers, logFriendView } from '../api/friends'
import PosterCard from '../components/PosterCard'

export default function FriendsTab({
  friends,
  friendRequests,
  onOpenFilm,
  onToast,
  onFriendsUpdated,
  addedIds,
  onAddToList,
}) {
  const [activeFriend, setActiveFriend]   = useState(null)
  const [friendFilms, setFriendFilms]     = useState([])
  const [loadingFilms, setLoadingFilms]   = useState(false)
  const [userSearch, setUserSearch]       = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching]         = useState(false)
  const [genreFilter, setGenreFilter]     = useState('All')
  const [watchFilter, setWatchFilter]     = useState('all')

  async function selectFriend(friend) {
    setActiveFriend(friend)
    setLoadingFilms(true)
    try {
      logFriendView(friend.username)
      const films = await getFriendFilms(friend.username)
      setFriendFilms(films)
    } catch (_) {
      setFriendFilms([])
    } finally {
      setLoadingFilms(false)
    }
  }

  async function searchUsers() {
    if (!userSearch.trim()) return
    setSearching(true)
    try {
      const results = await findUsers(userSearch.trim())
      setSearchResults(results)
    } catch (_) {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  async function addFriend(username) {
    try {
      await sendFriendRequest(username)
      onToast('Friend request sent!')
      setSearchResults([])
      setUserSearch('')
    } catch (err) {
      onToast('Could not send request')
    }
  }

  async function accept(username) {
    try {
      await acceptFriendRequest(username)
      onToast('Friend added!')
      onFriendsUpdated()
    } catch (_) {
      onToast('Error accepting request')
    }
  }

  const genres = ['All', ...new Set(friendFilms.flatMap((f) => f.genre ? [f.genre] : []))]
  const displayFilms = friendFilms
    .filter((f) => genreFilter === 'All' || f.genre === genreFilter)
    .filter((f) => {
      if (watchFilter === 'unwatched') return !addedIds.has(f.id)
      if (watchFilter === 'watched')   return addedIds.has(f.id)
      return true
    })

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Pending requests */}
      {friendRequests.length > 0 && (
        <div style={{ padding: '0 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-bright)', marginBottom: 10 }}>
            Friend requests
          </div>
          {friendRequests.map((req) => (
            <div key={req.username} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              background: 'var(--surface2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 14 }}>
                {req.avatar} {req.display_name || req.username}
              </span>
              <button
                onClick={() => accept(req.username)}
                style={{
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: 20,
                  color: '#000',
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--ff-body)',
                }}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add friend search */}
      <div style={{ padding: '0 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="Find friends by username..."
            style={{
              flex: 1,
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text)',
              padding: '10px 14px',
              fontSize: 15,
              fontFamily: 'var(--ff-body)',
            }}
          />
          <button
            onClick={searchUsers}
            disabled={searching}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text)',
              padding: '10px 16px',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--ff-body)',
            }}
          >
            Search
          </button>
        </div>
        {searchResults.map((u) => (
          <div key={u.username} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'var(--surface2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginTop: 8,
          }}>
            <span>{u.avatar} {u.display_name || u.username}</span>
            <button
              onClick={() => addFriend(u.username)}
              style={{
                background: 'transparent',
                border: '1px solid var(--gold)',
                borderRadius: 20,
                color: 'var(--gold-bright)',
                padding: '5px 12px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--ff-body)',
              }}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      {/* Friends list */}
      {friends.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0', fontSize: 14 }}>
          No friends yet — search above to connect with people.
        </div>
      ) : (
        <>
          <div style={{ padding: '0 16px', marginBottom: 12, display: 'flex', gap: 8, overflowX: 'auto' }}>
            {friends.map((f) => (
              <button
                key={f.username}
                onClick={() => selectFriend(f)}
                style={{
                  flexShrink: 0,
                  background: activeFriend?.username === f.username ? 'var(--gold-glow)' : 'var(--surface2)',
                  border: '1px solid ' + (activeFriend?.username === f.username ? 'var(--gold)' : 'var(--border)'),
                  borderRadius: 20,
                  color: activeFriend?.username === f.username ? 'var(--gold-bright)' : 'var(--text)',
                  padding: '7px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'var(--ff-body)',
                  fontWeight: 500,
                }}
              >
                {f.avatar} {f.display_name || f.username}
              </button>
            ))}
          </div>

          {activeFriend && (
            <div style={{ padding: '0 16px' }}>
              {/* Filters */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {genres.length > 2 && (
                  <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} style={selectStyle()}>
                    {genres.map((g) => <option key={g}>{g}</option>)}
                  </select>
                )}
                <select value={watchFilter} onChange={(e) => setWatchFilter(e.target.value)} style={selectStyle()}>
                  <option value="all">All</option>
                  <option value="unwatched">Not in my list</option>
                  <option value="watched">Already in my list</option>
                </select>
              </div>

              {loadingFilms ? (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>Loading...</div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: 16,
                }}>
                  {displayFilms.map((film) => (
                    <PosterCard
                      key={film.id}
                      film={film}
                      onClick={onOpenFilm}
                      subtext={addedIds.has(film.id) ? '✓ In my list' : undefined}
                    />
                  ))}
                </div>
              )}

              {!loadingFilms && displayFilms.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0', fontSize: 14 }}>
                  Nothing to show.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function selectStyle() {
  return {
    flex: 1,
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: 'var(--ff-body)',
  }
}
