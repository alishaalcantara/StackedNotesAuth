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

  useEffect(() => {
    if (!user) return

    const fetchAll = async () => {
      const [{ data: activeData }, { data: trashData }] = await Promise.all([
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

      if (activeData) setNotes(activeData.map(toApp))
      if (trashData) setTrash(trashData.map(toApp))
    }

    fetchAll()
  }, [user])

  const saveNote = useCallback(async (noteData) => {
    if (!user) return
    const { data } = await supabase
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

    if (data) {
      setNotes(prev => {
        const idx = prev.findIndex(n => n.id === data.id)
        if (idx === -1) return [toApp(data), ...prev]
        const updated = [...prev]
        updated[idx] = toApp(data)
        return updated
      })
    }
  }, [user])

  const deleteNote = useCallback(async (id) => {
    if (!user) return
    const { data } = await supabase
      .from('notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (data) {
      setNotes(prev => prev.filter(n => n.id !== id))
      setTrash(prev => [toApp(data), ...prev])
    }
  }, [user])

  const toggleBookmark = useCallback(async (id) => {
    if (!user) return
    const note = notes.find(n => n.id === id)
    if (!note) return

    const { data } = await supabase
      .from('notes')
      .update({ is_bookmarked: !note.isBookmarked })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (data) setNotes(prev => prev.map(n => n.id === id ? toApp(data) : n))
  }, [user, notes])

  const restoreNote = useCallback(async (id) => {
    if (!user) return
    const { data } = await supabase
      .from('notes')
      .update({ deleted_at: null })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (data) {
      setTrash(prev => prev.filter(n => n.id !== id))
      setNotes(prev => [toApp(data), ...prev])
    }
  }, [user])

  const deletePermanently = useCallback(async (id) => {
    if (!user) return
    await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    setTrash(prev => prev.filter(n => n.id !== id))
  }, [user])

  const emptyTrash = useCallback(async () => {
    if (!user) return
    await supabase
      .from('notes')
      .delete()
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)

    setTrash([])
  }, [user])

  const incrementViewCount = useCallback(async (id) => {
    if (!user) return
    const note = notes.find(n => n.id === id)
    if (!note) return

    const { data } = await supabase
      .from('notes')
      .update({ view_count: (note.viewCount ?? 0) + 1 })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (data) setNotes(prev => prev.map(n => n.id === id ? toApp(data) : n))
  }, [user, notes])

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
