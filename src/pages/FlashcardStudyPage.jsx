import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFlashcards } from '../context/FlashcardsContext'
import './FlashcardStudyPage.css'

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function FlashcardStudyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { decks, decksLoaded } = useFlashcards()

  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [shuffled, setShuffled] = useState(false)

  useEffect(() => {
    if (!decksLoaded) return
    const found = decks.find(d => d.id === id)
    if (found) {
      setDeck(found)
      setCards(found.cards)
    }
  }, [decksLoaded, decks, id])

  const currentCard = cards[currentIndex]
  const total = cards.length

  const goNext = useCallback(() => {
    if (currentIndex >= total - 1) return
    setFlipped(false)
    setTimeout(() => setCurrentIndex(i => i + 1), 150)
  }, [currentIndex, total])

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) return
    setFlipped(false)
    setTimeout(() => setCurrentIndex(i => i - 1), 150)
  }, [currentIndex])

  const handleShuffle = () => {
    setFlipped(false)
    setCurrentIndex(0)
    if (shuffled) {
      setCards(deck.cards)
    } else {
      setCards(shuffleArray(deck.cards))
    }
    setShuffled(s => !s)
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev])

  if (!decksLoaded) {
    return <div className="study-page"><p className="study-loading">Loading…</p></div>
  }

  if (!deck || cards.length === 0) {
    return (
      <div className="study-page">
        <p className="study-loading">Deck not found.</p>
        <button className="study-back-btn" onClick={() => navigate('/flashcards')}>
          ← Back to Decks
        </button>
      </div>
    )
  }

  return (
    <div className="study-page">
      <div className="study-header">
        <button className="study-back-btn" onClick={() => navigate('/flashcards')}>
          ← Decks
        </button>
        <h1 className="study-deck-title">{deck.noteTitle}</h1>
        <button
          className={`study-shuffle-btn ${shuffled ? 'active' : ''}`}
          onClick={handleShuffle}
          title="Shuffle cards"
        >
          ⇄ {shuffled ? 'Unshuffle' : 'Shuffle'}
        </button>
      </div>

      <p className="study-progress">{currentIndex + 1} / {total}</p>

      <div className="study-card-wrapper" onClick={() => setFlipped(f => !f)}>
        <div className={`study-card ${flipped ? 'flipped' : ''}`}>
          <div className="study-card-front">
            <span className="study-card-label">Question</span>
            <p className="study-card-text">{currentCard.question}</p>
          </div>
          <div className="study-card-back">
            <span className="study-card-label">Answer</span>
            <p className="study-card-text">{currentCard.answer}</p>
          </div>
        </div>
        <p className="study-flip-hint">Click to flip</p>
      </div>

      <div className="study-controls">
        <button
          className="study-nav-btn"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          ← Prev
        </button>
        <button
          className="study-nav-btn"
          onClick={goNext}
          disabled={currentIndex === total - 1}
        >
          Next →
        </button>
      </div>

      <p className="study-key-hint">← → arrow keys to navigate · Space to flip</p>
    </div>
  )
}

export default FlashcardStudyPage
