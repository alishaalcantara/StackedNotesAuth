import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(() => navigate('/', { replace: true }))
        .catch(() => navigate('/login', { replace: true }))
    } else {
      // Implicit flow: session lands in URL hash, onAuthStateChange picks it up
      navigate('/', { replace: true })
    }
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #467B81 0%, #4A9BAA 50%, #CDCEC7 100%)',
      color: '#fff',
      fontSize: '1.1rem',
      fontFamily: 'inherit',
    }}>
      Verifying your account…
    </div>
  )
}

export default AuthCallbackPage
