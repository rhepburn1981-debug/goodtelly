import { useState, useEffect } from 'react'
import { buildShareUrl, sendViaWhatsApp } from '../utils/share'
import { sendRecommendation } from '../api/watchlist'

export default function RecommendModal({ film, currentUser, onClose, onToast }) {
  const [note, setNote] = useState('')
  const [rating, setRating] = useState(0)
  const [sending, setSending] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!film || !currentUser) return null

  const shareUrl = buildShareUrl(film, currentUser, note, rating)

  async function handleSend() {
    setSending(true)
    try {
      await sendRecommendation(null, film.id, note, rating || null)
    } catch (_) { }
    sendViaWhatsApp(shareUrl, film, currentUser.display_name || currentUser.username, note, rating)
    onClose()
    onToast && onToast('Shared via WhatsApp!')
    setSending(false)
  }

  const backdrop = film.backdrop_url || film.poster_url || ''

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgb(20, 20, 32)',
          borderRadius: '22px',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header section with backdrop */}
        <div style={{ position: 'relative', height: '110px', flexShrink: 0, overflow: 'hidden', borderRadius: '22px 22px 0px 0px' }}>
          <img src={backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgb(20, 20, 32) 0%, rgba(0, 0, 0, 0.2) 60%)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '14px' }}>
            <div style={{ fontFamily: "var(--ff-display, 'Cormorant Garamond', serif)", fontSize: '18px', fontWeight: '900', color: 'rgb(255, 255, 255)', lineHeight: 1.1 }}>
              {film.title}
            </div>
            <div style={{ fontSize: '10px', color: 'rgb(170, 170, 170)', marginTop: '2px' }}>
              {film.genre} · {film.year}
            </div>
          </div>
          <button onClick={onClose} style={{
            position: 'absolute', top: '10px', right: '10px', background: 'rgba(0, 0, 0, 0.55)', border: 'none',
            borderRadius: '50%', width: '28px', height: '28px', color: 'white', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>

        {/* Form Body */}
        <div style={{ overflowY: 'auto', padding: '14px 16px 8px', flex: '1 1 0%' }} className="no-scrollbar">
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgb(170, 170, 170)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', textAlign: 'center' }}>Rate it</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(rating === n ? 0 : n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', lineHeight: 1 }}
                >
                  <svg viewBox="0 0 24 24" width="38" height="38" style={{ filter: n <= rating ? 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' : 'none', transition: '0.15s' }}>
                    <polygon
                      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                      fill={n <= rating ? "var(--gold-bright)" : "rgba(255,255,255,0.08)"}
                      stroke={n <= rating ? "var(--gold)" : "rgba(255,255,255,0.15)"}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgb(170, 170, 170)', marginBottom: '6px' }}>
            Your note <span style={{ fontWeight: '400', color: 'rgb(85, 85, 85)' }}>(optional)</span>
          </div>
          <input
            placeholder="Why it's banging..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px', padding: '10px 12px', color: 'white', fontSize: '16px', outline: 'none',
              fontFamily: 'var(--ff-body)', fontStyle: 'italic', marginBottom: '14px'
            }}
          />
        </div>

        {/* Footer actions */}
        <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.07)', background: 'rgb(20, 20, 32)', flexShrink: 0 }}>
          <div style={{ fontSize: '10px', color: 'rgb(102, 102, 102)', textAlign: 'center', marginBottom: '8px' }}>Not in the app? Share via WhatsApp</div>
          <button
            onClick={handleSend}
            disabled={sending}
            style={{
              width: '100%', padding: '13px', background: 'rgba(37, 211, 102, 0.12)', border: '1.5px solid rgb(37, 211, 102)',
              borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: '900', color: 'rgb(37, 211, 102)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: sending ? 0.6 : 1, transition: '0.2s'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"></path>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.857L0 24l6.335-1.51A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.368l-.36-.214-3.733.89.923-3.638-.235-.374A9.818 9.818 0 1112 21.818z"></path>
            </svg>
            {sending ? 'Sending...' : 'Send via WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}
