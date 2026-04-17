import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const location = useLocation()

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
        <Link to="/trash" className={`nav-link ${location.pathname === '/trash' ? 'active' : ''}`}>
          Trash
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
