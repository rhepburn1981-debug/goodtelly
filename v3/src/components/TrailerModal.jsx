import { useState, useEffect } from 'react'

function buildEmbedSrc(rawUrl) {
  if (!rawUrl) return ''

  let embedUrl = rawUrl
  try {
    const parsed = new URL(rawUrl)
    const host = parsed.hostname.toLowerCase()

    // Convert watch/share links into iframe-safe embed URLs.
    if (host.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '').trim()
      if (id) embedUrl = `https://www.youtube.com/embed/${id}`
    } else if (host.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        if (id) embedUrl = `https://www.youtube.com/embed/${id}`
      } else if (parsed.pathname.startsWith('/embed/')) {
        embedUrl = `https://www.youtube.com${parsed.pathname}`
      }
    }

    const embedParsed = new URL(embedUrl)
    embedParsed.searchParams.set('autoplay', '1')
    embedParsed.searchParams.set('rel', '0')
    return embedParsed.toString()
  } catch {
    const joiner = rawUrl.includes('?') ? '&' : '?'
    return `${rawUrl}${joiner}autoplay=1&rel=0`
  }
}

export default function TrailerModal({ url, onClose }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const iframeSrc = buildEmbedSrc(url)
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
        backdropFilter: 'blur(10px)',
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .trailer-container {
          animation: popIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
          width: 100%;
          max-width: 1000px;
          padding: 0 16px;
        }
      `}} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="trailer-container"
      >
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <iframe
            src={iframeSrc}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              border: 'none',
            }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 24,
            display: 'block',
            width: '100%',
            maxWidth: 200,
            margin: '24px auto 0',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            padding: '14px 0',
            borderRadius: 16,
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'var(--ff-body)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.color = 'var(--gold-bright)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#fff';
          }}
        >
          Close Trailer
        </button>
      </div>
    </div>
  )
}
