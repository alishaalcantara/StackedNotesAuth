import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from './AuthContext'

const NotesContext = createContext(null)

const toApp = (row) => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: new Date(row.created_at).getTime(),
  updatedAt: new Date(row.updated_at).getTime(),
  viewCount: row.view_count,
  isBookmarked: row.is_bookmarked,
  ...(row.deleted_at ? { deletedAt: new Date(row.deleted_at).getTime() } : {}),
})

export function NotesProvider({ children }) {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [trash, setTrash] = useState([])
  const [notesLoaded, setNotesLoaded] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchAll = async () => {
      const [activeResult, trashResult] = await Promise.all([
        supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
        supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .not('deleted_at', 'is', null)
          .order('deleted_at', { ascending: false }),
      ])

      if (!activeResult.error && activeResult.data) setNotes(activeResult.data.map(toApp))
      if (!trashResult.error && trashResult.data) setTrash(trashResult.data.map(toApp))
      setNotesLoaded(true)
    }

    fetchAll()
  }, [user])

  const saveNote = useCallback(async (noteData) => {
    if (!user) return { error: 'Not authenticated' }
    const { data, error } = await supabase
      .from('notes')
      .upsert({
        id: noteData.id,
        user_id: user.id,
        title: noteData.title,
        content: noteData.content,
        created_at: new Date(noteData.createdAt).toISOString(),
        updated_at: new Date(noteData.updatedAt).toISOString(),
        view_count: noteData.viewCount ?? 0,
        is_bookmarked: noteData.isBookmarked ?? false,
      }, { onConflict: 'id' })
      .select()
      .single()

    if (error) return { error: error.message }
    if (data) {
      setNotes(prev => {
        const idx = prev.findIndex(n => n.id === data.id)
        if (idx === -1) return [toApp(data), ...prev]
        const updated = [...prev]
        updated[idx] = toApp(data)
        return updated
      })
    }
    return { error: null }
  }, [user])

  const deleteNote = useCallback(async (id) => {
    if (!user) return
    const { data, error } = await supabase
      .from('notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) { console.error('deleteNote failed:', error); return }
    if (data) {
      setNotes(prev => prev.filter(n => n.id !== id))
      setTrash(prev => [toApp(data), ...prev])
    }
  }, [user])

  const toggleBookmark = useCallback(async (id) => {
    if (!user) return
    const note = notes.find(n => n.id === id)
    if (!note) return

    const { data, error } = await supabase
      .from('notes')
      .update({ is_bookmarked: !note.isBookmarked })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) { console.error('toggleBookmark failed:', error); return }
    if (data) setNotes(prev => prev.map(n => n.id === id ? toApp(data) : n))
  }, [user, notes])

  const restoreNote = useCallback(async (id) => {
    if (!user) return
    const { data, error } = await supabase
      .from('notes')
      .update({ deleted_at: null })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) { console.error('restoreNote failed:', error); return }
    if (data) {
      setTrash(prev => prev.filter(n => n.id !== id))
      setNotes(prev => [toApp(data), ...prev])
    }
  }, [user])

  const deletePermanently = useCallback(async (id) => {
    if (!user) return
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) { console.error('deletePermanently failed:', error); return }
    setTrash(prev => prev.filter(n => n.id !== id))
  }, [user])

  const emptyTrash = useCallback(async () => {
    if (!user) return
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)

    if (error) { console.error('emptyTrash failed:', error); return }
    setTrash([])
  }, [user])

  const incrementViewCount = useCallback(async (id) => {
    if (!user) return
    const note = notes.find(n => n.id === id)
    if (!note) return

    const { data, error } = await supabase
      .from('notes')
      .update({ view_count: (note.viewCount ?? 0) + 1 })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) { console.error('incrementViewCount failed:', error); return }
    if (data) setNotes(prev => prev.map(n => n.id === id ? toApp(data) : n))
  }, [user, notes])

  return (
    <NotesContext.Provider value={{
      notes,
      trash,
      notesLoaded,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useNotes() {
  const ctx = useContext(NotesContext)
  if (!ctx) throw new Error('useNotes must be used inside <NotesProvider>')
  return ctx
}
