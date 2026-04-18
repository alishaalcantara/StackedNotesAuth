import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const RESEND_COOLDOWN = 60

function LoginPage() {
  const { signIn, signUp, resendVerification, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [awaitingVerification, setAwaitingVerification] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN)
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    if (mode === 'login') {
      const { error: authError } = await signIn(email, password)
      setSubmitting(false)
      if (authError) setError(authError.message)
    } else {
      const { data, error: authError } = await signUp(email, password)
      setSubmitting(false)
      if (authError) {
        setError(authError.message)
      } else if (data.user?.identities?.length === 0) {
        setError('An account with this email already exists. Please log in instead.')
      } else {
        setAwaitingVerification(true)
        setMessage('Check your email to confirm your account.')
        startCooldown()
      }
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')
    const { error: resendError } = await resendVerification(email)
    if (resendError) {
      setError(resendError.message)
    } else {
      setMessage('Verification email resent — check your inbox.')
      startCooldown()
    }
  }

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError('')
    setMessage('')
    setAwaitingVerification(false)
    clearInterval(timerRef.current)
    setCooldown(0)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">StackNotes</div>
        <div className="login-subtitle">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Email
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </label>

          <label className="login-label">
            Password
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-success">{message}</div>}

          <button className="login-btn" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {awaitingVerification && (
          <div className="resend-row">
            <span>Didn't receive it?</span>
            <button
              className="resend-btn"
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
            </button>
          </div>
        )}

        <div className="login-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={toggleMode}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
