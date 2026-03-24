import { useEffect } from 'react'

// Usage: <Toast message={toast} onDone={() => setToast('')} />
export default function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [message, onDone])

  if (!message) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 90,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--surface3)',
      border: '1px solid var(--border2)',
      color: 'var(--text)',
      padding: '10px 20px',
      borderRadius: 'var(--radius-md)',
      fontSize: 14,
      fontWeight: 500,
      zIndex: 9999,
      animation: 'fadeUp 0.2s ease',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}
