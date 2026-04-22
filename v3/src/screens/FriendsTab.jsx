import { useState, useMemo } from 'react'
import { getFriendFilms, logFriendView } from '../api/friends'
import PosterCard from '../components/PosterCard'

export default function FriendsTab({
  friends,
  onOpenFilm,
  addedIds,
  currentUser
}) {
  const [activeFriend, setActiveFriend] = useState(null)
  const [friendFilms, setFriendFilms] = useState([])
  const [loadingFilms, setLoadingFilms] = useState(false)
  const [genreFilter, setGenreFilter] = useState('All')
  const [watchFilter, setWatchFilter] = useState('all')

  const selectFriend = async (friend) => {
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

  const genres = useMemo(() => ['All', ...new Set(friendFilms.flatMap((f) => f.genre ? [f.genre] : []))], [friendFilms])

  const toWatchCount = useMemo(() => friendFilms.filter(f => !addedIds?.includes(f.id)).length, [friendFilms, addedIds])
  const watchedCount = useMemo(() => friendFilms.filter(f => addedIds?.includes(f.id)).length, [friendFilms, addedIds])
  const allCount = friendFilms.length

  const displayFilms = useMemo(() => {
    return (friendFilms || [])
      .filter((f) => genreFilter === 'All' || f.genre === genreFilter)
      .filter((f) => {
        if (watchFilter === 'unwatched') return !addedIds?.includes(f.id)
        if (watchFilter === 'watched') return addedIds?.includes(f.id)
        return true
      })
  }, [friendFilms, genreFilter, watchFilter, addedIds])

  const inviteLink = `https://watchmates.app/invite?from=${currentUser?.username || 'user'}`

  return (
    <div style={{
      flex: '1 1 0%',
      overflow: 'hidden auto',
      position: 'relative',
      paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
      color: 'white',
      fontFamily: 'var(--ff-body)',
    }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pill-active { border: 1px solid var(--gold) !important; background: rgba(201, 168, 76, 0.12) !important; color: var(--gold-bright) !important; font-weight: 700 !important; }
        .tab-active { border: 1.5px solid var(--gold-bright) !important; background: rgba(241, 196, 15, 0.1) !important; color: var(--gold-bright) !important; }
      `}</style>

      <div className="no-scrollbar" style={{ height: '100%', overflowY: 'auto' }}>
        {/* Row 1: Friends Header / Invite row */}
        {/* Row 1: Friends Header / Avatar list */}
        <div style={{ padding: '14px 16px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Your Friends</div>
          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            {(friends || []).map(f => (
              <button key={f.username} onClick={() => selectFriend(f)} style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0
              }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%', background: activeFriend?.username === f.username ? '#e2b644' : 'rgba(255,255,255,0.05)',
                  border: activeFriend?.username === f.username ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                  boxShadow: activeFriend?.username === f.username ? '0 0 15px rgba(226, 182, 68, 0.4)' : 'none',
                  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>{f.avatar}</div>
                <div style={{ fontSize: '11px', fontWeight: activeFriend?.username === f.username ? '800' : '500', color: activeFriend?.username === f.username ? '#e2b644' : 'rgba(255,255,255,0.5)', width: '54px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.username}</div>
              </button>
            ))}
            {(!friends || friends.length === 0) && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', padding: '10px 0' }}>None yet</div>}
          </div>
        </div>

        {/* Row 1b: Full-Width Slim Invite Block */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
          <div style={{ marginBottom: '14px', paddingLeft: '2px' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '2px' }}>Invite Friends to Join WatchMates</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)', lineHeight: 1.4 }}>Send them a link — friends appear here when they join</div>
          </div>

          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Join me on WatchMates to find the best TV & films! " + inviteLink)}`, '_blank')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.25)',
              borderRadius: '12px', padding: '9px 16px', cursor: 'pointer', color: 'rgb(37, 211, 102)',
              fontSize: '12.5px', fontWeight: '700', transition: '0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.857L0 24l6.335-1.51A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.368l-.36-.214-3.733.89.923-3.638-.235-.374A9.818 9.818 0 1112 21.818z" />
            </svg>
            Invite via WhatsApp
          </button>
        </div>

        {/* Row 2: Empty Friends State (Only show if no friends) */}
        {(!friends || friends.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>👥</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>No friends yet</div>
            <div style={{ fontSize: '13px', lineHeight: '1.6' }}>Search for friends by username above to get started.</div>
          </div>
        )}

        {/* Row 3: Tab bar (Always visible) */}
        <div style={{ display: 'flex', gap: '8px', padding: '10px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button onClick={() => setWatchFilter('unwatched')} className={watchFilter === 'unwatched' || (!activeFriend && watchFilter === 'unwatched') ? 'tab-active' : ''} style={{
            flex: '1 1 0%', padding: '7px 4px', borderRadius: '10px', cursor: 'pointer', fontWeights: '700', fontSize: '11px',
            border: watchFilter === 'unwatched' ? '1.5px solid var(--gold-bright)' : '1.5px solid rgba(255, 255, 255, 0.1)',
            background: watchFilter === 'unwatched' ? 'rgba(241, 196, 15, 0.1)' : 'transparent',
            color: watchFilter === 'unwatched' ? 'var(--gold-bright)' : 'var(--muted)', transition: '0.2s'
          }}>
            To Watch
            <span style={{ display: 'block', fontSize: '14px', fontFamily: "var(--ff-display, 'Cormorant Garamond', serif)", marginTop: '1px' }}>{activeFriend ? toWatchCount : 0}</span>
          </button>
          <button onClick={() => setWatchFilter('watched')} className={watchFilter === 'watched' ? 'tab-active' : ''} style={{
            flex: '1 1 0%', padding: '7px 4px', borderRadius: '10px', cursor: 'pointer', fontWeights: '700', fontSize: '11px',
            border: watchFilter === 'watched' ? '1.5px solid var(--gold-bright)' : '1.5px solid rgba(255, 255, 255, 0.1)',
            background: watchFilter === 'watched' ? 'rgba(241, 196, 15, 0.1)' : 'transparent',
            color: watchFilter === 'watched' ? 'var(--gold-bright)' : 'var(--muted)', transition: '0.2s'
          }}>
            Watched
            <span style={{ display: 'block', fontSize: '14px', fontFamily: "var(--ff-display, 'Cormorant Garamond', serif)", marginTop: '1px' }}>{activeFriend ? watchedCount : 0}</span>
          </button>
          <button onClick={() => setWatchFilter('all')} className={watchFilter === 'all' ? 'tab-active' : ''} style={{
            flex: '1 1 0%', padding: '7px 4px', borderRadius: '10px', cursor: 'pointer', fontWeights: '700', fontSize: '11px',
            border: watchFilter === 'all' ? '1.5px solid var(--gold-bright)' : '1.5px solid rgba(255, 255, 255, 0.1)',
            background: watchFilter === 'all' ? 'rgba(241, 196, 15, 0.1)' : 'transparent',
            color: watchFilter === 'all' ? 'var(--gold-bright)' : 'var(--muted)', transition: '0.2s'
          }}>
            All
            <span style={{ display: 'block', fontSize: '14px', fontFamily: "var(--ff-display, 'Cormorant Garamond', serif)", marginTop: '1px' }}>{activeFriend ? allCount : 0}</span>
          </button>
        </div>

        {/* Row 4: Pill navigation (Always visible) */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            <button onClick={() => setGenreFilter('All')} className={genreFilter === 'All' ? 'pill-active' : ''} style={{
              flexShrink: 0, padding: '4px 10px', borderRadius: '20px',
              border: genreFilter === 'All' ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: genreFilter === 'All' ? 'rgba(201, 168, 76, 0.12)' : 'transparent',
              color: genreFilter === 'All' ? 'var(--gold-bright)' : 'var(--text2)',
              fontSize: '11px', cursor: 'pointer', fontWeight: '700'
            }}>All</button>
            {activeFriend && genres.filter(g => g !== 'All').map(g => (
              <button key={g} onClick={() => setGenreFilter(g)} className={genreFilter === g ? 'pill-active' : ''} style={{
                flexShrink: 0, padding: '4px 10px', borderRadius: '20px',
                border: genreFilter === g ? '1px solid var(--gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: genreFilter === g ? 'rgba(201, 168, 76, 0.12)' : 'transparent',
                color: genreFilter === g ? 'var(--gold-bright)' : 'var(--text2)',
                fontSize: '11px', cursor: 'pointer', fontWeight: '700'
              }}>{g}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', overflowX: 'auto' }} className="no-scrollbar">
            <button style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'transparent', color: 'var(--text2)', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>Recently Added</button>
            <button style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'transparent', color: 'var(--text2)', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>🎬 Friends’ Rating</button>
            <button style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'transparent', color: 'var(--text2)', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>A–Z</button>
          </div>
        </div>

        {/* Row 5: Content Area */}
        <div style={{ minHeight: '200px' }}>
          {activeFriend ? (
            loadingFilms ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px 24px', fontSize: 14 }}>Loading {activeFriend.username}'s films...</div>
            ) : displayFilms.length > 0 ? (
              <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
                {displayFilms.map(film => (
                  <PosterCard
                    key={film.id}
                    film={film}
                    onClick={onOpenFilm}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '13px' }}>No films found</div>
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '13px' }}>No films found</div>
            </div>
          )}
        </div>
        <div style={{ height: '20px' }}></div>
      </div>
    </div>
  )
}
