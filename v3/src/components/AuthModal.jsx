import { useState, useEffect, useCallback, useRef } from 'react'
import { login, register, googleAuth, getMe } from '../api/auth'
import { setToken } from '../api/client'
import { consumeInvite, inviteToApiFields } from '../utils/invite'

const GOOGLE_CLIENT_ID = '709452989437-vooq081nkmhb03n12h8p0tee0e327ui1.apps.googleusercontent.com'

const AVATAR_OPTIONS = ['🎬', '🍿', '🎭', '🎥', '🌟', '🎞️', '🦁', '🐯', '🦊', '🐺',
  '🦝', '🐻', '🐼', '🐨', '🦄', '🐸', '🦋', '🌈', '🔥', '⚡']

export default function AuthModal({ mode: initialMode = 'login', onLogin, onClose, shareInvite }) {
  const [mode, setMode]         = useState(initialMode)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatar, setAvatar]     = useState('🎬')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const googleBtnRef            = useRef(null)

  // Google Sign-In — must use useCallback([]) so the closure is stable
  // Invite data read from localStorage inside callback (not from React props/state)
  const handleGoogleSignIn = useCallback(async (response) => {
    const invite = consumeInvite()
    const inviteFields = inviteToApiFields(invite)

    try {
      const data = await googleAuth(response.credential, inviteFields)
      setToken(data.access_token)
      onLogin(data.user, data.access_token)
    } catch (err) {
      console.error('Google sign-in error', err)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof google === 'undefined') return
    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
      })
      if (googleBtnRef.current) {
        google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          shape: 'pill',
          theme: 'filled_black',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          size: 'large',
          width: 280,
        })
      }
    } catch (_) {}
  }, [mode, handleGoogleSignIn])

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const invite = consumeInvite()
    const inviteFields = inviteToApiFields(invite)

    try {
      if (mode === 'register') {
        await register({ email, password, username, display_name: displayName, avatar, ...inviteFields })
        const loginData = await login(email, password)
        setToken(loginData.access_token)
        const user = await getMe()
        onLogin(user, loginData.access_token)
      } else {
        const data = await login(email, password)
        setToken(data.access_token)
        const user = await getMe()
        onLogin(user, data.access_token)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 800,
        display: 'flex',
        alignItems: 'flex-end',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px 40px',
          animation: 'slideUp 0.25s ease',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        {/* Invite banner */}
        {shareInvite && (
          <div style={{
            background: 'var(--gold-glow)',
            border: '1px solid var(--gold)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: 13,
            color: 'var(--gold-bright)',
          }}>
            <strong>{shareInvite.from}</strong> invited you to watch{' '}
            <strong>{shareInvite.title}</strong>
          </div>
        )}

        <h2 style={{
          fontFamily: 'var(--ff-display)',
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 6,
        }}>
          {mode === 'register' ? 'Join Reel' : 'Welcome back'}
        </h2>

        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          {mode === 'register'
            ? 'Track films and share picks with friends'
            : 'Sign in to your account'}
        </p>

        {/* Google button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div ref={googleBtnRef} />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
          color: 'var(--muted)',
          fontSize: 12,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          or
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <>
              <input
                type="text"
                placeholder="Username (no spaces)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
                style={inputStyle()}
              />
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                style={inputStyle()}
              />

              {/* Avatar picker */}
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Pick an avatar</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {AVATAR_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      style={{
                        width: 40, height: 40,
                        borderRadius: '50%',
                        border: avatar === a ? '2px solid var(--gold-bright)' : '2px solid var(--border)',
                        background: avatar === a ? 'var(--gold-glow)' : 'var(--surface2)',
                        fontSize: 20,
                        cursor: 'pointer',
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle()}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle()}
          />

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--gold)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#000',
              padding: '14px 0',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--ff-body)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '...' : mode === 'register' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={{
            marginTop: 16,
            width: '100%',
            background: 'none',
            border: 'none',
            color: 'var(--gold-bright)',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'var(--ff-body)',
            padding: '6px 0',
          }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

function inputStyle() {
  return {
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    padding: '12px 14px',
    fontSize: 16,
    fontFamily: 'var(--ff-body)',
    width: '100%',
    outline: 'none',
  }
}
