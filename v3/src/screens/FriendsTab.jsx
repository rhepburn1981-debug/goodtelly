import { useState } from 'react'
import { sendFriendRequest, acceptFriendRequest, getFriendFilms, findUsers, logFriendView } from '../api/friends'
import PosterCard from '../components/PosterCard'
import { FaWhatsapp, FaShareAlt, FaPlus, FaSearch } from 'react-icons/fa'

export default function FriendsTab({
  friends,
  friendRequests,
  onOpenFilm,
  onToast,
  onFriendsUpdated,
  addedIds,
  onAddToList,
}) {
  const [activeFriend, setActiveFriend] = useState(null)
  const [friendFilms, setFriendFilms] = useState([])
  const [loadingFilms, setLoadingFilms] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [genreFilter, setGenreFilter] = useState('All')
  const [watchFilter, setWatchFilter] = useState('all')

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
      if (watchFilter === 'unwatched') return !addedIds?.includes(f.id)
      if (watchFilter === 'watched') return addedIds?.includes(f.id)
      return true
    })

  return (
    <div style={{ padding: '0 16px', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, paddingTop: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Friends</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Compare watchlists & find common ground</p>
      </div>

      {/* Pending requests */}
      {friendRequests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-bright)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold-bright)' }} />
            Friend requests
          </div>
          {friendRequests.map((req) => (
            <div key={req.username} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              background: 'var(--surface2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{req.avatar}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{req.display_name || req.username}</span>
              </div>
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

      {/* Friends list (Horizontal Pill Navigation) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 12 }}>Your Crew</div>
        {friends.length === 0 ? (
          <div style={{
            background: 'var(--surface2)',
            border: '1px dashed var(--border2)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--muted)',
            fontSize: 13
          }}>
            No friends yet — invite them below!
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
            {friends.map((f) => {
              const active = activeFriend?.username === f.username
              return (
                <button
                  key={f.username}
                  onClick={() => selectFriend(f)}
                  style={{
                    flexShrink: 0,
                    background: active ? 'var(--gold-glow)' : 'var(--surface2)',
                    border: '1px solid ' + (active ? 'var(--gold)' : 'var(--border)'),
                    borderRadius: 20,
                    color: active ? 'var(--gold-bright)' : 'var(--text)',
                    padding: '8px 16px',
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'var(--ff-body)',
                    fontWeight: active ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span style={{ fontSize: 16 }}>{f.avatar}</span>
                  {f.display_name || f.username}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* NEW: Connections / Invite Section */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '20px',
        marginBottom: 28,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Invite Friends to Join Reel</div>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.4 }}>
          Send them a link — friends<br />appear here when they join
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{
            background: 'rgba(37,211,102,0.1)',
            border: '1px solid #25D366',
            borderRadius: 12,
            padding: '12px',
            color: '#25D366',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: 'var(--ff-body)',
          }}>
            <FaWhatsapp size={18} /> Invite via WhatsApp
          </button>
          <button style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: 12,
            padding: '12px',
            color: 'var(--text)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: 'var(--ff-body)',
          }}>
            <FaShareAlt size={16} /> Share Invite Link
          </button>
        </div>
      </div>

      {/* Add friend search */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 12 }}>Find Connections</div>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            placeholder="Search by username..."
            style={{
              width: '100%',
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text)',
              padding: '12px 14px',
              paddingLeft: 40,
              fontSize: 15,
              fontFamily: 'var(--ff-body)',
              boxSizing: 'border-box'
            }}
          />
          <FaSearch style={{ position: 'absolute', left: 14, top: 16, color: 'var(--muted)', fontSize: 14 }} />
          <button
            onClick={searchUsers}
            disabled={searching}
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              bottom: 8,
              background: 'var(--surface3)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              padding: '0 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--ff-body)',
            }}
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {searchResults.map((u) => (
              <div key={u.username} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                background: 'var(--surface2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{u.avatar}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{u.display_name || u.username}</span>
                </div>
                <button
                  onClick={() => addFriend(u.username)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--gold)',
                    borderRadius: 20,
                    color: 'var(--gold-bright)',
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--ff-body)',
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Friend Content */}
      {activeFriend && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-bright)' }}>
              {activeFriend.display_name || activeFriend.username}&rsquo;s Library
            </div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 6 }}>
              {genres.length > 2 && (
                <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} style={selectStyle()}>
                  {genres.map((g) => <option key={g}>{g}</option>)}
                </select>
              )}
              <select value={watchFilter} onChange={(e) => setWatchFilter(e.target.value)} style={selectStyle()}>
                <option value="all">All</option>
                <option value="unwatched">Missing</option>
                <option value="watched">In List</option>
              </select>
            </div>
          </div>

          {loadingFilms ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, background: 'var(--surface2)', borderRadius: 12 }}>
              Loading...
            </div>
          ) : (
            <>
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
                    subtext={addedIds?.includes(film.id) ? '✓ In my list' : undefined}
                  />
                ))}
              </div>

              {displayFilms.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0', fontSize: 13, background: 'var(--surface2)', borderRadius: 12 }}>
                  Nothing matches your filters.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Global Style for scrollbars */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}

function selectStyle() {
  return {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    padding: '4px 8px',
    fontSize: 12,
    fontFamily: 'var(--ff-body)',
  }
}
