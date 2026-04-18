import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
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
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
