import { useState, useRef, useEffect, useCallback } from 'react'

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function useInNoteSearch(pageIds, pageRefs) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [matchCount, setMatchCount] = useState(0)

  const cleanPagesRef = useRef(null)
  const matchIndexRef = useRef(0)
  const searchInputRef = useRef(null)

  // Restore clean content whenever search closes
  useEffect(() => {
    if (!searchOpen && cleanPagesRef.current !== null) {
      Object.entries(cleanPagesRef.current).forEach(([pid, html]) => {
        const el = pageRefs.current[pid]
        if (el) el.innerHTML = html
      })
      cleanPagesRef.current = null
      setMatchCount(0)
    }
  }, [searchOpen, pageRefs])

  const applyHighlights = useCallback((query) => {
    if (cleanPagesRef.current === null) {
      cleanPagesRef.current = {}
      pageIds.forEach(pid => {
        cleanPagesRef.current[pid] = pageRefs.current[pid]?.innerHTML || ''
      })
    }
    if (!query.trim()) {
      Object.entries(cleanPagesRef.current).forEach(([pid, html]) => {
        const el = pageRefs.current[pid]
        if (el) el.innerHTML = html
      })
      cleanPagesRef.current = null
      setMatchCount(0)
      return
    }
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi')
    let total = 0
    let firstMark = null
    pageIds.forEach(pid => {
      const el = pageRefs.current[pid]
      if (!el) return
      const clean = cleanPagesRef.current[pid] || ''
      el.innerHTML = clean.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, text) => {
        if (tag) return tag
        if (text) return text.replace(regex, '<mark class="search-highlight">$1</mark>')
        return m
      })
      const marks = el.querySelectorAll('mark.search-highlight')
      total += marks.length
      if (!firstMark && marks.length > 0) firstMark = marks[0]
    })
    setMatchCount(total)
    firstMark?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [pageIds, pageRefs])

  const handleSearchChange = useCallback((e) => {
    const q = e.target.value
    setSearchQuery(q)
    applyHighlights(q)
  }, [applyHighlights])

  const handleSearchKey = useCallback((e) => {
    if (e.key === 'Enter' && matchCount > 0) {
      const allMarks = pageIds.flatMap(pid => [
        ...(pageRefs.current[pid]?.querySelectorAll('mark.search-highlight') ?? [])
      ])
      if (allMarks.length) {
        matchIndexRef.current = (matchIndexRef.current + 1) % allMarks.length
        allMarks[matchIndexRef.current].scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    if (e.key === 'Escape') {
      setSearchOpen(false)
      setSearchQuery('')
      matchIndexRef.current = 0
    }
  }, [matchCount, pageIds, pageRefs])

  const toggleSearch = useCallback(() => {
    setSearchOpen(prev => {
      if (!prev) setTimeout(() => searchInputRef.current?.focus(), 50)
      else { setSearchQuery(''); matchIndexRef.current = 0 }
      return !prev
    })
  }, [])

  // Returns clean HTML (no highlight marks) for each page — used by saveNote
  const getCleanContent = useCallback((pIds) => {
    return pIds.map(pid => {
      if (cleanPagesRef.current?.[pid] !== undefined) return cleanPagesRef.current[pid]
      return pageRefs.current[pid]?.innerHTML || ''
    })
  }, [pageRefs])

  return {
    searchOpen,
    searchQuery,
    matchCount,
    searchInputRef,
    handleSearchChange,
    handleSearchKey,
    toggleSearch,
    getCleanContent,
  }
}
