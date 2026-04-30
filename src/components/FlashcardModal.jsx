import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFlashcards } from '../context/FlashcardsContext'
import './FlashcardModal.css'

function FlashcardModal({ noteId, noteTitle, onClose }) {
  const navigate = useNavigate()
  const { getDeckByNoteId, saveDeck } = useFlashcards()
  const [cards, setCards] = useState([{ id: `card-${Date.now()}`, question: '', answer: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const existingDeck = getDeckByNoteId(noteId)

  useEffect(() => {
    if (existingDeck && existingDeck.cards.length > 0) {
      setCards(existingDeck.cards)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addCard = () => {
    setCards(prev => [...prev, { id: `card-${Date.now()}`, question: '', answer: '' }])
  }

  const updateCard = (id, field, value) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const removeCard = (id) => {
    setCards(prev => prev.filter(c => c.id !== id))
  }

  const handleSave = async (andStudy = false) => {
    const validCards = cards.filter(c => c.question.trim() || c.answer.trim())
    if (validCards.length === 0) {
      setError('Add at least one card before saving.')
      return
    }
    setSaving(true)
    setError('')
    const result = await saveDeck({
      id: existingDeck?.id,
      noteId,
      noteTitle: noteTitle || 'Untitled',
      cards: validCards,
    })
    setSaving(false)
    if (result?.error) {
      setError('Failed to save — please try again.')
      return
    }
    if (andStudy && result.deck) {
      navigate(`/flashcards/${result.deck.id}`)
    } else {
      onClose()
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="fc-overlay" onClick={handleOverlayClick}>
      <div className="fc-modal">
        <div className="fc-modal-header">
          <h2 className="fc-modal-title">
            🃏 Flashcards — {noteTitle || 'Untitled'}
          </h2>
          <button className="fc-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="fc-card-list">
          {cards.map((card, idx) => (
            <div key={card.id} className="fc-card-row">
              <div className="fc-card-number">{idx + 1}</div>
              <div className="fc-card-fields">
                <textarea
                  className="fc-textarea"
                  placeholder="Question…"
                  value={card.question}
                  onChange={e => updateCard(card.id, 'question', e.target.value)}
                  rows={2}
                />
                <textarea
                  className="fc-textarea fc-answer"
                  placeholder="Answer…"
                  value={card.answer}
                  onChange={e => updateCard(card.id, 'answer', e.target.value)}
                  rows={2}
                />
              </div>
              {cards.length > 1 && (
                <button
                  className="fc-remove-btn"
                  onClick={() => removeCard(card.id)}
                  aria-label="Remove card"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button className="fc-add-btn" onClick={addCard}>+ Add Card</button>

        {error && <p className="fc-error">{error}</p>}

        <div className="fc-modal-footer">
          <button className="fc-btn fc-cancel" onClick={onClose}>Cancel</button>
          <button
            className="fc-btn fc-save"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Deck'}
          </button>
          <button
            className="fc-btn fc-study"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            Save & Study
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlashcardModal
