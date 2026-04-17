import { useRef } from 'react'
import './FormatToolbar.css'

const FONT_SIZES = [
  { label: 'Small', value: '1' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '5' },
  { label: 'X-Large', value: '7' },
]

function exec(command, value = null) {
  document.execCommand(command, false, value)
}

export default function FormatToolbar() {
  const savedSelectionRef = useRef(null)

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
  }

  const restoreSelection = () => {
    const sel = window.getSelection()
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedSelectionRef.current)
    }
  }

  return (
    <div className="format-toolbar">
      <select
        className="font-size-select"
        defaultValue=""
        onMouseDown={saveSelection}
        onChange={e => { restoreSelection(); exec('fontSize', e.target.value); saveSelection(); e.target.value = '' }}
      >
        <option value="" disabled>Size</option>
        {FONT_SIZES.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      <div className="toolbar-divider" />

      <button className="fmt-btn" onMouseDown={e => e.preventDefault()} onClick={() => exec('bold')} title="Bold"><b>B</b></button>
      <button className="fmt-btn italic" onMouseDown={e => e.preventDefault()} onClick={() => exec('italic')} title="Italic"><i>I</i></button>
      <button className="fmt-btn underline" onMouseDown={e => e.preventDefault()} onClick={() => exec('underline')} title="Underline"><u>U</u></button>

      <div className="toolbar-divider" />

      <label className="color-picker-label" title="Text color" onMouseDown={saveSelection}>
        <span className="color-picker-icon text-color-icon">A</span>
        <input type="color" defaultValue="#000000"
          onInput={e => { restoreSelection(); exec('foreColor', e.target.value); saveSelection() }}
          onChange={e => { restoreSelection(); exec('foreColor', e.target.value); saveSelection() }} />
      </label>

      <label className="color-picker-label" title="Highlight color" onMouseDown={saveSelection}>
        <span className="color-picker-icon highlight-icon">H</span>
        <input type="color" defaultValue="#FFFF00"
          onInput={e => { restoreSelection(); exec('hiliteColor', e.target.value); saveSelection() }}
          onChange={e => { restoreSelection(); exec('hiliteColor', e.target.value); saveSelection() }} />
      </label>
    </div>
  )
}
