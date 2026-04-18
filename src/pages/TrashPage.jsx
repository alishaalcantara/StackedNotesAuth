import { useNotes } from '../context/NotesContext'
import { stripHtml } from '../utils/text'
import './TrashPage.css'

function TrashPage() {
  const { trash, notesLoaded, restoreNote, deletePermanently, emptyTrash } = useNotes()

  return (
    <div className="trash-page">
      <div className="trash-header">
        <h2 className="trash-title">
          <span className="trash-icon">🗑</span> Trash
        </h2>
        <div className="trash-header-right">
          <span className="trash-count">{trash.length} note{trash.length !== 1 ? 's' : ''}</span>
          {trash.length > 0 && (
            <button className="empty-trash-btn" onClick={emptyTrash}>Empty Trash</button>
          )}
        </div>
      </div>

      {notesLoaded && trash.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗑</div>
          <p>Trash is empty.</p>
          <p className="empty-hint">Deleted notes will appear here.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {trash.map(note => {
            const plainText = stripHtml(note.content)
            return (
              <div key={note.id} className="trash-card">
                <div className="trash-card-header">
                  <h3 className="trash-card-title">{note.title || 'Untitled'}</h3>
                  <span className="deleted-date">
                    Deleted {new Date(note.deletedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="trash-card-preview">
                  {plainText.slice(0, 130)}{plainText.length > 130 ? '…' : ''}
                </p>
                <div className="trash-card-actions">
                  <button className="restore-btn" onClick={() => restoreNote(note.id)}>Restore</button>
                  <button className="perm-delete-btn" onClick={() => deletePermanently(note.id)}>Delete Permanently</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TrashPage
