import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'
import { usePagination } from '../hooks/usePagination'
import { useInNoteSearch } from '../hooks/useInNoteSearch'
import FormatToolbar from '../components/FormatToolbar'
import './NoteEditorPage.css'

const PAGE_BREAK = '<!--PAGE_BREAK-->'

function NoteEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const { notes, saveNote, incrementViewCount } = useNotes()

  const [title, setTitle] = useState('')
  const [pageIds, setPageIds] = useState(() => [`page-${Date.now()}`])

  const pageRefs = useRef({})
  const pendingContentRef = useRef({})
  // Stable per-page ref callbacks — avoids React re-calling ref on every render
  const pageRefCallbacks = useRef({})
  const viewCountIncrementedRef = useRef(false)

  const getPageRef = useCallback((pageId) => {
    if (!pageRefCallbacks.current[pageId]) {
      pageRefCallbacks.current[pageId] = (el) => {
        if (el) {
          pageRefs.current[pageId] = el
          if (pendingContentRef.current[pageId] !== undefined) {
            el.innerHTML = pendingContentRef.current[pageId]
            delete pendingContentRef.current[pageId]
          }
        } else {
          delete pageRefs.current[pageId]
          delete pageRefCallbacks.current[pageId]
        }
      }
    }
    return pageRefCallbacks.current[pageId]
  }, [])

  // Reload content when navigating to a different note (id changes)
  useEffect(() => {
    if (isNew) {
      setTitle('')
      const freshId = `page-${Date.now()}`
      setPageIds([freshId])
      viewCountIncrementedRef.current = false
      return
    }
    const note = notes.find(n => n.id === id)
    if (!note) return
    setTitle(note.title)
    const parts = (note.content ?? '').split(PAGE_BREAK)
    const ids = parts.map((_, i) => `page-${Date.now()}-${i}`)
    ids.forEach((pid, i) => { pendingContentRef.current[pid] = parts[i] })
    setPageIds(ids)
    viewCountIncrementedRef.current = false
  }, [id, isNew]) // notes excluded intentionally — only reload on navigation // eslint-disable-line react-hooks/exhaustive-deps

  // Increment view count exactly once per note visit
  useEffect(() => {
    if (!isNew && id && !viewCountIncrementedRef.current) {
      incrementViewCount(id)
      viewCountIncrementedRef.current = true
    }
  }, [id, isNew, incrementViewCount])

  const { handlePageInput, handlePageKeyDown } = usePagination(pageIds, setPageIds, pageRefs)
  const {
    searchOpen, searchQuery, matchCount,
    searchInputRef, handleSearchChange, handleSearchKey, toggleSearch,
    getCleanContent,
  } = useInNoteSearch(pageIds, pageRefs)

  const handleSave = () => {
    const content = getCleanContent(pageIds).join(PAGE_BREAK)
    const now = Date.now()
    if (isNew) {
      saveNote({
        id: now.toString(),
        title: title.trim() || 'Untitled',
        content,
        createdAt: now,
        updatedAt: now,
        viewCount: 0,
        isBookmarked: false,
      })
    } else {
      const existing = notes.find(n => n.id === id) ?? {}
      saveNote({ ...existing, title: title.trim() || 'Untitled', content, updatedAt: now })
    }
    navigate('/')
  }

  return (
    <div className="editor-page">
      <div className="editor-topbar">
        <div className="topbar-actions">
          <button className="footer-btn cancel-btn" onClick={() => navigate('/')}>Cancel</button>
          <button className="footer-btn save-btn" onClick={handleSave}>Save Note</button>
        </div>

        <FormatToolbar />

        <div className="retractable-search">
          <button className="magnify-btn" onClick={toggleSearch} title="Search in note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <div className={`search-expand ${searchOpen ? 'open' : ''}`}>
            <input
              ref={searchInputRef}
              type="text"
              className="retractable-input"
              placeholder="Search in note…"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKey}
            />
            {searchQuery && (
              <span className="match-count">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
            )}
          </div>
        </div>
      </div>

      <div className="notebook-wrapper">
        {pageIds.map((pageId, pageIndex) => (
          <div key={pageId} className="notebook-page">
            <div className="margin-line" />
            {pageIndex === 0 ? (
              <input
                type="text"
                className="note-title-input"
                placeholder="Note title…"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            ) : (
              <div className="page-number">Page {pageIndex + 1}</div>
            )}
            <div
              ref={getPageRef(pageId)}
              className="note-editor"
              contentEditable
              suppressContentEditableWarning
              data-placeholder={pageIndex === 0 ? 'Start writing your note…' : ''}
              onInput={() => handlePageInput(pageId, pageIndex)}
              onKeyDown={(e) => handlePageKeyDown(pageId, pageIndex, e)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default NoteEditorPage
