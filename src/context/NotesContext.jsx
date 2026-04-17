import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NotesContext = createContext(null)

const safeParse = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(() => safeParse('stacknotes_notes'))
  const [trash, setTrash] = useState(() => safeParse('stacknotes_trash'))

  // Single source of truth — sync state to localStorage
  useEffect(() => {
    localStorage.setItem('stacknotes_notes', JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem('stacknotes_trash', JSON.stringify(trash))
  }, [trash])

  const deleteNote = useCallback((id) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id)
      if (!note) return prev
      setTrash(t => [{ ...note, deletedAt: Date.now() }, ...t])
      return prev.filter(n => n.id !== id)
    })
  }, [])

  const toggleBookmark = useCallback((id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n))
  }, [])

  const restoreNote = useCallback((id) => {
    setTrash(prev => {
      const note = prev.find(n => n.id === id)
      if (!note) return prev
      const { deletedAt, ...restored } = note // eslint-disable-line no-unused-vars
      setNotes(n => [restored, ...n])
      return prev.filter(n => n.id !== id)
    })
  }, [])

  const deletePermanently = useCallback((id) => {
    setTrash(prev => prev.filter(n => n.id !== id))
  }, [])

  const emptyTrash = useCallback(() => setTrash([]), [])

  // Handles both create (new id) and update (existing id)
  const saveNote = useCallback((noteData) => {
    setNotes(prev => {
      const idx = prev.findIndex(n => n.id === noteData.id)
      if (idx === -1) return [...prev, noteData]
      const updated = [...prev]
      updated[idx] = noteData
      return updated
    })
  }, [])

  const incrementViewCount = useCallback((id) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, viewCount: (n.viewCount || 0) + 1 } : n
    ))
  }, [])

  return (
    <NotesContext.Provider value={{
      notes,
      trash,
      deleteNote,
      toggleBookmark,
      restoreNote,
      deletePermanently,
      emptyTrash,
      saveNote,
      incrementViewCount,
    }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used inside <NotesProvider>')
  return ctx
}
