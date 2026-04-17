import { useCallback } from 'react'

const PAGE_HEIGHT = 25 * 32 // 800px — 25 lines × 32px line-height

function moveCursorToStart(el) {
  if (!el) return
  el.focus()
  const range = document.createRange()
  range.setStart(el, 0)
  range.collapse(true)
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)
}

function moveCursorToEnd(el) {
  if (!el) return
  el.focus()
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  window.getSelection().removeAllRanges()
  window.getSelection().addRange(range)
}

export function usePagination(pageIds, setPageIds, pageRefs) {
  const handlePageInput = useCallback((pageId, pageIndex) => {
    const el = pageRefs.current[pageId]
    if (!el || el.scrollHeight <= PAGE_HEIGHT) return

    const overflow = []
    while (el.scrollHeight > PAGE_HEIGHT && el.childNodes.length > 0) {
      const node = el.lastChild
      el.removeChild(node)
      overflow.unshift(node)
    }
    if (overflow.length === 0) return

    const isLastPage = pageIndex === pageIds.length - 1

    if (isLastPage) {
      const newId = `page-${Date.now()}`
      setPageIds(prev => [...prev, newId])
      requestAnimationFrame(() => {
        const nextEl = pageRefs.current[newId]
        if (nextEl) {
          overflow.forEach(n => nextEl.appendChild(n))
          moveCursorToStart(nextEl)
        }
      })
    } else {
      const nextId = pageIds[pageIndex + 1]
      const nextEl = pageRefs.current[nextId]
      if (nextEl) {
        const anchor = nextEl.firstChild
        overflow.reverse().forEach(n => {
          anchor ? nextEl.insertBefore(n, anchor) : nextEl.appendChild(n)
        })
        moveCursorToStart(nextEl)
      }
    }
  }, [pageIds, setPageIds, pageRefs])

  const handlePageKeyDown = useCallback((pageId, pageIndex, e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '\u00a0\u00a0\u00a0\u00a0')
      return
    }
    if (e.key === 'Backspace' && pageIndex > 0) {
      const el = pageRefs.current[pageId]
      if (!el) return
      const isEmpty = el.innerHTML === '' || el.innerHTML === '<br>'
      if (isEmpty) {
        e.preventDefault()
        const prevId = pageIds[pageIndex - 1]
        setPageIds(prev => prev.filter(pid => pid !== pageId))
        requestAnimationFrame(() => moveCursorToEnd(pageRefs.current[prevId]))
      }
    }
  }, [pageIds, setPageIds, pageRefs])

  return { handlePageInput, handlePageKeyDown }
}
