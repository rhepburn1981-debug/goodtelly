import { useState } from 'react'
import { buildShareUrl, sendViaWhatsApp } from '../utils/share'
import { sendRecommendation } from '../api/watchlist'

export default function RecommendModal({ film, currentUser, onClose, onToast }) {
  const [note, setNote] = useState('')
  const [rating, setRating] = useState(0)
  const [sending, setSending] = useState(false)

  if (!film || !currentUser) return null

  const shareUrl = buildShareUrl(film, currentUser, note, rating)

  async function handleSend() {
    setSending(true)
    try {
      await sendRecommendation(null, film.id, note, rating || null)
    } catch (_) {}
    sendViaWhatsApp(shareUrl, film, currentUser.display_name || currentUser.username, note, rating)
    onClose()
    onToast && onToast('Shared via WhatsApp!')
    setSending(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--surface2)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 32px',
          animation: 'slideUp 0.25s ease',
        }}
      >
        <div style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 4,
        }}>
          Recommend to friends
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
          {film.title}
        </div>

        {/* Star rating */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(rating === n ? 0 : n)}
              style={{
                fontSize: 24,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: n <= rating ? 1 : 0.3,
                padding: 0,
              }}
            >
              ⭐
            </button>
          ))}
        </div>

        {/* Note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a personal note... (optional)"
          maxLength={200}
          rows={3}
          style={{
            width: '100%',
            background: 'var(--surface3)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            padding: '10px 12px',
            fontSize: 14,
            fontFamily: 'var(--ff-body)',
            resize: 'none',
            marginBottom: 16,
          }}
        />

        <button
          onClick={handleSend}
          disabled={sending}
          style={{
            width: '100%',
            background: '#25D366',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            padding: '14px 0',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--ff-body)',
            opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? 'Opening WhatsApp...' : '📲 Send via WhatsApp'}
        </button>

        <button
          onClick={onClose}
          style={{
            marginTop: 10,
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'var(--ff-body)',
            padding: '8px 0',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
