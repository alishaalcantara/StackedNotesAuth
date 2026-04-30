import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-title">StackNotes</Link>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/bookmarks" className={`nav-link ${location.pathname === '/bookmarks' ? 'active' : ''}`}>
          Bookmarks
        </Link>
        <Link to="/flashcards" className={`nav-link ${location.pathname.startsWith('/flashcards') ? 'active' : ''}`}>
          Flashcards
        </Link>
        <Link to="/trash" className={`nav-link ${location.pathname === '/trash' ? 'active' : ''}`}>
          Trash
        </Link>
        <button className="nav-logout" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </nav>
  )
}

export default Navbar
