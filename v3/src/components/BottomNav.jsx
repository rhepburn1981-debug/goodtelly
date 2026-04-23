// Bottom navigation bar — 5 tabs
// The profile tab shows the username in gold text (no icon), per design spec

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const ListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const DiscoverIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const FriendsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const TABS = [
  { id: 'home',     label: 'Home',     Icon: HomeIcon },
  { id: 'list',     label: 'My List',  Icon: ListIcon },
  { id: 'discover', label: 'Discover', Icon: DiscoverIcon },
  { id: 'friends',  label: 'Friends',  Icon: FriendsIcon },
  { id: 'profile',  label: null,       Icon: null },  // username shown instead
]

export default function BottomNav({ activeTab, onTabChange, username, friendsHasUnread }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
    }}>
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id
        const isProfile = id === 'profile'
        const showDot = id === 'friends' && friendsHasUnread

        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0 8px',
              gap: 3,
              color: active
                ? (isProfile ? 'var(--gold-bright)' : 'var(--gold-bright)')
                : 'var(--muted)',
              position: 'relative',
            }}
          >
            {isProfile ? (
              <span style={{
                fontFamily: 'var(--ff-body)',
                fontSize: 12,
                fontWeight: 700,
                color: active ? 'var(--gold-bright)' : 'var(--muted)',
                letterSpacing: 0.3,
                maxWidth: 60,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {username || 'Profile'}
              </span>
            ) : (
              <>
                <span style={{ position: 'relative' }}>
                  <Icon />
                  {showDot && (
                    <span style={{
                      position: 'absolute',
                      top: -2,
                      right: -4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--gold-bright)',
                    }} />
                  )}
                </span>
                <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
              </>
            )}
          </button>
        )
      })}
    </nav>
  )
}
