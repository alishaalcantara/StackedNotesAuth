import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from './AuthContext'

const FlashcardsContext = createContext(null)

const toApp = (row) => ({
  id: row.id,
  noteId: row.note_id,
  noteTitle: row.note_title,
  cards: row.cards ?? [],
  createdAt: new Date(row.created_at).getTime(),
  updatedAt: new Date(row.updated_at).getTime(),
})

export function FlashcardsProvider({ children }) {
  const { user } = useAuth()
  const [decks, setDecks] = useState([])
  const [decksLoaded, setDecksLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchDecks = async () => {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      if (!error && data) setDecks(data.map(toApp))
      setDecksLoaded(true)
    }
    fetchDecks()
  }, [user])

  const saveDeck = useCallback(async (deckData) => {
    if (!user) return { error: 'Not authenticated' }
    const now = new Date().toISOString()
    const payload = {
      user_id: user.id,
      note_id: deckData.noteId,
      note_title: deckData.noteTitle,
      cards: deckData.cards,
      updated_at: now,
    }
    if (deckData.id) payload.id = deckData.id

    const { data, error } = await supabase
      .from('flashcard_decks')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single()

    if (error) return { error: error.message }
    const deck = toApp(data)
    setDecks(prev => {
      const idx = prev.findIndex(d => d.id === data.id)
      if (idx === -1) return [deck, ...prev]
      const updated = [...prev]
      updated[idx] = deck
      return updated
    })
    return { error: null, deck }
  }, [user])

  const deleteDeck = useCallback(async (id) => {
    if (!user) return
    const { error } = await supabase
      .from('flashcard_decks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) { console.error('deleteDeck failed:', error); return }
    setDecks(prev => prev.filter(d => d.id !== id))
  }, [user])

  const getDeckByNoteId = useCallback((noteId) => {
    return decks.find(d => d.noteId === noteId) ?? null
  }, [decks])

  return (
    <FlashcardsContext.Provider value={{ decks, decksLoaded, saveDeck, deleteDeck, getDeckByNoteId }}>
      {children}
    </FlashcardsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFlashcards() {
  const ctx = useContext(FlashcardsContext)
  if (!ctx) throw new Error('useFlashcards must be used inside <FlashcardsProvider>')
  return ctx
}
