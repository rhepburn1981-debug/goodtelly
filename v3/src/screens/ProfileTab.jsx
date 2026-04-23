import { clearToken } from '../api/client'
import { updateMe } from '../api/auth'
import { useState } from 'react'

export default function ProfileTab({ currentUser, myList, watchedIds, friends, onLogout, onToast }) {
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '')
  const [saving, setSaving] = useState(false)

  const unwatchedItems = myList.filter((f) => !watchedIds?.includes(f.film_id || f.id))
  const watchedCount = myList.length - unwatchedItems.length

  async function saveProfile() {
    if (!displayName.trim()) return
    setSaving(true)
    try {
      await updateMe({ display_name: displayName })
      onToast('Profile updated!')
      setEditing(false)
    } catch (_) {
      onToast('Could not save')
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    clearToken()
    onLogout()
  }

  // Get initials for avatar (e.g., Bhavinsen -> BH)
  const getInitials = (name) => {
    if (!name) return '??'
    const words = name.trim().split(/\s+/)
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

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
      `}</style>

      <div className="no-scrollbar" style={{ height: '100%', overflowY: 'auto' }}>
        {/* Profile Header section */}
        <div style={{ padding: '28px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', background: 'rgb(58, 58, 92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', color: 'rgb(255, 255, 255)',
            marginBottom: '12px', boxShadow: 'rgba(0, 0, 0, 0.4) 0px 4px 20px'
          }}>
            {currentUser?.avatar || getInitials(currentUser?.display_name || currentUser?.username)}
          </div>

          {editing ? (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: '8px' }}>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: 'white', padding: '6px 12px', fontSize: '15px', outline: 'none', width: '160px'
                }}
              />
              <button onClick={saveProfile} disabled={saving} style={{
                background: 'var(--gold)', border: 'none', borderRadius: '12px', color: 'black', padding: '6px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
              }}>{saving ? '...' : 'Save'}</button>
            </div>
          ) : (
            <>
              <div onClick={() => setEditing(true)} style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px', cursor: 'pointer' }}>
                {currentUser?.display_name || currentUser?.username}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text2)' }}>@{currentUser?.username}</div>
            </>
          )}

          <div style={{ display: 'flex', gap: '28px', marginTop: '18px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gold-bright)' }}>{myList.length}</div>
              <div style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>In List</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gold-bright)' }}>{watchedCount}</div>
              <div style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>Watched</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gold-bright)' }}>{friends.length}</div>
              <div style={{ fontSize: '10px', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>Friends</div>
            </div>
          </div>
        </div>

        {/* To Watch section */}
        <div style={{ paddingTop: '16px' }}>
          <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', paddingLeft: '16px' }}>
            To Watch · {unwatchedItems.length}
          </div>
          {unwatchedItems.map((item) => (
            <button key={item.id || item.film_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <img
                src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : (item.poster || "/placeholder-poster.png")}
                alt=""
                style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
              />
              <div style={{ flex: '1 1 0%', minWidth: '0px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '2px' }}>{item.year || 'N/A'} · {item.genre || 'Film'}</div>
              </div>
            </button>
          ))}
          {unwatchedItems.length === 0 && (
            <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>No unwatched films in your list yet.</div>
          )}
        </div>

        {/* Sign Out section */}
        <div style={{ padding: '24px 16px 32px' }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '12px 0px', background: 'rgba(220, 53, 69, 0.12)', border: '1px solid rgba(220, 53, 69, 0.25)', borderRadius: '12px', color: 'rgb(255, 107, 122)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
          }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
