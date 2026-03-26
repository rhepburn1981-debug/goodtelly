import { clearToken } from '../api/client'
import { updateMe } from '../api/auth'
import { useState } from 'react'

export default function ProfileTab({ currentUser, myList, watchedIds, friends, onLogout, onToast }) {
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '')
  const [saving, setSaving] = useState(false)

  const unwatchedCount = myList.filter((f) => !watchedIds?.includes(f.film_id || f.id)).length
  const watchedCount = myList.filter((f) => watchedIds?.includes(f.film_id || f.id)).length

  async function saveProfile() {
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

  return (
    <div style={{ padding: '0 16px', paddingBottom: 100 }}>
      {/* Avatar + name */}
      <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 8 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{currentUser?.avatar || '🎬'}</div>
        {editing ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text)',
                padding: '8px 12px',
                fontSize: 15,
                fontFamily: 'var(--ff-body)',
                width: 180,
              }}
            />
            <button
              onClick={saveProfile}
              disabled={saving}
              style={{
                background: 'var(--gold)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: '#000',
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--ff-body)',
              }}
            >
              {saving ? '...' : 'Save'}
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
              {currentUser?.display_name || currentUser?.username}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
              @{currentUser?.username}
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border2)',
                borderRadius: 20,
                color: 'var(--text2)',
                padding: '5px 14px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--ff-body)',
              }}
            >
              Edit name
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'To watch', count: unwatchedCount },
          { label: 'Watched', count: watchedCount },
          { label: 'Friends', count: friends.length },
        ].map(({ label, count }) => (
          <div key={label} style={{
            flex: 1,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{count}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Friends list */}
      {friends.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 10 }}>
            Friends
          </div>
          {friends.map((f) => (
            <div key={f.username} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 22 }}>{f.avatar || '🎬'}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {f.display_name || f.username}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>@{f.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--muted)',
          padding: '12px 0',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--ff-body)',
        }}
      >
        Sign out
      </button>
    </div>
  )
}
