// Full-screen trailer overlay — YouTube embed

export default function TrailerModal({ url, onClose }) {
  if (!url) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 700, padding: '0 16px' }}
      >
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={url + '?autoplay=1&rel=0'}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              border: 'none',
              borderRadius: 12,
            }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            display: 'block',
            width: '100%',
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            color: 'var(--text)',
            padding: '10px 0',
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--ff-body)',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
