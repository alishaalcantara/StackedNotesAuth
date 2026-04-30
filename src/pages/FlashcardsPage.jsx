import { useNavigate } from 'react-router-dom'
import { useFlashcards } from '../context/FlashcardsContext'
import './FlashcardsPage.css'

function FlashcardsPage() {
  const navigate = useNavigate()
  const { decks, decksLoaded, deleteDeck } = useFlashcards()

  if (!decksLoaded) {
    return <div className="fcp-page"><p className="fcp-loading">Loading decks…</p></div>
  }

  return (
    <div className="fcp-page">
      <div className="fcp-header">
        <h1 className="fcp-title">Flashcard Decks</h1>
        <p className="fcp-sub">{decks.length} deck{decks.length !== 1 ? 's' : ''}</p>
      </div>

      {decks.length === 0 ? (
        <div className="fcp-empty">
          <span className="fcp-empty-icon">🃏</span>
          <p>No flashcard decks yet.</p>
          <p className="fcp-empty-hint">Open a note and click "Flashcard It!" to create one.</p>
        </div>
      ) : (
        <div className="fcp-grid">
          {decks.map(deck => (
            <div
              key={deck.id}
              className="fcp-deck-card"
              onClick={() => navigate(`/flashcards/${deck.id}`)}
            >
              <div className="fcp-deck-body">
                <h2 className="fcp-deck-name">{deck.noteTitle || 'Untitled'}</h2>
                <p className="fcp-deck-count">
                  {deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="fcp-deck-footer">
                <span className="fcp-deck-date">
                  {new Date(deck.updatedAt).toLocaleDateString()}
                </span>
                <button
                  className="fcp-delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id) }}
                  aria-label="Delete deck"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FlashcardsPage
