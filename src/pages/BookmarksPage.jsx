import { useNotes } from '../context/NotesContext'
import NoteCard from '../components/NoteCard'
import ErrorBoundary from '../components/ErrorBoundary'
import './BookmarksPage.css'

function BookmarksPage() {
  const { notes, deleteNote, toggleBookmark } = useNotes()
  const bookmarked = notes.filter(n => n.isBookmarked)

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-header">
        <h2 className="bookmarks-title">
          <span className="star-icon">★</span> Bookmarks
        </h2>
        <span className="bookmarks-count">{bookmarked.length} note{bookmarked.length !== 1 ? 's' : ''}</span>
      </div>

      {bookmarked.length === 0 ? (
        <div className="empty-state">
          <div className="empty-star">☆</div>
          <p>No bookmarked notes yet.</p>
          <p className="empty-hint">Tap the star icon on any note to bookmark it.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {bookmarked.map(note => (
            <ErrorBoundary key={note.id} fallback={<div className="note-card" style={{padding:'1rem',color:'#888'}}>Could not display this note.</div>}>
              <NoteCard
                note={note}
                onDelete={deleteNote}
                onToggleBookmark={toggleBookmark}
              />
            </ErrorBoundary>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookmarksPage
