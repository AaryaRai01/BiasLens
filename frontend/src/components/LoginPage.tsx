import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../AuthContext'

type Tab = 'signin' | 'signup'

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const friendlyError = (code: string) => {
    const map: Record<string, string> = {
      'auth/user-not-found': 'No account with that email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/invalid-credential': 'Invalid email or password.',
    }
    return map[code] || 'Something went wrong. Please try again.'
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (tab === 'signin') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password, displayName)
      }
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="login-root">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-grid" />
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo-mark">
            <div style={{
              width: 32, height: 32, backgroundColor: 'var(--accent-blue)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="2.5"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
                <path d="M6 16H11M21 16H26M16 6V11M16 21V26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="login-title">BiasLens</h1>
            <p className="login-subtitle">AI Fairness Auditing Platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'signin' ? 'login-tab-active' : ''}`}
            onClick={() => { setTab('signin'); setError(null) }}
            id="tab-signin"
          >
            Sign In
          </button>
          <button
            className={`login-tab ${tab === 'signup' ? 'login-tab-active' : ''}`}
            onClick={() => { setTab('signup'); setError(null) }}
            id="tab-signup"
          >
            Create Account
          </button>
          <div className="login-tab-indicator" style={{ left: tab === 'signin' ? '4px' : 'calc(50% + 4px)' }} />
        </div>

        {/* Google Button */}
        <button
          className="login-google-btn"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          id="btn-google-signin"
        >
          {googleLoading ? (
            <span className="login-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">or</span>
          <div className="login-divider-line" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {tab === 'signup' && (
            <div className="login-field">
              <label className="login-label" htmlFor="input-name">Full Name</label>
              <input
                id="input-name"
                type="text"
                className="login-input"
                placeholder="Jane Smith"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="input-email">Email Address</label>
            <input
              id="input-email"
              type="email"
              className="login-input"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="input-password">Password</label>
            <input
              id="input-password"
              type="password"
              className="login-input"
              placeholder={tab === 'signup' ? 'Min. 6 characters' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" stroke="#f87171" />
                <path d="M7 4v3.5M7 9.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading || googleLoading}
            id="btn-email-submit"
          >
            {loading ? (
              <span className="login-spinner login-spinner-white" />
            ) : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="login-footer-text">
          {tab === 'signin'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            className="login-switch-btn"
            onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(null) }}
          >
            {tab === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
