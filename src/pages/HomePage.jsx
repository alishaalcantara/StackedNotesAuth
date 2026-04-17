import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import NoteCard from '../components/NoteCard'
import ErrorBoundary from '../components/ErrorBoundary'
import { useNotes } from '../context/NotesContext'
import { stripHtml } from '../utils/text'
import './HomePage.css'

function HomePage() {
  const { notes, deleteNote, toggleBookmark } = useNotes()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const navigate = useNavigate()

  const filtered = useMemo(() => notes
    .filter(note => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        note.title.toLowerCase().includes(q) ||
        stripHtml(note.content).toLowerCase().includes(q)
      )
    })
    .sort((a, b) =>
      sortBy === 'mostViewed'
        ? (b.viewCount || 0) - (a.viewCount || 0)
        : b.createdAt - a.createdAt
    ),
  [notes, searchQuery, sortBy])

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="search-bar-wrapper">
          <span className="search-icon-static">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            className="home-search-input"
            placeholder="Search all notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <button className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => setSortBy('newest')}>
            Newest
          </button>
          <button className={`sort-btn ${sortBy === 'mostViewed' ? 'active' : ''}`} onClick={() => setSortBy('mostViewed')}>
            Most Viewed
          </button>
        </div>
      </div>

      <div className="notes-grid">
        <div className="create-card" onClick={() => navigate('/note/new')}>
          <div className="create-icon">+</div>
          <span className="create-label">Create New Note</span>
        </div>

        {filtered.map(note => (
          <ErrorBoundary key={note.id} fallback={<div className="note-card" style={{padding:'1rem',color:'#888'}}>Could not display this note.</div>}>
            <NoteCard
              note={note}
              onDelete={deleteNote}
              onToggleBookmark={toggleBookmark}
            />
          </ErrorBoundary>
        ))}
      </div>

      {notes.length === 0 && (
        <p className="empty-hint" style={{padding: '1rem 2rem'}}>No notes yet — click "Create New Note" to get started!</p>
      )}
    </div>
  )
}

export default HomePage
