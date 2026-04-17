import { useNavigate } from 'react-router-dom'
import { stripHtml } from '../utils/text'
import './NoteCard.css'

function NoteCard({ note, onDelete, onToggleBookmark }) {
  const navigate = useNavigate()
  const plainText = stripHtml(note.content)

  return (
    <div className="note-card">
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title || 'Untitled'}</h3>
        <button
          className={`bookmark-btn ${note.isBookmarked ? 'bookmarked' : ''}`}
          onClick={() => onToggleBookmark(note.id)}
          title={note.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {note.isBookmarked ? '★' : '☆'}
        </button>
      </div>
      <p className="note-card-preview">
        {plainText.slice(0, 130)}{plainText.length > 130 ? '…' : ''}
      </p>
      <div className="note-card-footer">
        <span className="note-meta">
          {new Date(note.updatedAt).toLocaleDateString()} · {note.viewCount || 0} views
        </span>
        <div className="note-actions">
          <button className="action-btn edit-btn" onClick={() => navigate(`/note/${note.id}`)}>
            Edit
          </button>
          <button className="action-btn delete-btn" onClick={() => onDelete(note.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoteCard
